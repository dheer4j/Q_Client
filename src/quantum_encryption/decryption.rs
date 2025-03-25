use anyhow::Result;
use sha3::{Digest, Sha3_256};
use std::convert::TryInto;

use crate::config::EncryptionConfig;
use crate::quantum_encryption::key_exchange::KeyPair;

/// Service for decrypting messages using quantum-resistant algorithms
pub struct DecryptionService {
    config: EncryptionConfig,
}

impl DecryptionService {
    pub fn new(config: &EncryptionConfig) -> Self {
        Self {
            config: config.clone(),
        }
    }
    
    /// Decrypt a message using a shared secret
    pub fn decrypt(&self, ciphertext: &[u8], shared_secret: &[u8]) -> Result<Vec<u8>> {
        // Extract the IV (first 16 bytes)
        if ciphertext.len() < 16 {
            return Err(anyhow::anyhow!("Invalid ciphertext: too short"));
        }
        
        let iv = &ciphertext[..16];
        let encrypted_data = &ciphertext[16..];
        
        // Derive decryption key from shared secret using SHA3
        let decryption_key = self.derive_key(shared_secret)?;
        
        // Decrypt the message
        // For simplicity, we're implementing a basic XOR cipher here
        // In production, use a proper authenticated encryption like AES-GCM
        let mut plaintext = Vec::with_capacity(encrypted_data.len());
        
        for (i, &byte) in encrypted_data.iter().enumerate() {
            let key_byte = decryption_key[i % decryption_key.len()];
            plaintext.push(byte ^ key_byte);
        }
        
        Ok(plaintext)
    }
    
    /// Derive a decryption key from the shared secret
    fn derive_key(&self, shared_secret: &[u8]) -> Result<[u8; 32]> {
        let mut hasher = Sha3_256::new();
        hasher.update(shared_secret);
        let result = hasher.finalize();
        
        result.as_slice().try_into()
            .map_err(|_| anyhow::anyhow!("Failed to derive key"))
    }
    
    /// Decrypt an email using recipient's private key
    pub fn decrypt_email(&self, 
                         encrypted_message: &[u8], 
                         encapsulated_secret: &[u8],
                         recipient_key: &KeyPair) -> Result<String> {
        // Use the key exchange to recover the shared secret
        let key_exchange = crate::quantum_encryption::key_exchange::QuantumKeyExchange::new(&self.config);
        
        // Decapsulate the shared secret using recipient's private key
        let shared_secret = key_exchange.decapsulate(&recipient_key.private_key, encapsulated_secret)?;
        
        // Decrypt the message with the shared secret
        let decrypted_data = self.decrypt(encrypted_message, &shared_secret)?;
        
        // Convert the decrypted bytes to a string
        String::from_utf8(decrypted_data)
            .map_err(|e| anyhow::anyhow!("Failed to decode decrypted message: {}", e))
    }
}
