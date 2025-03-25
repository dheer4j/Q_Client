// src/quantum_encryption/encryption.rs
use anyhow::Result;
use rand::rngs::OsRng;
use rand::RngCore;
use sha3::{Digest, Sha3_256};
use aes_gcm::{Aes256Gcm, Key, KeyInit, Nonce}; // Explicitly import required types
use aes_gcm::aead::Aead; // Import Aead trait
use crate::config::EncryptionConfig;
use crate::quantum_encryption::key_exchange::{KeyPair, QuantumKeyExchange};
use tracing::debug;

/// Service for encrypting messages using quantum-resistant algorithms
pub struct EncryptionService {
    config: EncryptionConfig,
}

impl EncryptionService {
    /// Creates a new instance of EncryptionService with the given encryption configuration
    pub fn new(config: &EncryptionConfig) -> Self {
        Self {
            config: config.clone(),
        }
    }

    /// Encrypts a message using a shared secret and AES-GCM
    ///
    /// # Arguments
    /// * `plaintext` - The data to encrypt
    /// * `shared_secret` - The shared secret used to derive the encryption key
    ///
    /// # Returns
    /// A Result containing the encrypted data (nonce prepended) as a Vec<u8> or an error if encryption fails
    pub fn encrypt(&self, plaintext: &[u8], shared_secret: &[u8]) -> Result<Vec<u8>> {
        let key_bytes = self.derive_key(shared_secret)?;
        let key: &Key<Aes256Gcm> = Key::<Aes256Gcm>::from_slice(&key_bytes); // Explicit type annotation
        let cipher = Aes256Gcm::new(key);

        let mut iv = [0u8; 12]; // 96-bit (12-byte) nonce for AES-GCM
        OsRng.fill_bytes(&mut iv);

        debug!("Encrypting message with nonce length: {}", iv.len());
        let ciphertext = cipher.encrypt(Nonce::from_slice(&iv), plaintext)
            .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;

        let mut result = Vec::with_capacity(iv.len() + ciphertext.len());
        result.extend_from_slice(&iv);
        result.extend_from_slice(&ciphertext);
        Ok(result)
    }

    /// Derives a 32-byte encryption key from the shared secret using SHA3-256
    ///
    /// # Arguments
    /// * `shared_secret` - The shared secret to derive the key from
    ///
    /// # Returns
    /// A Result containing the derived 32-byte key or an error if derivation fails
    fn derive_key(&self, shared_secret: &[u8]) -> Result<[u8; 32]> {
        let mut hasher = Sha3_256::new();
        hasher.update(shared_secret);
        let result = hasher.finalize();

        result.as_slice().try_into()
            .map_err(|_| anyhow::anyhow!("Failed to derive 32-byte key from shared secret"))
    }

    /// Encrypts an email for a recipient using quantum key exchange
    ///
    /// # Arguments
    /// * `plaintext` - The email content to encrypt as a string
    /// * `sender_key` - The sender's quantum key pair (not used directly here but included for future extensions)
    /// * `recipient_public_key` - The recipient's public key for encapsulation
    ///
    /// # Returns
    /// A Result containing a tuple of (encapsulated_secret, encrypted_message) or an error if encryption fails
    pub fn encrypt_email(
        &self,
        plaintext: &str,
        _sender_key: &KeyPair, // Currently unused but kept for potential future use
        recipient_public_key: &[u8],
    ) -> Result<(Vec<u8>, Vec<u8>)> {
        // Use the key exchange to create a shared secret
        let key_exchange = QuantumKeyExchange::new(&self.config);

        // Encapsulate a shared secret for the recipient
        debug!("Encapsulating shared secret for email encryption");
        let (encapsulated_secret, shared_secret) = key_exchange.encapsulate(recipient_public_key)?;

        // Encrypt the message with the shared secret
        let encrypted_message = self.encrypt(plaintext.as_bytes(), &shared_secret)?;

        // Return the encapsulated shared secret and the encrypted message
        Ok((encapsulated_secret, encrypted_message))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::quantum_encryption::decryption::DecryptionService;

    #[test]
    fn test_encrypt_decrypt_roundtrip() -> Result<()> {
        let config = EncryptionConfig {
            key_rotation_days: 30,
            algorithm: "kyber".to_string(),
            key_size: 1024,
        };

        let encrypt_service = EncryptionService::new(&config);
        let decrypt_service = DecryptionService::new(&config);

        let key_exchange = QuantumKeyExchange::new(&config);
        let sender_key = key_exchange.generate_key_pair()?;
        let recipient_key = key_exchange.generate_key_pair()?;

        let plaintext = "Hello, Quantum World!";
        let (encapsulated_secret, encrypted_message) = encrypt_service.encrypt_email(
            plaintext,
            &sender_key,
            &recipient_key.public_key,
        )?;

        let decrypted = decrypt_service.decrypt_email(
            &encrypted_message,
            &encapsulated_secret,
            &recipient_key,
        )?;

        assert_eq!(decrypted, plaintext);
        Ok(())
    }

    #[test]
    fn test_encrypt_basic() -> Result<()> {
        let config = EncryptionConfig {
            key_rotation_days: 30,
            algorithm: "kyber".to_string(),
            key_size: 1024,
        };

        let service = EncryptionService::new(&config);
        let plaintext = "Test message".as_bytes();
        let shared_secret = vec![1, 2, 3, 4, 5]; // Dummy secret for testing
        let encrypted = service.encrypt(plaintext, &shared_secret)?;

        assert!(encrypted.len() >= 12 + plaintext.len()); // Nonce + ciphertext
        Ok(())
    }
}
