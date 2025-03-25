// src/config.rs
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::env;
use dotenv::dotenv;
use tracing::debug;

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
    pub websocket_port: u16,
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

impl AppConfig {
    /// Loads configuration from environment variables
    pub fn from_env() -> Result<Self> {
        dotenv().ok();
        debug!("Loading configuration from environment variables");

        let config = Self {
            server: ServerConfig {
                host: env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
                port: env::var("PORT")
                    .unwrap_or("8080".to_string())
                    .parse()
                    .map_err(|e| anyhow::anyhow!("Invalid PORT: {}", e))?,
                websocket_port: env::var("WEBSOCKET_PORT")
                    .unwrap_or("8081".to_string())
                    .parse()
                    .map_err(|e| anyhow::anyhow!("Invalid WEBSOCKET_PORT: {}", e))?,
            },
            database: DatabaseConfig {
                url: env::var("DATABASE_URL")
                    .map_err(|e| anyhow::anyhow!("DATABASE_URL not set: {}", e))?,
                max_connections: env::var("DB_MAX_CONNECTIONS")
                    .unwrap_or("5".to_string())
                    .parse()
                    .map_err(|e| anyhow::anyhow!("Invalid DB_MAX_CONNECTIONS: {}", e))?,
            },
            encryption: EncryptionConfig {
                key_rotation_days: env::var("KEY_ROTATION_DAYS")
                    .unwrap_or("30".to_string())
                    .parse()
                    .map_err(|e| anyhow::anyhow!("Invalid KEY_ROTATION_DAYS: {}", e))?,
                algorithm: env::var("ENCRYPTION_ALGORITHM").unwrap_or("kyber".to_string()),
                key_size: env::var("KEY_SIZE")
                    .unwrap_or("1024".to_string())
                    .parse()
                    .map_err(|e| anyhow::anyhow!("Invalid KEY_SIZE: {}", e))?,
            },
        };
        debug!("Configuration loaded: {:?}", config);
        Ok(config)
    }

    /// Gets the server URL
    pub fn get_server_url(&self) -> String {
        format!("{}:{}", self.server.host, self.server.port)
    }

    /// Gets the WebSocket URL
    pub fn get_websocket_url(&self) -> String {
        format!("{}:{}", self.server.host, self.server.websocket_port)
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            server: ServerConfig { host: "127.0.0.1".to_string(), port: 8080, websocket_port: 8081 },
            database: DatabaseConfig { url: "postgres://postgres:password@localhost:5432/quantum_email".to_string(), max_connections: 5 },
            encryption: EncryptionConfig { key_rotation_days: 30, algorithm: "kyber".to_string(), key_size: 1024 },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_from_env() -> Result<()> {
        env::set_var("HOST", "localhost");
        env::set_var("PORT", "9000");
        env::set_var("WEBSOCKET_PORT", "9001");
        env::set_var("DATABASE_URL", "postgres://test:test@localhost/test");
        env::set_var("DB_MAX_CONNECTIONS", "10");
        env::set_var("KEY_ROTATION_DAYS", "60");
        env::set_var("ENCRYPTION_ALGORITHM", "kyber-test");
        env::set_var("KEY_SIZE", "2048");

        let config = AppConfig::from_env()?;
        assert_eq!(config.server.host, "localhost");
        assert_eq!(config.server.port, 9000);
        assert_eq!(config.server.websocket_port, 9001);
        assert_eq!(config.database.max_connections, 10);
        assert_eq!(config.encryption.key_rotation_days, 60);
        assert_eq!(config.encryption.algorithm, "kyber-test");
        assert_eq!(config.encryption.key_size, 2048);
        Ok(())
    }

    #[test]
    fn test_config_default() {
        let config = AppConfig::default();
        assert_eq!(config.server.host, "127.0.0.1");
        assert_eq!(config.server.port, 8080);
        assert_eq!(config.server.websocket_port, 8081);
        assert_eq!(config.database.max_connections, 5);
        assert_eq!(config.encryption.key_rotation_days, 30);
        assert_eq!(config.encryption.algorithm, "kyber");
        assert_eq!(config.encryption.key_size, 1024);
    }
}
