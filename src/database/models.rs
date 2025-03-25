use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use time::OffsetDateTime;
use uuid::Uuid;

/// User model representing a user in the system
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub user_id: Uuid,
    pub username: String,
    pub email: String,
    pub quantum_public_key: Vec<u8>,
    pub authentication_method: String,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

/// Email model representing an email in the system
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Email {
    pub email_id: Uuid,
    pub sender_id: Uuid,
    pub recipient_id: Uuid,
    pub subject: String,
    pub encrypted_content: Vec<u8>,
    pub encrypted_shared_secret: Vec<u8>,
    pub timestamp: OffsetDateTime,
    pub encryption_method: String,
    pub is_read: bool,
    pub is_starred: bool,
    pub is_archived: bool,
}

/// QuantumKey model representing a quantum key in the system
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct QuantumKey {
    pub key_id: Uuid,
    pub user_id: Uuid,
    pub public_key: Vec<u8>,
    pub private_key: Vec<u8>,
    pub encryption_method: String,
    pub key_generation_timestamp: OffsetDateTime,
    pub expiration_timestamp: OffsetDateTime,
    pub is_active: bool,
}

/// EmailAttachment model representing an attachment to an email
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EmailAttachment {
    pub attachment_id: Uuid,
    pub email_id: Uuid,
    pub filename: String,
    pub content_type: String,
    pub encrypted_content: Vec<u8>,
    pub size_bytes: i64,
}

/// UserSession model representing a user session
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct UserSession {
    pub session_id: Uuid,
    pub user_id: Uuid,
    pub token: String,
    pub created_at: OffsetDateTime,
    pub expires_at: OffsetDateTime,
    pub last_active_at: OffsetDateTime,
    pub ip_address: String,
    pub user_agent: String,
}

/// Contact model representing a user's contact
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Contact {
    pub contact_id: Uuid,
    pub user_id: Uuid,
    pub contact_user_id: Option<Uuid>,
    pub name: String,
    pub email: String,
    pub public_key: Option<Vec<u8>>,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

/// EmailFolder model representing a folder for organizing emails
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EmailFolder {
    pub folder_id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub is_system: bool,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

/// EmailFolderMapping model representing the relationship between emails and folders
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EmailFolderMapping {
    pub mapping_id: Uuid,
    pub email_id: Uuid,
    pub folder_id: Uuid,
    pub user_id: Uuid,
    pub created_at: OffsetDateTime,
}

/// NotificationSetting model representing a user's notification preferences
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct NotificationSetting {
    pub setting_id: Uuid,
    pub user_id: Uuid,
    pub notification_type: String,
    pub is_enabled: bool,
    pub updated_at: OffsetDateTime,
}

/// Implementation for User model
impl User {
    pub fn new(username: String, email: String, quantum_public_key: Vec<u8>, authentication_method: String) -> Self {
        let now = OffsetDateTime::now_utc();
        
        Self {
            user_id: Uuid::new_v4(),
            username,
            email,
            quantum_public_key,
            authentication_method,
            created_at: now,
            updated_at: now,
        }
    }
}

/// Implementation for Email model
impl Email {
    pub fn new(
        sender_id: Uuid,
        recipient_id: Uuid,
        subject: String,
        encrypted_content: Vec<u8>,
        encrypted_shared_secret: Vec<u8>,
        encryption_method: String,
    ) -> Self {
        Self {
            email_id: Uuid::new_v4(),
            sender_id,
            recipient_id,
            subject,
            encrypted_content,
            encrypted_shared_secret,
            timestamp: OffsetDateTime::now_utc(),
            encryption_method,
            is_read: false,
            is_starred: false,
            is_archived: false,
        }
    }
}

/// Implementation for QuantumKey model
impl QuantumKey {
    pub fn new(
        user_id: Uuid,
        public_key: Vec<u8>,
        private_key: Vec<u8>,
        encryption_method: String,
        expiration_days: i64,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        
        Self {
            key_id: Uuid::new_v4(),
            user_id,
            public_key,
            private_key,
            encryption_method,
            key_generation_timestamp: now,
            expiration_timestamp: now + time::Duration::days(expiration_days),
            is_active: true,
        }
    }
}
