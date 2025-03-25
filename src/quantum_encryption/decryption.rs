// src/quantum_encryption/decryption.rs
use anyhow::Result;
use sha3::{Digest, Sha3_256};
use aes_gcm::{Aes256Gcm, Key, KeyInit, Nonce}; // Explicitly import required types
use aes_gcm::aead::Aead; // Import Aead trait
use crate::config::EncryptionConfig;
use crate::quantum_encryption::key_exchange::{KeyPair, QuantumKeyExchange};
use tracing::debug;


/// Service for decrypting messages using quantum-resistant algorithms
pub struct DecryptionService {
    config: EncryptionConfig,
}

impl DecryptionService {
    /// Creates a new instance of DecryptionService with the given encryption configuration
    pub fn new(config: &EncryptionConfig) -> Self {
        Self {
            config: config.clone(),
        }
    }

    /// Decrypts a message using a shared secret and AES-GCM
    ///
    /// # Arguments
    /// * `ciphertext` - The encrypted data including the 12-byte nonce (IV) prepended
    /// * `shared_secret` - The shared secret used to derive the decryption key
    ///
    /// # Returns
    /// A Result containing the decrypted plaintext as a Vec<u8> or an error if decryption fails
    pub fn decrypt(&self, ciphertext: &[u8], shared_secret: &[u8]) -> Result<Vec<u8>> {
        if ciphertext.len() < 12 {
            return Err(anyhow::anyhow!("Invalid ciphertext: length must be at least 12 bytes for nonce"));
        }

        let iv = &ciphertext[..12]; // 12-byte nonce for AES-GCM
        let encrypted_data = &ciphertext[12..];

        let key_bytes = self.derive_key(shared_secret)?;
        let key: &Key<Aes256Gcm> = Key::<Aes256Gcm>::from_slice(&key_bytes); // Explicit type annotation
        let cipher = Aes256Gcm::new(key);

        debug!("Attempting to decrypt message with nonce length: {}", iv.len());
        let plaintext = cipher.decrypt(Nonce::from_slice(iv), encrypted_data)
            .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))?;

        Ok(plaintext)
    }

    /// Derives a 32-byte decryption key from the shared secret using SHA3-256
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

    /// Decrypts an email using the recipient's private key and quantum key exchange
    ///
    /// # Arguments
    /// * `encrypted_message` - The encrypted email content (with prepended nonce)
    /// * `encapsulated_secret` - The encapsulated shared secret from the sender
    /// * `recipient_key` - The recipient's quantum key pair
    ///
    /// # Returns
    /// A Result containing the decrypted email as a String or an error if decryption fails
    pub fn decrypt_email(
        &self,
        encrypted_message: &[u8],
        encapsulated_secret: &[u8],
        recipient_key: &KeyPair,
    ) -> Result<String> {
        // Initialize quantum key exchange
        let key_exchange = QuantumKeyExchange::new(&self.config);

        // Decapsulate the shared secret using recipient's private key
        debug!("Decapsulating shared secret for email decryption");
        let shared_secret = key_exchange.decapsulate(&recipient_key.private_key, encapsulated_secret)?;

        // Decrypt the message with the shared secret
        let decrypted_data = self.decrypt(encrypted_message, &shared_secret)?;

        // Convert decrypted bytes to UTF-8 string
        String::from_utf8(decrypted_data)
            .map_err(|e| anyhow::anyhow!("Failed to decode decrypted email to UTF-8: {}", e))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::quantum_encryption::encryption::EncryptionService;

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

        let plaintext = "Hello, Quantum World!".as_bytes();
        let (encapsulated_secret, encrypted_message) = encrypt_service.encrypt_email(
            std::str::from_utf8(plaintext)?,
            &sender_key,
            &recipient_key.public_key,
        )?;

        let decrypted = decrypt_service.decrypt_email(
            &encrypted_message,
            &encapsulated_secret,
            &recipient_key,
        )?;

        assert_eq!(decrypted, "Hello, Quantum World!");
        Ok(())
    }
}
