"use server"

import crypto from "crypto"

// In a real application, use a secure environment variable for this
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-secure-encryption-key-min-32-chars"
const IV_LENGTH = 16 // For AES, this is always 16

export async function encrypt(text: string): Promise<string> {
  const iv = crypto.randomBytes(IV_LENGTH)
  // Use type assertion to fix the TypeScript error
  const key = Buffer.from(ENCRYPTION_KEY)
  // Specify the algorithm type explicitly
  const cipher = crypto.createCipheriv("aes-256-cbc" as crypto.CipherCCMTypes, key, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`
}

export async function decrypt(text: string): Promise<string> {
  const [ivHex, encryptedHex] = text.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const encryptedText = Buffer.from(encryptedHex, "hex")
  // Use type assertion to fix the TypeScript error
  const key = Buffer.from(ENCRYPTION_KEY)
  // Specify the algorithm type explicitly
  const decipher = crypto.createDecipheriv("aes-256-cbc" as crypto.CipherCCMTypes, key, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}


