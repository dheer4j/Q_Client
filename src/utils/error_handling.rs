// src/utils/error_handling.rs
use thiserror::Error;
use serde::Serialize;

/// Application-specific error types
#[derive(Error, Debug)]
pub enum AppError {
    #[error("Authentication error: {0}")]
    AuthenticationError(String),

    #[error("Authorization error: {0}")]
    AuthorizationError(String),

    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),

    #[error("Encryption error: {0}")]
    EncryptionError(String),

    #[error("Decryption error: {0}")]
    DecryptionError(String),

    #[error("Key exchange error: {0}")]
    KeyExchangeError(String),

    #[error("WebSocket error: {0}")]
    WebSocketError(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("Not found: {0}")]
    NotFoundError(String),

    #[error("Internal server error: {0}")]
    InternalServerError(String),

    #[error("External service error: {0}")]
    ExternalServiceError(String),

    #[error("Configuration error: {0}")]
    ConfigurationError(String),
}

/// Converts an anyhow::Error into an AppError
impl From<anyhow::Error> for AppError {
    fn from(error: anyhow::Error) -> Self {
        AppError::InternalServerError(error.to_string())
    }
}

/// HTTP response representation of an AppError
#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
    pub status_code: u16,
}

impl ErrorResponse {
    /// Creates a new ErrorResponse instance
    ///
    /// # Arguments
    /// * `error` - The error type identifier
    /// * `message` - The detailed error message
    /// * `status_code` - The HTTP status code
    pub fn new(error: &str, message: &str, status_code: u16) -> Self {
        Self {
            error: error.to_string(),
            message: message.to_string(),
            status_code,
        }
    }
}

/// Converts an AppError into an ErrorResponse with appropriate HTTP status code
impl From<AppError> for ErrorResponse {
    fn from(error: AppError) -> Self {
        match &error {
            AppError::AuthenticationError(_) => {
                ErrorResponse::new("AUTHENTICATION_ERROR", &error.to_string(), 401)
            }
            AppError::AuthorizationError(_) => {
                ErrorResponse::new("AUTHORIZATION_ERROR", &error.to_string(), 403)
            }
            AppError::ValidationError(_) => {
                ErrorResponse::new("VALIDATION_ERROR", &error.to_string(), 400)
            }
            AppError::NotFoundError(_) => {
                ErrorResponse::new("NOT_FOUND", &error.to_string(), 404)
            }
            AppError::DatabaseError(_) => {
                ErrorResponse::new("DATABASE_ERROR", &error.to_string(), 500)
            }
            AppError::EncryptionError(_) => {
                ErrorResponse::new("ENCRYPTION_ERROR", &error.to_string(), 500)
            }
            AppError::DecryptionError(_) => {
                ErrorResponse::new("DECRYPTION_ERROR", &error.to_string(), 500)
            }
            AppError::KeyExchangeError(_) => {
                ErrorResponse::new("KEY_EXCHANGE_ERROR", &error.to_string(), 500)
            }
            AppError::WebSocketError(_) => {
                ErrorResponse::new("WEBSOCKET_ERROR", &error.to_string(), 500)
            }
            AppError::InternalServerError(_) => {
                ErrorResponse::new("INTERNAL_SERVER_ERROR", &error.to_string(), 500)
            }
            AppError::ExternalServiceError(_) => {
                ErrorResponse::new("EXTERNAL_SERVICE_ERROR", &error.to_string(), 500)
            }
            AppError::ConfigurationError(_) => {
                ErrorResponse::new("CONFIGURATION_ERROR", &error.to_string(), 500)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_response_creation() {
        let error = AppError::AuthenticationError("Invalid credentials".to_string());
        let response: ErrorResponse = error.into();

        assert_eq!(response.error, "AUTHENTICATION_ERROR");
        assert_eq!(response.message, "Authentication error: Invalid credentials");
        assert_eq!(response.status_code, 401);
    }

    #[test]
    fn test_anyhow_conversion() {
        let anyhow_error = anyhow::anyhow!("Something went wrong");
        let app_error: AppError = anyhow_error.into();

        if let AppError::InternalServerError(msg) = app_error {
            assert_eq!(msg, "Something went wrong");
        } else {
            panic!("Expected InternalServerError");
        }
    }

    #[test]
    fn test_specific_error_types() {
        let errors = vec![
            (AppError::NotFoundError("User not found".to_string()), "NOT_FOUND", 404),
            (AppError::ValidationError("Invalid email".to_string()), "VALIDATION_ERROR", 400),
            (AppError::EncryptionError("Key failure".to_string()), "ENCRYPTION_ERROR", 500),
        ];

        for (error, expected_type, expected_code) in errors {
            let response: ErrorResponse = error.into();
            assert_eq!(response.error, expected_type);
            assert_eq!(response.status_code, expected_code);
        }
    }
}
