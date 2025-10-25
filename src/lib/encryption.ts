// Client-side encryption utilities using AES-256
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static generateKey(): string {
    // Generate a random 256-bit key
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  static async encryptFile(file: File): Promise<{ encryptedData: string; key: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const fileData = event.target?.result as string;
          const key = this.generateKey();

          // Encrypt the file data
          const encrypted = CryptoJS.AES.encrypt(fileData, key).toString();

          resolve({
            encryptedData: encrypted,
            key: key
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  static decryptFile(encryptedData: string, key: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Failed to decrypt file');
    }
  }

  static async encryptKey(key: string, publicKey: string): Promise<string> {
    // In a real implementation, this would use asymmetric encryption
    // For demo purposes, we'll use a simple approach
    return CryptoJS.AES.encrypt(key, publicKey).toString();
  }

  static decryptKey(encryptedKey: string, privateKey: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, privateKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Failed to decrypt key');
    }
  }
}