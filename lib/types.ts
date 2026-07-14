export interface UserData {
  id: string
  name: string
  email: string
  company: string
  website: string
  cards: BusinessCard[]
  nfts: NFT[]
}

export interface BusinessCard {
  id: string
  name: string
  createdAt: string
  style: {
    backgroundColor: string
    textColor: string
    primaryColor: string
    backgroundImage?: string
    logo?: string
  }
}

export interface NFT {
  id: string
  name: string
  cardId: string
  txHash: string
  tokenId: string
  createdAt: string
}

export interface UserFormData {
  name: string
  email: string
  company: string
  website: string
}
