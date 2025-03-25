// src/websocket/connection.rs
use std::sync::{Arc, Mutex};
use anyhow::Result;
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;
use uuid::Uuid;
use tracing::{debug, error};

use crate::database::models::User;
use crate::websocket::server::WebSocketMessage;

/// Represents a client connection to the WebSocket server
#[derive(Clone)]
pub struct ClientConnection {
    pub id: Uuid,
    pub user: Option<User>,
    pub sender: mpsc::UnboundedSender<Message>,
    pub is_authenticated: bool,
}

impl ClientConnection {
    /// Creates a new WebSocket client connection
    pub fn new(sender: mpsc::UnboundedSender<Message>) -> Self {
        let id = Uuid::new_v4();
        debug!("Created new client connection with ID: {}", id);
        Self {
            id,
            user: None,
            sender,
            is_authenticated: false,
        }
    }

    /// Sends a message to this client
    ///
    /// # Arguments
    /// * `message` - The WebSocketMessage to send
    ///
    /// # Returns
    /// A Result indicating success or failure
    pub fn send(&self, message: WebSocketMessage) -> Result<()> {
        let message_json = serde_json::to_string(&message)
            .map_err(|e| anyhow::anyhow!("Failed to serialize message: {}", e))?;
        self.sender.send(Message::Text(message_json))
            .map_err(|e| anyhow::anyhow!("Failed to send message to client {}: {}", self.id, e))?;
        debug!("Sent message to client {}", self.id);
        Ok(())
    }

    /// Sets the user for this connection and marks it as authenticated
    pub fn set_user(&mut self, user: User) {
        debug!("Setting user {} for connection {}", user.user_id, self.id);
        self.user = Some(user);
        self.is_authenticated = true;
    }

    /// Checks if this connection belongs to the specified user
    pub fn belongs_to_user(&self, user_id: Uuid) -> bool {
        self.user.as_ref().map_or(false, |user| user.user_id == user_id)
    }
}

/// Connection pool for managing active WebSocket connections
pub struct ConnectionPool {
    connections: Arc<Mutex<Vec<ClientConnection>>>,
}

impl ConnectionPool {
    /// Creates a new empty connection pool
    pub fn new() -> Self {
        debug!("Initializing new WebSocket connection pool");
        Self {
            connections: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Adds a new connection to the pool
    pub fn add(&self, connection: ClientConnection) {
        let mut connections = self.connections.lock().unwrap();
        debug!("Adding connection {} to pool", connection.id);
        connections.push(connection);
    }

    /// Removes a connection from the pool by ID
    pub fn remove(&self, connection_id: Uuid) {
        let mut connections = self.connections.lock().unwrap();
        let initial_len = connections.len();
        connections.retain(|conn| conn.id != connection_id);
        if connections.len() < initial_len {
            debug!("Removed connection {} from pool", connection_id);
        }
    }

    /// Retrieves a connection by ID
    pub fn get(&self, connection_id: Uuid) -> Option<ClientConnection> {
        let connections = self.connections.lock().unwrap();
        connections.iter()
            .find(|conn| conn.id == connection_id)
            .cloned()
    }

    /// Retrieves all connections for a specific user
    pub fn get_by_user(&self, user_id: Uuid) -> Vec<ClientConnection> {
        let connections = self.connections.lock().unwrap();
        connections.iter()
            .filter(|conn| conn.belongs_to_user(user_id))
            .cloned()
            .collect()
    }

    /// Broadcasts a message to all authenticated connections
    pub fn broadcast(&self, message: WebSocketMessage) {
        let connections = self.connections.lock().unwrap();
        debug!("Broadcasting message to {} authenticated connections", 
            connections.iter().filter(|c| c.is_authenticated).count());
        for conn in connections.iter().filter(|c| c.is_authenticated) {
            if let Err(e) = conn.send(message.clone()) {
                error!("Failed to broadcast to connection {}: {}", conn.id, e);
            }
        }
    }

    /// Sends a message to a specific user (all their connections)
    pub fn send_to_user(&self, user_id: Uuid, message: WebSocketMessage) {
        let connections = self.connections.lock().unwrap();
        let targets: Vec<_> = connections.iter()
            .filter(|c| c.belongs_to_user(user_id))
            .collect();
        debug!("Sending message to {} connections for user {}", targets.len(), user_id);
        for conn in targets {
            if let Err(e) = conn.send(message.clone()) {
                error!("Failed to send to connection {} for user {}: {}", conn.id, user_id, e);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::sync::mpsc;
    use crate::websocket::server::WebSocketMessageType;

    #[test]
    fn test_connection_lifecycle() -> Result<()> {
        let (sender, _receiver) = mpsc::unbounded_channel();
        let pool = ConnectionPool::new();

        let mut conn = ClientConnection::new(sender);
        let user = User {
            user_id: Uuid::new_v4(),
            username: "testuser".to_string(),
            email: "test@example.com".to_string(),
            quantum_public_key: vec![1, 2, 3],
            authentication_method: "password".to_string(),
            created_at: time::OffsetDateTime::now_utc(),
            updated_at: time::OffsetDateTime::now_utc(),
        };

        pool.add(conn.clone());
        assert!(pool.get(conn.id).is_some());

        conn.set_user(user.clone());
        assert!(conn.is_authenticated);
        assert!(conn.belongs_to_user(user.user_id));

        pool.remove(conn.id);
        assert!(pool.get(conn.id).is_none());

        Ok(())
    }

    #[test]
    fn test_broadcast_and_send() -> Result<()> {
        let pool = ConnectionPool::new();
        let (sender1, _receiver1) = mpsc::unbounded_channel();
        let (sender2, _receiver2) = mpsc::unbounded_channel();

        let mut conn1 = ClientConnection::new(sender1);
        let user = User {
            user_id: Uuid::new_v4(),
            username: "testuser".to_string(),
            email: "test@example.com".to_string(),
            quantum_public_key: vec![1, 2, 3],
            authentication_method: "password".to_string(),
            created_at: time::OffsetDateTime::now_utc(),
            updated_at: time::OffsetDateTime::now_utc(),
        };
        conn1.set_user(user.clone());

        let conn2 = ClientConnection::new(sender2); // Not authenticated

        pool.add(conn1.clone());
        pool.add(conn2);

        let message = WebSocketMessage {
            message_type: WebSocketMessageType::NewEmail,
            sender_id: Some(user.user_id),
            recipient_id: None,
            payload: serde_json::Value::Null,
            timestamp: time::OffsetDateTime::now_utc(),
        };

        pool.broadcast(message.clone()); // Should only send to conn1
        pool.send_to_user(user.user_id, message); // Should only send to conn1

        Ok(())
    }
}
