// src/utils/logging.rs
use tracing::subscriber::set_global_default;
use tracing_subscriber::{layer::SubscriberExt, EnvFilter, fmt};
use std::env;

pub fn init_logging() {
    let fmt_layer = fmt::layer()
        .with_target(true)
        .with_thread_ids(true)
        .with_thread_names(true)
        .with_line_number(true);

    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    let subscriber = tracing_subscriber::registry()
        .with(env_filter)
        .with(fmt_layer);

    set_global_default(subscriber)
        .expect("Failed to set global default subscriber");

    tracing::info!("Logging system initialized successfully");
}

pub fn log_startup_info(app_name: &str, version: &str, config_path: Option<&str>) {
    tracing::info!("Starting {} v{}", app_name, version);

    if let Some(path) = config_path {
        tracing::info!("Using configuration from: {}", path);
    }

    tracing::info!("System: {} {}", env::consts::OS, env::consts::ARCH);
    // Removed rustc_version_runtime, using a placeholder or omitting
    tracing::info!("Rust version: Unknown (compile-time version not available at runtime)");
}

pub fn log_security_event(event_type: &str, user_id: Option<&str>, details: &str) {
    let user_context = user_id.map_or("anonymous".to_string(), |id| id.to_string());

    tracing::warn!(
        event_type = event_type,
        user = user_context.as_str(),
        "Security event: {}",
        details
    );
}

pub fn log_performance(operation: &str, duration_ms: u64) {
    tracing::debug!(
        operation = operation,
        duration_ms = duration_ms,
        "Performance measurement"
    );
}

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_logging_initialization() {
        init_logging();
        tracing::info!("Test log after initialization");
    }

    #[test]
    fn test_startup_info() {
        init_logging();
        log_startup_info("Quantum Email", "1.0.0", Some("/etc/config.toml"));
        log_startup_info("Quantum Email", "1.0.0", None);
    }

    #[test]
    fn test_security_event() {
        init_logging();
        log_security_event("login_attempt", Some("user123"), "Failed login");
        log_security_event("access_denied", None, "Unauthorized access");
    }

    #[test]
    fn test_performance_log() {
        init_logging();
        log_performance("email_encryption", 150);
    }

    #[test]
    fn test_encryption_operation() {
        init_logging();
        log_encryption_operation("encrypt", "kyber", true);
        log_encryption_operation("decrypt", "kyber", false);
    }
}
