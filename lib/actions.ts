"use server"

import type { UserFormData, UserData } from "@/lib/types"

// Mock function to simulate creating a user
export async function createUser(formData: UserFormData): Promise<void> {
  // In a real app, this would create a user in the database
  console.log("Creating user:", formData)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return success
  return Promise.resolve()
}

// Mock function to simulate fetching user data
export async function getUserData(): Promise<UserData> {
  // In a real app, this would fetch user data from the database

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock data
  return {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Inc.",
    website: "https://example.com",
    cards: [
      {
        id: "card-1",
        name: "Professional Card",
        createdAt: new Date().toISOString(),
        style: {
          backgroundColor: "#ffffff",
          textColor: "#333333",
          primaryColor: "#3b82f6",
        },
      },
      {
        id: "card-2",
        name: "Creative Card",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        style: {
          backgroundColor: "#f8f9fa",
          textColor: "#1a1a1a",
          primaryColor: "#ec4899",
        },
      },
    ],
    nfts: [
      {
        id: "nft-1",
        name: "Business Card NFT #1",
        cardId: "card-1",
        txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        tokenId: "1",
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ],
  }
}
