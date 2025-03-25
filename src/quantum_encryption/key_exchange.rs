use anyhow::Result;
use pqcrypto_kyber::*;
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::config::EncryptionConfig;
use crate::database::models::QuantumKey;

/// Implements quantum-resistant key exchange using Kyber
pub struct QuantumKeyExchange {
    config: EncryptionConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyPair {
    pub id: Uuid,
    pub public_key: Vec<u8>,
    pub private_key: Vec<u8>,
    pub algorithm: String,
    pub created_at: time::OffsetDateTime,
    pub expires_at: time::OffsetDateTime,
}

impl QuantumKeyExchange {
    pub fn new(config: &EncryptionConfig) -> Self {
        Self {
            config: config.clone(),
        }
    }

    /// Generate a new quantum-resistant key pair
    pub fn generate_key_pair(&self) -> Result<KeyPair> {
        // Use Kyber for post-quantum key exchange
        let (public_key, private_key) = keypair();
        
        let now = time::OffsetDateTime::now_utc();
        let expires_at = now + time::Duration::days(self.config.key_rotation_days as i64);
        
        Ok(KeyPair {
            id: Uuid::new_v4(),
            public_key: public_key.as_bytes().to_vec(),
            private_key: private_key.as_bytes().to_vec(),
            algorithm: self.config.algorithm.clone(),
            created_at: now,
            expires_at,
        })
    }
    
    /// Encapsulate a shared secret using recipient's public key
    pub fn encapsulate(&self, public_key_bytes: &[u8]) -> Result<(Vec<u8>, Vec<u8>)> {
        let public_key = PublicKey::from_bytes(public_key_bytes)
            .map_err(|_| anyhow::anyhow!("Invalid public key format"))?;
            
        let (ciphertext, shared_secret) = encapsulate(&public_key);
        
        Ok((ciphertext.as_bytes().to_vec(), shared_secret.as_bytes().to_vec()))
    }
    
    /// Decapsulate a shared secret using recipient's private key
    pub fn decapsulate(&self, private_key_bytes: &[u8], ciphertext_bytes: &[u8]) -> Result<Vec<u8>> {
        let private_key = SecretKey::from_bytes(private_key_bytes)
            .map_err(|_| anyhow::anyhow!("Invalid private key format"))?;
            
        let ciphertext = Ciphertext::from_bytes(ciphertext_bytes)
            .map_err(|_| anyhow::anyhow!("Invalid ciphertext format"))?;
            
        let shared_secret = decapsulate(&ciphertext, &private_key);
        
        Ok(shared_secret.as_bytes().to_vec())
    }
    
    /// Convert database model to KeyPair
    pub fn from_db_model(key: QuantumKey) -> KeyPair {
        KeyPair {
            id: key.key_id,
            public_key: key.public_key,
            private_key: key.private_key,
            algorithm: key.encryption_method,
            created_at: key.key_generation_timestamp,
            expires_at: key.expiration_timestamp,
        }
    }
    
    /// Check if a key pair is expired
    pub fn is_expired(key_pair: &KeyPair) -> bool {
        key_pair.expires_at < time::OffsetDateTime::now_utc()
    }
}
