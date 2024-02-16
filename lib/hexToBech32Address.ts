import { bech32 } from "bech32"

export const hexToBech32Address = (address: string, prefix: string): string => {
  const data = Buffer.from(address.substr(2), "hex")
  const words = bech32.toWords(data)
  return bech32.encode(prefix, words)
}

export const bech32ToHexAddress = (address: string): string => {
  const decoded = bech32.decode(address)
  return "0x" + Buffer.from(bech32.fromWords(decoded.words)).toString("hex")
}