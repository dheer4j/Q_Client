use serde::{Deserialize, Serialize};
use std::env;
use dotenv::dotenv;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub jwt_secret: String,
    pub websocket_port: u16,
}

impl ServerConfig {
    pub fn from_env() -> Result<Self, env::VarError> {
        dotenv().ok();
        
        let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = env::var("PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse::<u16>()
            .expect("PORT must be a number");
        let database_url = env::var("DATABASE_URL")?;
        let jwt_secret = env::var("JWT_SECRET")?;
        let websocket_port = env::var("WEBSOCKET_PORT")
            .unwrap_or_else(|_| "8081".to_string())
            .parse::<u16>()
            .expect("WEBSOCKET_PORT must be a number");
        
        Ok(Self {
            host,
            port,
            database_url,
            jwt_secret,
            websocket_port,
        })
    }
    
    pub fn get_server_url(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
    
    pub fn get_websocket_url(&self) -> String {
        format!("{}:{}", self.host, self.websocket_port)
    }
}

// For development and testing purposes
impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: "127.0.0.1".to_string(),
            port: 8080,
            database_url: "postgres://postgres:password@localhost:5432/quantum_email".to_string(),
            jwt_secret: "development_secret_key".to_string(),
            websocket_port: 8081,
        }
    }
}
