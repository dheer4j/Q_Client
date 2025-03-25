use anyhow::Result;
use rand::rngs::OsRng;
use rand::RngCore;
use sha3::{Digest, Sha3_256};
use std::convert::TryInto;

use crate::config::EncryptionConfig;
use crate::quantum_encryption::key_exchange::KeyPair;

/// Service for encrypting messages using quantum-resistant algorithms
pub struct EncryptionService {
    config: EncryptionConfig,
}

impl EncryptionService {
    pub fn new(config: &EncryptionConfig) -> Self {
        Self {
            config: config.clone(),
        }
    }
    
    /// Encrypt a message using a shared secret
    pub fn encrypt(&self, plaintext: &[u8], shared_secret: &[u8]) -> Result<Vec<u8>> {
        // Generate a random IV (Initialization Vector)
        let mut iv = [0u8; 16];
        OsRng.fill_bytes(&mut iv);
        
        // Derive encryption key from shared secret using SHA3
        let encryption_key = self.derive_key(shared_secret)?;
        
        // Encrypt the message using AES-GCM or similar
        // For simplicity, we're implementing a basic XOR cipher here
        // In production, use a proper authenticated encryption like AES-GCM
        let mut ciphertext = Vec::with_capacity(plaintext.len() + iv.len());
        ciphertext.extend_from_slice(&iv);
        
        for (i, &byte) in plaintext.iter().enumerate() {
            let key_byte = encryption_key[i % encryption_key.len()];
            ciphertext.push(byte ^ key_byte);
        }
        
        Ok(ciphertext)
    }
    
    /// Derive an encryption key from the shared secret
    fn derive_key(&self, shared_secret: &[u8]) -> Result<[u8; 32]> {
        let mut hasher = Sha3_256::new();
        hasher.update(shared_secret);
        let result = hasher.finalize();
        
        result.as_slice().try_into()
            .map_err(|_| anyhow::anyhow!("Failed to derive key"))
    }
    
    /// Encrypt an email for a recipient
    pub fn encrypt_email(&self, 
                         plaintext: &str, 
                         sender_key: &KeyPair, 
                         recipient_public_key: &[u8]) -> Result<(Vec<u8>, Vec<u8>)> {
        // Use the key exchange to create a shared secret
        let key_exchange = crate::quantum_encryption::key_exchange::QuantumKeyExchange::new(&self.config);
        
        // Encapsulate a shared secret for the recipient
        let (ciphertext, shared_secret) = key_exchange.encapsulate(recipient_public_key)?;
        
        // Encrypt the message with the shared secret
        let encrypted_message = self.encrypt(plaintext.as_bytes(), &shared_secret)?;
        
        // Return the encapsulated shared secret and the encrypted message
        Ok((ciphertext, encrypted_message))
    }
}
