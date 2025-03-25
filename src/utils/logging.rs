use tracing::{Level, subscriber::set_global_default};
use tracing_subscriber::{layer::SubscriberExt, EnvFilter, fmt};

/// Initialize the application logging system
pub fn init_logging() {
    // Create a formatting layer with timestamps
    let fmt_layer = fmt::layer()
        .with_target(true)
        .with_thread_ids(true)
        .with_thread_names(true);
    
    // Create an environment filter that respects the RUST_LOG environment variable
    // Default to INFO level if not specified
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));
    
    // Combine the layers
    let subscriber = tracing_subscriber::registry()
        .with(env_filter)
        .with(fmt_layer);
    
    // Set the subscriber as global default
    set_global_default(subscriber)
        .expect("Failed to set global default subscriber");
    
    tracing::info!("Logging initialized");
}

/// Log an application startup message
pub fn log_startup_info(app_name: &str, version: &str, config_path: Option<&str>) {
    tracing::info!("Starting {} v{}", app_name, version);
    
    if let Some(path) = config_path {
        tracing::info!("Using configuration from: {}", path);
    }
    
    // Log system information
    tracing::info!("System: {} {}", std::env::consts::OS, std::env::consts::ARCH);
    
    // Log Rust version
    tracing::info!("Rust version: {}", rustc_version_runtime::version());
}

/// Log a security-related event
pub fn log_security_event(event_type: &str, user_id: Option<&str>, details: &str) {
    let user_context = user_id.map_or("anonymous".to_string(), |id| id.to_string());
    
    tracing::warn!(
        event_type = event_type,
        user = user_context,
        "Security event: {}",
        details
    );
}

/// Log a performance metric
pub fn log_performance(operation: &str, duration_ms: u64) {
    tracing::debug!(
        operation = operation,
        duration_ms = duration_ms,
        "Performance measurement"
    );
}

/// Log an encryption operation
pub fn log_encryption_operation(operation_type: &str, algorithm: &str, success: bool) {
    if success {
        tracing::debug!(
            operation = operation_type,
            algorithm = algorithm,
            "Encryption operation completed successfully"
        );
    } else {
        tracing::error!(
            operation = operation_type,
            algorithm = algorithm,
            "Encryption operation failed"
        );
    }
}
