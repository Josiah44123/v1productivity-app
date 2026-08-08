import crypto from "crypto"

// Must be exactly 32 bytes (256 bits) for AES-256
// In a real app, this should be stored securely in an environment variable.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "a_very_secure_32_byte_secret_key" 
const ALGORITHM = "aes-256-gcm"

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(12) // 96 bits for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
    
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    
    const authTag = cipher.getAuthTag().toString("hex")
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString("hex")}:${authTag}:${encrypted}`
  } catch (error) {
    console.error("Encryption error:", error)
    return text // Fallback or handle appropriately
  }
}

export function decrypt(encryptedData: string): string {
  try {
    if (!encryptedData.includes(":")) return encryptedData // Not encrypted
    
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(":")
    if (!ivHex || !authTagHex || !encryptedText) return encryptedData

    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
    
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    return encryptedData // Return original if decryption fails (e.g. data wasn't encrypted)
  }
}

