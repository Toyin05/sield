// Client-side encryption utilities using AES-256 and Web Crypto API
import CryptoJS from 'crypto-js';

export class EncryptionService {
  /**
   * Generate a cryptographically secure random AES-256 key
   * @returns Promise<string> Base64-encoded key
   */
  private static async generateSecureKey(): Promise<string> {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  }

  /**
   * Encrypt a file using AES-256-GCM
   * @param file The file to encrypt
   * @returns Promise<{encryptedData: string, key: string, iv: string}>
   */
  static async encryptFile(file: File): Promise<{ encryptedData: string; key: string; iv: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = async (event) => {
          try {
            const fileData = event.target?.result as ArrayBuffer;
            const key = await this.generateSecureKey();

            // Generate a random 96-bit IV (12 bytes)
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Import the key for Web Crypto API
            const cryptoKey = await crypto.subtle.importKey(
              'raw',
              Uint8Array.from(atob(key), c => c.charCodeAt(0)),
              { name: 'AES-GCM', length: 256 },
              false,
              ['encrypt']
            );

            // Encrypt the file data
            const encrypted = await crypto.subtle.encrypt(
              {
                name: 'AES-GCM',
                iv: iv
              },
              cryptoKey,
              fileData
            );

            // Convert to base64 for storage
            const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
            const ivBase64 = btoa(String.fromCharCode(...iv));

            resolve({
              encryptedData: encryptedBase64,
              key: key,
              iv: ivBase64
            });
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Decrypt a file using AES-256-GCM
   * @param encryptedData Base64-encoded encrypted data
   * @param key Base64-encoded AES key
   * @param iv Base64-encoded initialization vector
   * @returns Promise<ArrayBuffer> Decrypted file data
   */
  static async decryptFile(encryptedData: string, key: string, iv: string): Promise<ArrayBuffer> {
    try {
      // Convert from base64
      const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const keyBytes = Uint8Array.from(atob(key), c => c.charCodeAt(0));
      const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

      // Import the key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes
        },
        cryptoKey,
        encryptedBytes
      );

      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt file: ' + (error as Error).message);
    }
  }

  /**
   * Encrypt an AES key using ECIES (Elliptic Curve Integrated Encryption Scheme)
   * This would typically use the recipient's public key
   * @param key The AES key to encrypt
   * @param recipientPublicKey The recipient's public key (for demo, using a derived key)
   * @returns Promise<string> Encrypted key
   */
  static async encryptKeyForRecipient(key: string, recipientPublicKey: string): Promise<string> {
    // In production, this would use proper ECIES with recipient's public key
    // For demo purposes, we'll use AES encryption with a derived key
    try {
      const derivedKey = await this.deriveKeyFromPublicKey(recipientPublicKey);
      return CryptoJS.AES.encrypt(key, derivedKey).toString();
    } catch (error) {
      throw new Error('Failed to encrypt key for recipient');
    }
  }

  /**
   * Decrypt an AES key that was encrypted for the recipient
   * @param encryptedKey The encrypted AES key
   * @param recipientPrivateKey The recipient's private key
   * @returns Promise<string> Decrypted AES key
   */
  static async decryptKeyForRecipient(encryptedKey: string, recipientPrivateKey: string): Promise<string> {
    try {
      const derivedKey = await this.deriveKeyFromPrivateKey(recipientPrivateKey);
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, derivedKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Failed to decrypt key for recipient');
    }
  }

  /**
   * Derive a symmetric key from a public key (simplified for demo)
   * In production, this would use proper ECDH key exchange
   */
  private static async deriveKeyFromPublicKey(publicKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(publicKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  }

  /**
   * Derive a symmetric key from a private key (simplified for demo)
   * In production, this would use proper ECDH key exchange
   */
  private static async deriveKeyFromPrivateKey(privateKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(privateKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  }

  /**
   * Generate a key pair for ECIES (simplified demo implementation)
   * @returns Promise<{publicKey: string, privateKey: string}>
   */
  static async generateKeyPair(): Promise<{publicKey: string, privateKey: string}> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      true,
      ['deriveKey', 'deriveBits']
    );

    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
      privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey)))
    };
  }

  /**
   * Hash a password for key derivation (PBKDF2)
   * @param password User password
   * @param salt Random salt
   * @returns Promise<string> Derived key
   */
  static async deriveKeyFromPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const saltBytes = encoder.encode(salt);
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);
    return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  }
}