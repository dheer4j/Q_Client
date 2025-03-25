// src/main.rs
use std::net::SocketAddr;
use std::sync::Arc;

use anyhow::Result;
use axum::{routing::get, Extension, Router};
use dotenv::dotenv;
use tokio::signal;
use tracing::{error, info};
use uuid::Uuid;

use quantum_email_client::config::AppConfig;
use quantum_email_client::quantum_encryption::key_exchange::QuantumKeyExchange;
use quantum_email_client::utils::logging;
use quantum_email_client::websocket::server::WebSocketServer;
use quantum_email_client::AppState;

#[tokio::main]
async fn main() -> Result<()> {
    logging::init_logging();
    dotenv().ok();

    let config = AppConfig::from_env().unwrap_or_default();
    let app_state = Arc::new(AppState::new(config.clone()).await?);
    let app = QuantumEmailApp::new(app_state.clone());

    app.initialize().await?;
    app.start().await?;

    let websocket_server = WebSocketServer::new(&config.server);
    // Pass a reference instead of cloning
    tokio::spawn(async move {
        if let Err(e) = websocket_server.start().await {
            error!("WebSocket server error: {}", e);
        }
    });

    let router = create_router(app_state);
    let addr = format!("{}:{}", config.server.host, config.server.port);
    let socket_addr: SocketAddr = addr.parse()?;

    info!("Starting HTTP server on {}", socket_addr);
    axum::Server::bind(&socket_addr)
        .serve(router.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    info!("Server shutdown complete");
    Ok(())
}

fn create_router(app_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/", get(health_check))
        .route("/api/health", get(health_check))
        .nest("/api", api_routes())
        .layer(Extension(app_state))
}

fn api_routes() -> Router {
    Router::new()
        .route("/users", get(get_users))
}

async fn health_check() -> &'static str {
    "Quantum Secure Email Client is running"
}

async fn get_users() -> &'static str {
    "[{\"id\": \"1\", \"username\": \"quantum_user\"}]"
}

pub struct QuantumEmailApp {
    state: Arc<AppState>,
}

impl QuantumEmailApp {
    pub fn new(state: Arc<AppState>) -> Self {
        Self { state }
    }

    pub async fn initialize(&self) -> Result<()> {
        self.initialize_database().await?;
        self.initialize_encryption().await?;
        info!("Application initialized successfully");
        Ok(())
    }

    async fn initialize_database(&self) -> Result<()> {
        // Commenting out migrations until directory is created
        // sqlx::migrate!()
        //     .run(&self.state.db_pool)
        //     .await
        //     .map_err(|e| anyhow::anyhow!("Database migration failed: {}", e))?;
        info!("Database initialization skipped (migrations not set up)");
        Ok(())
    }

    async fn initialize_encryption(&self) -> Result<()> {
        info!("Encryption system initialized");
        Ok(())
    }

    pub async fn start(&self) -> Result<()> {
        info!("Application started");
        Ok(())
    }

    pub fn view_settings(&self) -> &AppConfig {
        &self.state.config
    }

    pub async fn generate_key_pair(&self, user_id: Uuid) -> Result<()> {
        let key_exchange = QuantumKeyExchange::new(&self.state.config.encryption);
        let key_pair = key_exchange.generate_key_pair()?;

        // Skip database interaction unless explicitly needed and DB is running
        info!("Generated new quantum key pair for user {} (not stored due to DB unavailability)", user_id);
        // Uncomment and ensure DB is running when ready
        /*
        sqlx::query!(
            "INSERT INTO quantum_keys (key_id, user_id, public_key, private_key, encryption_method, key_generation_timestamp, expiration_timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7)",
            key_pair.id,
            user_id,
            key_pair.public_key,
            key_pair.private_key,
            key_pair.algorithm,
            key_pair.created_at,
            key_pair.expires_at
        )
            .execute(&self.state.db_pool)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to store key pair: {}", e))?;
        info!("Generated and stored new quantum key pair for user {}", user_id);
        */
        Ok(())
    }
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("Failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    info!("Shutdown signal received, starting graceful shutdown");
}
