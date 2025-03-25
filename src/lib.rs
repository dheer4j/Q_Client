// src/lib.rs
pub mod quantum_encryption;
pub mod websocket;
pub mod database;
pub mod utils;
pub mod config;

use anyhow::Result;
use tracing::info;

use crate::config::AppConfig;
use crate::quantum_encryption::encryption::EncryptionService;

/// Application state holding configuration, database pool, and encryption service
pub struct AppState {
    pub config: AppConfig,
    pub db_pool: sqlx::PgPool,
    pub encryption_service: EncryptionService,
}

impl AppState {
    /// Creates a new AppState instance with the given configuration
    ///
    /// # Arguments
    /// * `config` - The application configuration
    ///
    /// # Returns
    /// A Result containing the initialized AppState or an error if initialization fails
    pub async fn new(config: AppConfig) -> Result<Self> {
        info!("Initializing AppState with database URL: {}", config.database.url);
        let db_pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(config.database.max_connections)
            .connect(&config.database.url)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to connect to database: {}", e))?;

        let encryption_service = EncryptionService::new(&config.encryption);
        info!("AppState initialized successfully");

        Ok(Self {
            config,
            db_pool,
            encryption_service,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_app_state_creation() -> Result<()> {
        let config = AppConfig {
            server: config::ServerConfig {
                host: "127.0.0.1".to_string(),
                port: 8080,
                websocket_port: 8081,
            },
            database: config::DatabaseConfig {
                url: "postgres://postgres:password@localhost:5432/test_db".to_string(),
                max_connections: 5,
            },
            encryption: config::EncryptionConfig {
                key_rotation_days: 30,
                algorithm: "kyber".to_string(),
                key_size: 1024,
            },
        };

        // Note: This test assumes a running PostgreSQL instance at the specified URL
        // In a real test suite, you'd mock the database or use a test container
        match AppState::new(config).await {
            Ok(state) => {
                assert_eq!(state.config.server.port, 8080);
                assert_eq!(state.config.encryption.algorithm, "kyber");
                Ok(())
            }
            Err(e) => Err(anyhow::anyhow!("Test failed due to database connection: {}", e)),
        }
    }
}
