use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;

use crate::database::models::User;
use crate::websocket::server::WebSocketMessage;

/// Represents a client connection to the WebSocket server
pub struct ClientConnection {
    pub id: Uuid,
    pub user: Option<User>,
    pub sender: mpsc::UnboundedSender<Message>,
    pub is_authenticated: bool,
}

impl ClientConnection {
    pub fn new(sender: mpsc::UnboundedSender<Message>) -> Self {
        Self {
            id: Uuid::new_v4(),
            user: None,
            sender,
            is_authenticated: false,
        }
    }
    
    /// Send a message to this client
    pub fn send(&self, message: WebSocketMessage) -> anyhow::Result<()> {
        let message_json = serde_json::to_string(&message)?;
        self.sender.send(Message::Text(message_json))
            .map_err(|e| anyhow::anyhow!("Failed to send message: {}", e))
    }
    
    /// Set the user for this connection
    pub fn set_user(&mut self, user: User) {
        self.user = Some(user);
        self.is_authenticated = true;
    }
    
    /// Check if this connection belongs to the specified user
    pub fn belongs_to_user(&self, user_id: Uuid) -> bool {
        self.user.as_ref().map_or(false, |user| user.user_id == user_id)
    }
}

/// Connection pool for managing active WebSocket connections
pub struct ConnectionPool {
    connections: Arc<Mutex<Vec<ClientConnection>>>,
}

impl ConnectionPool {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(Mutex::new(Vec::new())),
        }
    }
    
    /// Add a new connection to the pool
    pub fn add(&self, connection: ClientConnection) {
        let mut connections = self.connections.lock().unwrap();
        connections.push(connection);
    }
    
    /// Remove a connection from the pool
    pub fn remove(&self, connection_id: Uuid) {
        let mut connections = self.connections.lock().unwrap();
        connections.retain(|conn| conn.id != connection_id);
    }
    
    /// Get a connection by ID
    pub fn get(&self, connection_id: Uuid) -> Option<ClientConnection> {
        let connections = self.connections.lock().unwrap();
        connections.iter()
            .find(|conn| conn.id == connection_id)
            .cloned()
    }
    
    /// Get all connections for a specific user
    pub fn get_by_user(&self, user_id: Uuid) -> Vec<ClientConnection> {
        let connections = self.connections.lock().unwrap();
        connections.iter()
            .filter(|conn| conn.belongs_to_user(user_id))
            .cloned()
            .collect()
    }
    
    /// Broadcast a message to all authenticated connections
    pub fn broadcast(&self, message: WebSocketMessage) {
        let connections = self.connections.lock().unwrap();
        for conn in connections.iter().filter(|c| c.is_authenticated) {
            let _ = conn.send(message.clone());
        }
    }
    
    /// Send a message to a specific user (all their connections)
    pub fn send_to_user(&self, user_id: Uuid, message: WebSocketMessage) {
        let connections = self.connections.lock().unwrap();
        for conn in connections.iter().filter(|c| c.belongs_to_user(user_id)) {
            let _ = conn.send(message.clone());
        }
    }
}
