use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};
use anyhow::Result;

/// Database schema and migration management
pub struct DatabaseSchema {
    pool: Pool<Postgres>,
}

impl DatabaseSchema {
    /// Create a new DatabaseSchema instance
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;
            
        Ok(Self { pool })
    }
    
    /// Initialize the database schema
    pub async fn initialize(&self) -> Result<()> {
        self.create_tables().await?;
        self.create_indexes().await?;
        
        Ok(())
    }
    
    /// Create all required database tables
    async fn create_tables(&self) -> Result<()> {
        // Users table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS users (
                user_id UUID PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                quantum_public_key BYTEA NOT NULL,
                authentication_method VARCHAR(50) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL
            )
        "#).execute(&self.pool).await?;
        
        // Emails table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS emails (
                email_id UUID PRIMARY KEY,
                sender_id UUID NOT NULL REFERENCES users(user_id),
                recipient_id UUID NOT NULL REFERENCES users(user_id),
                subject VARCHAR(255) NOT NULL,
                encrypted_content BYTEA NOT NULL,
                encrypted_shared_secret BYTEA NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL,
                encryption_method VARCHAR(50) NOT NULL,
                is_read BOOLEAN NOT NULL DEFAULT FALSE,
                is_starred BOOLEAN NOT NULL DEFAULT FALSE,
                is_archived BOOLEAN NOT NULL DEFAULT FALSE
            )
        "#).execute(&self.pool).await?;
        
        // Quantum keys table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS quantum_keys (
                key_id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(user_id),
                public_key BYTEA NOT NULL,
                private_key BYTEA NOT NULL,
                encryption_method VARCHAR(50) NOT NULL,
                key_generation_timestamp TIMESTAMPTZ NOT NULL,
                expiration_timestamp TIMESTAMPTZ NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE
            )
        "#).execute(&self.pool).await?;
        
        // Email attachments table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS email_attachments (
                attachment_id UUID PRIMARY KEY,
                email_id UUID NOT NULL REFERENCES emails(email_id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                content_type VARCHAR(100) NOT NULL,
                encrypted_content BYTEA NOT NULL,
                size_bytes BIGINT NOT NULL
            )
        "#).execute(&self.pool).await?;
        
        // User sessions table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS user_sessions (
                session_id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                token VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMPTZ NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                last_active_at TIMESTAMPTZ NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                user_agent VARCHAR(255) NOT NULL
            )
        "#).execute(&self.pool).await?;
        
        // Contacts table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS contacts (
                contact_id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                contact_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                public_key BYTEA,
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL,
                UNIQUE(user_id, email)
            )
        "#).execute(&self.pool).await?;
        
        // Email folders table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS email_folders (
                folder_id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                is_system BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL,
                UNIQUE(user_id, name)
            )
        "#).execute(&self.pool).await?;
        
        // Email folder mappings table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS email_folder_mappings (
                mapping_id UUID PRIMARY KEY,
                email_id UUID NOT NULL REFERENCES emails(email_id) ON DELETE CASCADE,
                folder_id UUID NOT NULL REFERENCES email_folders(folder_id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL,
                UNIQUE(email_id, folder_id, user_id)
            )
        "#).execute(&self.pool).await?;
        
        // Notification settings table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS notification_settings (
                setting_id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                notification_type VARCHAR(50) NOT NULL,
                is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                updated_at TIMESTAMPTZ NOT NULL,
                UNIQUE(user_id, notification_type)
            )
        "#).execute(&self.pool).await?;
        
        Ok(())
    }
    
    /// Create database indexes for performance
    async fn create_indexes(&self) -> Result<()> {
        // Emails indexes
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_emails_sender_id ON emails(sender_id)")
            .execute(&self.pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_emails_recipient_id ON emails(recipient_id)")
            .execute(&self.pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_emails_timestamp ON emails(timestamp)")
            .execute(&self.pool).await?;
            
        // Quantum keys indexes
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_quantum_keys_user_id ON quantum_keys(user_id)")
            .execute(&self.pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_quantum_keys_expiration ON quantum_keys(expiration_timestamp)")
            .execute(&self.pool).await?;
            
        // User sessions indexes
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)")
            .execute(&self.pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)")
            .execute(&self.pool).await?;
            
        // Contacts indexes
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id)")
            .execute(&self.pool).await?;
            
        // Email folder mappings indexes
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_email_folder_mappings_email_id ON email_folder_mappings(email_id)")
            .execute(&self.pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_email_folder_mappings_folder_id ON email_folder_mappings(folder_id)")
            .execute(&self.pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_email_folder_mappings_user_id ON email_folder_mappings(user_id)")
            .execute(&self.pool).await?;
            
        Ok(())
    }
    
    /// Get the database connection pool
    pub fn pool(&self) -> &Pool<Postgres> {
        &self.pool
    }
}
