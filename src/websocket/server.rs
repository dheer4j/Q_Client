use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;

use crate::config::ServerConfig;
use crate::database::models::User;

type ConnectionId = Uuid;
type UserId = Uuid;
type Connections = Arc<Mutex<HashMap<ConnectionId, WebSocketConnection>>>;
type UserConnections = Arc<Mutex<HashMap<UserId, Vec<ConnectionId>>>>;

/// WebSocket server for real-time communication
pub struct WebSocketServer {
    config: ServerConfig,
    connections: Connections,
    user_connections: UserConnections,
    message_tx: broadcast::Sender<WebSocketMessage>,
}

/// Represents a single WebSocket connection
pub struct WebSocketConnection {
    id: ConnectionId,
    user_id: Option<UserId>,
    sender: tokio::sync::mpsc::UnboundedSender<Message>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketMessage {
    pub message_type: WebSocketMessageType,
    pub sender_id: Option<UserId>,
    pub recipient_id: Option<UserId>,
    pub payload: serde_json::Value,
    pub timestamp: time::OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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
        
        Self {
            config: config.clone(),
            connections: Arc::new(Mutex::new(HashMap::new())),
            user_connections: Arc::new(Mutex::new(HashMap::new())),
            message_tx: tx,
        }
    }
    
    /// Start the WebSocket server
    pub async fn start(&self) -> anyhow::Result<()> {
        let addr = format!("{}:{}", self.config.host, self.config.port);
        let listener = TcpListener::bind(&addr).await?;
        
        tracing::info!("WebSocket server listening on: {}", addr);
        
        while let Ok((stream, addr)) = listener.accept().await {
            tracing::info!("New WebSocket connection from: {}", addr);
            
            let connections = self.connections.clone();
            let user_connections = self.user_connections.clone();
            let message_tx = self.message_tx.clone();
            
            tokio::spawn(async move {
                if let Err(e) = Self::handle_connection(stream, connections, user_connections, message_tx).await {
                    tracing::error!("Error handling WebSocket connection: {}", e);
                }
            });
        }
        
        Ok(())
    }
    
    /// Handle a new WebSocket connection
    async fn handle_connection(
        stream: TcpStream,
        connections: Connections,
        user_connections: UserConnections,
        message_tx: broadcast::Sender<WebSocketMessage>,
    ) -> anyhow::Result<()> {
        let ws_stream = tokio_tungstenite::accept_async(stream).await?;
        let (mut ws_sender, mut ws_receiver) = ws_stream.split();
        
        let connection_id = Uuid::new_v4();
        let (sender, mut receiver) = tokio::sync::mpsc::unbounded_channel();
        
        // Store the connection
        {
            let mut connections_lock = connections.lock().unwrap();
            connections_lock.insert(connection_id, WebSocketConnection {
                id: connection_id,
                user_id: None,
                sender,
            });
        }
        
        // Task for sending messages to the WebSocket
        let send_task = tokio::spawn(async move {
            while let Some(message) = receiver.recv().await {
                if let Err(e) = ws_sender.send(message).await {
                    tracing::error!("Error sending WebSocket message: {}", e);
                    break;
                }
            }
        });
        
        // Task for receiving messages from the WebSocket
        let connections_clone = connections.clone();
        let user_connections_clone = user_connections.clone();
        let message_tx_clone = message_tx.clone();
        
        let receive_task = tokio::spawn(async move {
            while let Some(result) = ws_receiver.next().await {
                match result {
                    Ok(message) => {
                        if let Message::Text(text) = message {
                            if let Ok(ws_message) = serde_json::from_str::<WebSocketMessage>(&text) {
                                // Process the message
                                Self::process_message(
                                    connection_id,
                                    ws_message,
                                    connections_clone.clone(),
                                    user_connections_clone.clone(),
                                    message_tx_clone.clone(),
                                ).await;
                            }
                        }
                    }
                    Err(e) => {
                        tracing::error!("Error receiving WebSocket message: {}", e);
                        break;
                    }
                }
            }
            
            // Connection closed, clean up
            Self::remove_connection(
                connection_id,
                connections_clone,
                user_connections_clone,
                message_tx_clone,
            ).await;
        });
        
        // Wait for either task to complete
        tokio::select! {
            _ = send_task => {},
            _ = receive_task => {},
        }
        
        Ok(())
    }
    
    /// Process an incoming WebSocket message
    async fn process_message(
        connection_id: ConnectionId,
        message: WebSocketMessage,
        connections: Connections,
        user_connections: UserConnections,
        message_tx: broadcast::Sender<WebSocketMessage>,
    ) {
        // Handle authentication and user association
        if message.message_type == WebSocketMessageType::UserOnline && message.sender_id.is_some() {
            let user_id = message.sender_id.unwrap();
            
            // Associate the connection with the user
            {
                let mut connections_lock = connections.lock().unwrap();
                if let Some(connection) = connections_lock.get_mut(&connection_id) {
                    connection.user_id = Some(user_id);
                }
            }
            
            // Add the connection to the user's connections
            {
                let mut user_connections_lock = user_connections.lock().unwrap();
                user_connections_lock
                    .entry(user_id)
                    .or_insert_with(Vec::new)
                    .push(connection_id);
            }
            
            // Broadcast user online status
            let _ = message_tx.send(message);
            return;
        }
        
        // For other message types, broadcast to relevant recipients
        match message.message_type {
            WebSocketMessageType::NewEmail | 
            WebSocketMessageType::EmailRead | 
            WebSocketMessageType::TypingIndicator => {
                // Send to specific recipient
                if let Some(recipient_id) = message.recipient_id {
                    Self::send_to_user(recipient_id, &message, &connections, &user_connections);
                }
            },
            WebSocketMessageType::KeyRotation |
            WebSocketMessageType::EncryptionStatus => {
                // Broadcast to all connections
                let _ = message_tx.send(message);
            },
            _ => {
                // Default: just broadcast
                let _ = message_tx.send(message);
            }
        }
    }
    
    /// Send a message to a specific user
    fn send_to_user(
        user_id: UserId,
        message: &WebSocketMessage,
        connections: &Connections,
        user_connections: &UserConnections,
    ) {
        let connection_ids = {
            let user_connections_lock = user_connections.lock().unwrap();
            user_connections_lock.get(&user_id)
                .map(|ids| ids.clone())
                .unwrap_or_default()
        };
        
        let message_json = serde_json::to_string(message).unwrap_or_default();
        let ws_message = Message::Text(message_json);
        
        let connections_lock = connections.lock().unwrap();
        for &conn_id in &connection_ids {
            if let Some(connection) = connections_lock.get(&conn_id) {
                let _ = connection.sender.send(ws_message.clone());
            }
        }
    }
    
    /// Remove a connection when it's closed
    async fn remove_connection(
        connection_id: ConnectionId,
        connections: Connections,
        user_connections: UserConnections,
        message_tx: broadcast::Sender<WebSocketMessage>,
    ) {
        let user_id = {
            let mut connections_lock = connections.lock().unwrap();
            let user_id = connections_lock.get(&connection_id)
                .and_then(|conn| conn.user_id);
            
            connections_lock.remove(&connection_id);
            user_id
        };
        
        if let Some(user_id) = user_id {
            // Remove from user connections
            {
                let mut user_connections_lock = user_connections.lock().unwrap();
                if let Some(connections) = user_connections_lock.get_mut(&user_id) {
                    connections.retain(|&id| id != connection_id);
                    
                    // If no more connections, remove the user entry
                    if connections.is_empty() {
                        user_connections_lock.remove(&user_id);
                        
                        // Broadcast user offline status
                        let offline_message = WebSocketMessage {
                            message_type: WebSocketMessageType::UserOffline,
                            sender_id: Some(user_id),
                            recipient_id: None,
                            payload: serde_json::Value::Null,
                            timestamp: time::OffsetDateTime::now_utc(),
                        };
                        
                        let _ = message_tx.send(offline_message);
                    }
                }
            }
        }
    }
}
