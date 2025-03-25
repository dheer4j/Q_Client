use thiserror::Error;

/// Application error types
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

/// Convert anyhow::Error to AppError
impl From<anyhow::Error> for AppError {
    fn from(error: anyhow::Error) -> Self {
        AppError::InternalServerError(error.to_string())
    }
}

/// HTTP response representation of AppError
#[derive(Debug, serde::Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
    pub status_code: u16,
}

impl ErrorResponse {
    pub fn new(error: &str, message: &str, status_code: u16) -> Self {
        Self {
            error: error.to_string(),
            message: message.to_string(),
            status_code,
        }
    }
}

/// Convert AppError to ErrorResponse with appropriate HTTP status code
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
            AppError::DatabaseError(_) | 
            AppError::EncryptionError(_) |
            AppError::DecryptionError(_) |
            AppError::KeyExchangeError(_) |
            AppError::WebSocketError(_) |
            AppError::InternalServerError(_) |
            AppError::ExternalServiceError(_) |
            AppError::ConfigurationError(_) => {
                ErrorResponse::new("INTERNAL_SERVER_ERROR", &error.to_string(), 500)
            }
        }
    }
}
