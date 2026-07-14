/**
 * NFC utility functions for sharing business card data
 * Note: Web NFC API is currently only supported in Chrome on Android
 */

// Check if NFC is available in the browser
export function isNfcSupported(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window
}

// Check if the device has NFC hardware
export async function hasNfcHardware(): Promise<boolean> {
  if (!isNfcSupported()) return false

  try {
    const ndef = new (window as any).NDEFReader()
    await Promise.race([
      ndef.scan(),
      new Promise((_, reject) => setTimeout(() => reject(new DOMException("Timeout", "TimeoutError")), 1000)),
    ])
    return true
  } catch (error) {
    // If the error is a NotSupportedError, the device doesn't have NFC hardware
    if (error instanceof DOMException && error.name === "NotSupportedError") {
      return false
    }
    // For TimeoutError, we assume the hardware exists but permission was granted
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return true
    }
    // For other errors (like permission denied), we assume the hardware exists
    return true
  }
}

// Generate vCard format for contact information
export function generateVCard(userData: {
  full_name: string
  company: string
  job_title?: string
  email: string
  website: string
  linkedin_url?: string
  xhandle?: string
  waddress?: string
}): string {
  let vCard = `BEGIN:VCARD
VERSION:3.0
FN:${userData.full_name}
ORG:${userData.company}
EMAIL:${userData.email}
URL:${userData.website}`

  if (userData.job_title) {
    vCard += `
TITLE:${userData.job_title}`
  }

  if (userData.linkedin_url) {
    vCard += `
X-SOCIALPROFILE;type=linkedin:${userData.linkedin_url}`
  }

  if (userData.xhandle) {
    vCard += `
X-SOCIALPROFILE;type=twitter:https://twitter.com/${userData.xhandle.replace("@", "")}`
  }

  if (userData.waddress) {
    vCard += `
NOTE:Wallet: ${userData.waddress}`
  }

  vCard += `
END:VCARD`
  return vCard
}

// Share business card via NFC
export async function shareViaNfc(vCardData: string): Promise<{ success: boolean; message: string }> {
  if (!isNfcSupported()) {
    return {
      success: false,
      message: "NFC is not supported in your browser. Try using Chrome on Android.",
    }
  }

  try {
    const ndef = new (window as any).NDEFReader()

    // Set a timeout for the NFC write operation
    const writePromise = ndef.write({
      records: [
        { recordType: "url", data: "https://app.resend-it.com/card" }, // Fallback URL
        { recordType: "text", data: vCardData }, // vCard data
      ],
    })

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("NFC operation timed out")), 5000)
    })

    // Race between the write operation and the timeout
    await Promise.race([writePromise, timeoutPromise])

    return {
      success: true,
      message: "Ready to share! Tap your phone against another NFC-enabled device.",
    }
  } catch (error) {
    console.error("Error writing to NFC:", error)

    if (error instanceof DOMException) {
      switch (error.name) {
        case "NotAllowedError":
          return {
            success: false,
            message: "Permission to use NFC was denied. Please allow NFC access in your browser settings.",
          }
        case "NotSupportedError":
          return {
            success: false,
            message: "NFC is not supported on this device.",
          }
        case "NotReadableError":
          return {
            success: false,
            message: "Cannot connect to NFC. Make sure NFC is enabled in your device settings.",
          }
        default:
          return {
            success: false,
            message: `NFC error: ${error.message}`,
          }
      }
    }

    if (error instanceof Error && error.message === "NFC operation timed out") {
      return {
        success: false,
        message: "NFC operation timed out. Please try again and make sure NFC is enabled.",
      }
    }

    return {
      success: false,
      message: "An unexpected error occurred while trying to use NFC.",
    }
  }
}
