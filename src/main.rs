use std::net::SocketAddr;
use std::sync::Arc;

use axum::routing::get;
use axum::{Extension, Router};
use dotenv::dotenv;
use tokio::signal;

use quantum_email_client::config::{self, AppConfig};
use quantum_email_client::database::schema::DatabaseSchema;
use quantum_email_client::quantum_encryption::key_exchange::QuantumKeyExchange;
use quantum_email_client::utils::logging;
use quantum_email_client::websocket::server::WebSocketServer;
use quantum_email_client::AppState;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize logging
    logging::init_logging();
    
    // Load environment variables from .env file if present
    dotenv().ok();
    
    // Log startup information
    logging::log_startup_info(
        "Quantum Secure Email Client", 
        env!("CARGO_PKG_VERSION"),
        None
    );
    
    // Load configuration
    let config = config::load_config()?;
    tracing::info!("Configuration loaded successfully");
    
    // Initialize database
    tracing::info!("Connecting to database at {}", config.database.url);
    let db_schema = DatabaseSchema::new(&config.database.url).await?;
    db_schema.initialize().await?;
    tracing::info!("Database schema initialized");
    
    // Initialize application state
    let app_state = AppState::new(config.clone()).await?;
    let app_state = Arc::new(app_state);
    
    // Initialize WebSocket server
    let websocket_server = WebSocketServer::new(&config.server);
    let websocket_server = Arc::new(websocket_server);
    
    // Clone references for the WebSocket task
    let ws_server = websocket_server.clone();
    
    // Start WebSocket server in a separate task
    tokio::spawn(async move {
        if let Err(e) = ws_server.start().await {
            tracing::error!("WebSocket server error: {}", e);
        }
    });
    
    // Build the API router
    let app = create_router(app_state);
    
    // Bind to the configured address
    let addr = format!("{}:{}", config.server.host, config.server.port);
    let socket_addr: SocketAddr = addr.parse()?;
    
    tracing::info!("Starting server on {}", socket_addr);
    
    // Start the HTTP server
    axum::Server::bind(&socket_addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    
    tracing::info!("Server shutdown complete");
    
    Ok(())
}

/// Create the application router with all routes
fn create_router(app_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/", get(health_check))
        .route("/api/health", get(health_check))
        .nest("/api", api_routes())
        .layer(Extension(app_state))
}

/// API routes
fn api_routes() -> Router {
    Router::new()
        .route("/users", get(get_users))
        // Add more API routes here
}

/// Health check endpoint
async fn health_check() -> &'static str {
    "Quantum Secure Email Client is running"
}

/// Temporary endpoint to get users (to be replaced with proper implementation)
async fn get_users() -> &'static str {
    "[{\"id\": \"1\", \"username\": \"quantum_user\"}]"
}

/// Quantum Email Application implementation
pub struct QuantumEmailApp {
    state: Arc<AppState>,
}

impl QuantumEmailApp {
    /// Create a new QuantumEmailApp instance
    pub fn new(state: Arc<AppState>) -> Self {
        Self { state }
    }
    
    /// Initialize the application
    pub async fn initialize(&self) -> anyhow::Result<()> {
        // Initialize components
        self.initialize_database().await?;
        self.initialize_encryption().await?;
        
        Ok(())
    }
    
    /// Initialize the database connection
    async fn initialize_database(&self) -> anyhow::Result<()> {
        // Database initialization logic
        tracing::info!("Database initialized");
        Ok(())
    }
    
    /// Initialize the encryption system
    async fn initialize_encryption(&self) -> anyhow::Result<()> {
        // Encryption system initialization logic
        tracing::info!("Encryption system initialized");
        Ok(())
    }
    
    /// Start the application
    pub async fn start(&self) -> anyhow::Result<()> {
        tracing::info!("Application started");
        Ok(())
    }
    
    /// View application settings
    pub fn view_settings(&self) -> &config::AppConfig {
        &self.state.config
    }
    
    /// Generate a new quantum key pair
    pub async fn generate_key_pair(&self, user_id: uuid::Uuid) -> anyhow::Result<()> {
        let key_exchange = QuantumKeyExchange::new(&self.state.config.encryption);
        let key_pair = key_exchange.generate_key_pair()?;
        
        tracing::info!("Generated new quantum key pair for user {}", user_id);
        
        // TODO: Store the key pair in the database
        
        Ok(())
    }
}

/// Signal handler for graceful shutdown
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

    tracing::info!("Shutdown signal received, starting graceful shutdown");
}
