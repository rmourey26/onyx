// Type definitions for Web NFC API
// https://w3c.github.io/web-nfc/

interface NDEFMessage {
  records: NDEFRecord[]
}

interface NDEFRecord {
  recordType: string
  mediaType?: string
  id?: string
  data?: any
  encoding?: string
  lang?: string
}

interface WriteOptions {
  overwrite?: boolean
  signal?: AbortSignal
}

interface NDEFReader extends EventTarget {
  scan(options?: { signal?: AbortSignal }): Promise<void>
  write(message: NDEFMessage | NDEFRecord[] | NDEFRecord, options?: WriteOptions): Promise<void>
}

interface Window {
  NDEFReader: {
    new (): NDEFReader
    prototype: NDEFReader
  }
}

export {}
