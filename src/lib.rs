// Quantum Secure Email Client - Core Library
// This file defines the module structure for the application

pub mod quantum_encryption;
pub mod websocket;
pub mod database;
pub mod utils;
pub mod config;

// Re-export commonly used items
pub use crate::quantum_encryption::key_exchange::QuantumKeyExchange;
pub use crate::quantum_encryption::encryption::EncryptionService;
pub use crate::quantum_encryption::decryption::DecryptionService;
pub use crate::websocket::server::WebSocketServer;
pub use crate::database::models::{User, Email, QuantumKey};
pub use crate::utils::error_handling::AppError;
pub use crate::config::ServerConfig;

// Application state
pub struct AppState {
    pub config: ServerConfig,
    pub db_pool: Option<sqlx::PgPool>,
}

impl AppState {
    pub async fn new(config: ServerConfig) -> Result<Self, anyhow::Error> {
        let db_pool = if !config.database_url.is_empty() {
            Some(sqlx::PgPool::connect(&config.database_url).await?)
        } else {
            None
        };
        
        Ok(Self {
            config,
            db_pool,
        })
    }
}
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct AppConfig {
        pub server: ServerConfig,
        pub database: DatabaseConfig,
        pub encryption: EncryptionConfig,
    }
    
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ServerConfig {
        pub host: String,
        pub port: u16,
        pub websocket_path: String,
    }
    
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct DatabaseConfig {
        pub url: String,
        pub max_connections: u32,
    }
    
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct EncryptionConfig {
        pub key_rotation_days: u32,
        pub algorithm: String,
        pub key_size: usize,
    }
    
    impl Default for AppConfig {
        fn default() -> Self {
            Self {
                server: ServerConfig {
                    host: "127.0.0.1".to_string(),
                    port: 8080,
                    websocket_path: "/ws".to_string(),
                },
                database: DatabaseConfig {
                    url: "postgres://postgres:postgres@localhost/quantum_email".to_string(),
                    max_connections: 5,
                },
                encryption: EncryptionConfig {
                    key_rotation_days: 30,
                    algorithm: "kyber".to_string(),
                    key_size: 1024,
                },
            }
        }
    }
    
    pub fn load_config() -> anyhow::Result<AppConfig> {
        // Load config from file or environment variables
        // For now, return the default config
        Ok(AppConfig::default())
    }
}

// Application state
pub struct AppState {
    pub config: config::AppConfig,
    pub db_pool: sqlx::PgPool,
    pub encryption_service: EncryptionService,
}

impl AppState {
    pub async fn new(config: config::AppConfig) -> anyhow::Result<Self> {
        let db_pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(config.database.max_connections)
            .connect(&config.database.url)
            .await?;
            
        let encryption_service = EncryptionService::new(&config.encryption);
        
        Ok(Self {
            config,
            db_pool,
            encryption_service,
        })
    }
}
