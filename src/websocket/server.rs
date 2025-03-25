// src/websocket/server.rs
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use anyhow::Result;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{broadcast, mpsc};
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;
use tracing::{debug, error, info};

use crate::config::ServerConfig;
use time::OffsetDateTime;

type ConnectionId = Uuid;
type UserId = Uuid;
type Connections = Arc<Mutex<HashMap<ConnectionId, WebSocketConnection>>>;
type UserConnections = Arc<Mutex<HashMap<UserId, Vec<ConnectionId>>>>;

pub struct WebSocketServer {
    config: ServerConfig,
    connections: Connections,
    user_connections: UserConnections,
    message_tx: broadcast::Sender<WebSocketMessage>,
}

#[derive(Clone)]
pub struct WebSocketConnection {
    id: ConnectionId,
    user_id: Option<UserId>,
    sender: mpsc::UnboundedSender<Message>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketMessage {
    pub message_type: WebSocketMessageType,
    pub sender_id: Option<UserId>,
    pub recipient_id: Option<UserId>,
    pub payload: serde_json::Value,
    pub timestamp: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum WebSocketMessageType {
    NewEmail,
    EmailRead,
    TypingIndicator,
    UserOnline,
    UserOffline,
    EncryptionStatus,
    KeyRotation,
    Error,
}

impl WebSocketServer {
    pub fn new(config: &ServerConfig) -> Self {
        let (tx, _) = broadcast::channel(100);
        info!("Initialized WebSocket server with buffer size 100");
        Self {
            config: config.clone(),
            connections: Arc::new(Mutex::new(HashMap::new())),
            user_connections: Arc::new(Mutex::new(HashMap::new())),
            message_tx: tx,
        }
    }

    pub async fn start(&self) -> Result<()> {
        let addr = format!("{}:{}", self.config.host, self.config.websocket_port);
        let listener = TcpListener::bind(&addr).await?;
        info!("WebSocket server listening on: {}", addr);

        while let Ok((stream, addr)) = listener.accept().await {
            info!("New WebSocket connection from: {}", addr);
            let connections = Arc::clone(&self.connections);
            let user_connections = Arc::clone(&self.user_connections);
            let message_tx = self.message_tx.clone();

            tokio::spawn(async move {
                if let Err(e) = Self::handle_connection(stream, connections, user_connections, message_tx).await {
                    error!("Error handling WebSocket connection from {}: {}", addr, e);
                }
            });
        }

        Ok(())
    }

    async fn handle_connection(
        stream: TcpStream,
        connections: Connections,
        user_connections: UserConnections,
        message_tx: broadcast::Sender<WebSocketMessage>,
    ) -> Result<()> {
        let ws_stream = tokio_tungstenite::accept_async(stream).await?;
        let (mut ws_sender, mut ws_receiver) = ws_stream.split();

        let connection_id = Uuid::new_v4();
        let (sender, mut receiver) = mpsc::unbounded_channel();

        // Add connection to the connections map
        {
            let mut connections_lock = connections.lock().await;
            connections_lock.insert(connection_id, WebSocketConnection {
                id: connection_id,
                user_id: None,
                sender,
            });
            debug!("Added connection {} to connections", connection_id);
        }

        let send_task = tokio::spawn(async move {
            while let Some(message) = receiver.recv().await {
                if let Err(e) = ws_sender.send(message).await {
                    error!("Error sending WebSocket message for connection {}: {}", connection_id, e);
                    break;
                }
            }
        });

        let connections_clone = Arc::clone(&connections);
        let user_connections_clone = Arc::clone(&user_connections);
        let message_tx_clone = message_tx.clone();

        let receive_task = tokio::spawn(async move {
            while let Some(result) = ws_receiver.next().await {
                match result {
                    Ok(message) => {
                        if let Message::Text(text) = message {
                            match serde_json::from_str::<WebSocketMessage>(&text) {
                                Ok(ws_message) => {
                                    debug!("Received message from connection {}: {:?}", connection_id, ws_message.message_type);
                                    Self::process_message(
                                        connection_id,
                                        ws_message,
                                        Arc::clone(&connections_clone),
                                        Arc::clone(&user_connections_clone),
                                        message_tx_clone.clone(),
                                    ).await;
                                }
                                Err(e) => error!("Failed to deserialize message: {}", e),
                            }
                        }
                    }
                    Err(e) => {
                        error!("Error receiving WebSocket message for connection {}: {}", connection_id, e);
                        break;
                    }
                }
            }

            debug!("Connection {} closed, cleaning up", connection_id);
            Self::remove_connection(
                connection_id,
                Arc::clone(&connections_clone),
                Arc::clone(&user_connections_clone),
                message_tx_clone.clone()
            ).await;
        });

        tokio::select! {
            _ = send_task => debug!("Send task for connection {} completed", connection_id),
            _ = receive_task => debug!("Receive task for connection {} completed", connection_id),
        }

        Ok(())
    }

    async fn process_message(
        connection_id: ConnectionId,
        message: WebSocketMessage,
        connections: Connections,
        user_connections: UserConnections,
        message_tx: broadcast::Sender<WebSocketMessage>,
    ) {
        if message.message_type == WebSocketMessageType::UserOnline && message.sender_id.is_some() {
            let user_id = message.sender_id.unwrap();
            debug!("User {} came online on connection {}", user_id, connection_id);

            // Update connection with user_id
            {
                let mut connections_lock = connections.lock().await;
                if let Some(connection) = connections_lock.get_mut(&connection_id) {
                    connection.user_id = Some(user_id);
                    debug!("Updated connection {} with user_id {}", connection.id, user_id);
                }
            }

            // Add connection to user's connections
            {
                let mut user_connections_lock = user_connections.lock().await;
                user_connections_lock
                    .entry(user_id)
                    .or_insert_with(Vec::new)
                    .push(connection_id);
            }

            // Ignore send error as it's not critical
            let _ = message_tx.send(message);
            return;
        }

        match message.message_type {
            WebSocketMessageType::NewEmail |
            WebSocketMessageType::EmailRead |
            WebSocketMessageType::TypingIndicator => {
                if let Some(recipient_id) = message.recipient_id {
                    debug!("Sending message {:?} to user {}", message.message_type, recipient_id);
                    Self::send_to_user(recipient_id, &message, &connections, &user_connections).await;
                }
            },
            WebSocketMessageType::KeyRotation |
            WebSocketMessageType::EncryptionStatus => {
                debug!("Broadcasting message {:?}", message.message_type);
                let _ = message_tx.send(message);
            },
            _ => {
                debug!("Broadcasting default message {:?}", message.message_type);
                let _ = message_tx.send(message);
            }
        }
    }

    async fn send_to_user(
        user_id: UserId,
        message: &WebSocketMessage,
        connections: &Connections,
        user_connections: &UserConnections,
    ) {
        // Get connection IDs for the user
        let connection_ids = {
            let user_connections_lock = user_connections.lock().await;
            user_connections_lock.get(&user_id)
                .cloned()
                .unwrap_or_default()
        };

        // Serialize message once to avoid repeated serialization
        let message_json = match serde_json::to_string(message) {
            Ok(json) => json,
            Err(e) => {
                error!("Failed to serialize message: {}", e);
                return;
            }
        };
        let ws_message = Message::Text(message_json);

        // Send to all connections for this user
        let mut connections_lock = connections.lock().await;
        for &conn_id in &connection_ids {
            if let Some(connection) = connections_lock.get_mut(&conn_id) {
                if let Err(e) = connection.sender.send(ws_message.clone()) {
                    error!("Failed to send to connection {} for user {}: {}", conn_id, user_id, e);
                }
            }
        }
    }

    async fn remove_connection(
        connection_id: ConnectionId,
        connections: Connections,
        user_connections: UserConnections,
        message_tx: broadcast::Sender<WebSocketMessage>,
    ) {
        // Retrieve and remove user_id for this connection
        let user_id = {
            let mut connections_lock = connections.lock().await;
            let user_id = connections_lock.get(&connection_id).and_then(|conn| conn.user_id);
            connections_lock.remove(&connection_id);
            debug!("Removed connection {} from connections", connection_id);
            user_id
        };

        // Handle user offline status if this was their last connection
        if let Some(user_id) = user_id {
            let mut user_connections_lock = user_connections.lock().await;
            if let Some(connections) = user_connections_lock.get_mut(&user_id) {
                connections.retain(|&id| id != connection_id);

                if connections.is_empty() {
                    user_connections_lock.remove(&user_id);
                    debug!("User {} has no more connections, broadcasting offline status", user_id);

                    let offline_message = WebSocketMessage {
                        message_type: WebSocketMessageType::UserOffline,
                        sender_id: Some(user_id),
                        recipient_id: None,
                        payload: serde_json::Value::Null,
                        timestamp: OffsetDateTime::now_utc(),
                    };

                    // Use a generic error handler instead of specific type
                    if let Err(e) = message_tx.send(offline_message) {
                        error!("Failed to broadcast offline status for user {}: {}", user_id, e);
                    }
                }
            }
        }
    }
}
