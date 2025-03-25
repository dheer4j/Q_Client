// src/quantum_encryption/key_exchange.rs
use anyhow::Result;
use pqcrypto_kyber::kyber1024::{keypair, encapsulate, decapsulate};
use pqcrypto_traits::kem::*;
use pqcrypto_traits::kem::{Ciphertext, PublicKey, SecretKey};
// Import all KEM traits
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::config::EncryptionConfig;
use crate::database::models::QuantumKey;
use tracing::debug;
use time::{OffsetDateTime, Duration};

pub struct QuantumKeyExchange {
    config: EncryptionConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyPair {
    pub id: Uuid,
    pub public_key: Vec<u8>,
    pub private_key: Vec<u8>,
    pub algorithm: String,
    pub created_at: OffsetDateTime,
    pub expires_at: OffsetDateTime,
}

impl QuantumKeyExchange {
    pub fn new(config: &EncryptionConfig) -> Self {
        Self {
            config: config.clone(),
        }
    }

    pub fn generate_key_pair(&self) -> Result<KeyPair> {
        debug!("Generating new Kyber-1024 key pair");
        let (public_key, private_key) = keypair();

        let now = OffsetDateTime::now_utc();
        let expires_at = now + Duration::days(self.config.key_rotation_days as i64);

        Ok(KeyPair {
            id: Uuid::new_v4(),
            public_key: public_key.as_bytes().to_vec(),
            private_key: private_key.as_bytes().to_vec(),
            algorithm: self.config.algorithm.clone(),
            created_at: now,
            expires_at,
        })
    }

    pub fn encapsulate(&self, public_key_bytes: &[u8]) -> Result<(Vec<u8>, Vec<u8>)> {
        debug!("Encapsulating shared secret with public key of length: {}", public_key_bytes.len());
        let public_key = PublicKey::from_bytes(public_key_bytes)
            .map_err(|_| anyhow::anyhow!("Invalid public key format: incorrect length or data"))?;

        let (ciphertext, shared_secret) = encapsulate(&public_key);

        Ok((ciphertext.as_bytes().to_vec(), shared_secret.as_bytes().to_vec()))
    }

    pub fn decapsulate(&self, private_key_bytes: &[u8], ciphertext_bytes: &[u8]) -> Result<Vec<u8>> {
        debug!("Decapsulating shared secret with private key length: {} and ciphertext length: {}",
            private_key_bytes.len(), ciphertext_bytes.len());
        let private_key = SecretKey::from_bytes(private_key_bytes)
            .map_err(|_| anyhow::anyhow!("Invalid private key format: incorrect length or data"))?;

        let ciphertext = Ciphertext::from_bytes(ciphertext_bytes)
            .map_err(|_| anyhow::anyhow!("Invalid ciphertext format: incorrect length or data"))?;

        let shared_secret = decapsulate(&ciphertext, &private_key);

        Ok(shared_secret.as_bytes().to_vec())
    }

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

    pub fn is_expired(key_pair: &KeyPair) -> bool {
        key_pair.expires_at < OffsetDateTime::now_utc()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_key_pair_generation() -> Result<()> {
        let config = EncryptionConfig {
            key_rotation_days: 30,
            algorithm: "kyber".to_string(),
            key_size: 1024,
        };
        let key_exchange = QuantumKeyExchange::new(&config);
        let key_pair = key_exchange.generate_key_pair()?;

        assert_eq!(key_pair.algorithm, "kyber");
        assert!(!key_pair.public_key.is_empty());
        assert!(!key_pair.private_key.is_empty());
        assert!(!QuantumKeyExchange::is_expired(&key_pair));
        Ok(())
    }

    #[test]
    fn test_encapsulate_decapsulate_roundtrip() -> Result<()> {
        let config = EncryptionConfig {
            key_rotation_days: 30,
            algorithm: "kyber".to_string(),
            key_size: 1024,
        };
        let key_exchange = QuantumKeyExchange::new(&config);

        let key_pair = key_exchange.generate_key_pair()?;
        let (ciphertext, shared_secret_enc) = key_exchange.encapsulate(&key_pair.public_key)?;
        let shared_secret_dec = key_exchange.decapsulate(&key_pair.private_key, &ciphertext)?;

        assert_eq!(shared_secret_enc, shared_secret_dec);
        Ok(())
    }

    #[test]
    fn test_key_expiration() -> Result<()> {
        let config = EncryptionConfig {
            key_rotation_days: 0, // Negative to force expiration
            algorithm: "kyber".to_string(),
            key_size: 1024,
        };
        let key_exchange = QuantumKeyExchange::new(&config);
        let key_pair = key_exchange.generate_key_pair()?;

        assert!(QuantumKeyExchange::is_expired(&key_pair));
        Ok(())
    }
}
