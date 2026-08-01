/**
 * Seed script: chunks and embeds all Kronova knowledge base content
 * into data_embeddings with source_type = 'kairo_knowledge'.
 *
 * Run once (and re-run whenever content changes):
 *   npx tsx scripts/seed-kairo-knowledge-base.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 *   KAIRO_SEED_USER_ID  (a valid UUID from your auth.users table — use your own user ID)
 */

import * as fs from "fs"
import * as path from "path"
import { EmbeddingSystem } from "../lib/embeddings/embedding-system"

const SEED_USER_ID = process.env.KAIRO_SEED_USER_ID
if (!SEED_USER_ID) throw new Error("Set KAIRO_SEED_USER_ID env var to your Supabase user UUID")

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const OPENAI_KEY = process.env.OPENAI_API_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or OPENAI_API_KEY")
}

// All knowledge base source files relative to project root
const KNOWLEDGE_SOURCES: { file: string; name: string; description: string }[] = [
  {
    file: "KRONOVA_WEBSITE_CONTENT_V2.0.md",
    name: "Kronova Website Content v2",
    description: "Official Kronova platform website copy — product descriptions, features, enterprise positioning",
  },
  {
    file: "KRONOVA_WEBSITE_CONTENT_V1.0.md",
    name: "Kronova Website Content v1",
    description: "Previous Kronova website copy — background context and earlier product descriptions",
  },
  {
    file: "BLOG_ARTICLE_KRONOVA_AETHERNET_INNOVATION.md",
    name: "AetherNet Innovation Blog",
    description: "Kronova blog article on AetherNet innovation and quantum agentic substrate",
  },
  {
    file: "blog/kronova-a2a-aethernet-payment-protocol.md",
    name: "A2A AetherNet Payment Protocol Blog",
    description: "Deep-dive on A2A interoperability, AetherNet payment protocol, Canton Network integration",
  },
  {
    file: "blog/24-enterprise-problems-complete-technology-stack.md",
    name: "24 Enterprise Problems Blog",
    description: "How Kronova's complete technology stack solves 24 enterprise-grade problems",
  },
]

async function main() {
  const embeddingSystem = new EmbeddingSystem(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const root = path.resolve(__dirname, "..")

  for (const source of KNOWLEDGE_SOURCES) {
    const filePath = path.join(root, source.file)

    if (!fs.existsSync(filePath)) {
      console.warn(`[seed] Skipping — file not found: ${source.file}`)
      continue
    }

    console.log(`\n[seed] Processing: ${source.name}`)
    const content = fs.readFileSync(filePath, "utf-8")

    // Chunk into ~800 token segments with 100 char overlap
    const chunks = await embeddingSystem.processDocumentFile(content, source.file, {
      chunkSize: 3200, // ~800 tokens at ~4 chars/token
      chunkOverlap: 200,
    })

    // Tag each chunk with kairo_knowledge source_type via metadata
    const taggedChunks = chunks.map((chunk) => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        source_type: "kairo_knowledge",
        source_file: source.file,
        source_name: source.name,
      },
    }))

    console.log(`[seed] ${taggedChunks.length} chunks — embedding...`)

    await embeddingSystem.createEmbeddings(taggedChunks, SEED_USER_ID!, source.name, source.description)

    console.log(`[seed] Done: ${source.name}`)
  }

  console.log("\n[seed] All knowledge base content embedded successfully.")
}

main().catch((err) => {
  console.error("[seed] Fatal error:", err)
  process.exit(1)
})
