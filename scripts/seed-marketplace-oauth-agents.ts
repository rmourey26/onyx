import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const oauthAgents = [
  {
    name: "OAuth Integration Suite",
    description:
      "Enterprise OAuth 2.1 agent enabling seamless connections to Salesforce, HubSpot, and 50+ business apps with automatic token management.",
    category: "OAuth & Integration",
    price: 199.0,
    rating: 4.9,
    status: "active",
    creator_name: "Kronova Labs",
    avatar_url: "/oauth-integration-dashboard.jpg",
    capabilities: ["OAuth 2.1", "Auto Token Refresh", "50+ Integrations", "Webhook Support"],
    system_prompt: `You are an OAuth Integration specialist AI agent managing OAuth 2.1 connections to various business applications.`,
    model_id: "gpt-4o",
    tools: ["oauth_connect", "api_call", "webhook_handler", "token_refresh", "query_database"],
  },
  {
    name: "Multi-Chain OAuth Agent",
    description:
      "Connect and execute across Sui, Ethereum, and Solana blockchains with OAuth-secured wallet access and cross-chain transaction capabilities.",
    category: "OAuth & Blockchain",
    price: 249.0,
    rating: 4.8,
    status: "active",
    creator_name: "Kronova Labs",
    avatar_url: "/blockchain-oauth-network.jpg",
    capabilities: ["Multi-Chain Support", "OAuth Wallet Access", "Smart Contracts", "Cross-Chain Bridge"],
    system_prompt: `You are a blockchain integration AI agent with OAuth wallet access capabilities across multiple chains.`,
    model_id: "gpt-4o",
    tools: ["oauth_connect", "blockchain_query", "wallet_connect", "smart_contract_execute", "cross_chain_bridge"],
  },
  {
    name: "AetherNet OAuth Connector",
    description:
      "Connect to AetherNet with OAuth authentication for decentralized messaging and secure communication across the Kronova platform.",
    category: "OAuth & Communication",
    price: 149.0,
    rating: 4.7,
    status: "active",
    creator_name: "Kronova Labs",
    avatar_url: "/decentralized-network-communication.jpg",
    capabilities: ["OAuth Authentication", "End-to-End Encryption", "AetherNet Protocol", "Message Threading"],
    system_prompt: `You are an AetherNet communication specialist with OAuth security for decentralized messaging.`,
    model_id: "gpt-4o",
    tools: ["oauth_connect", "aethernet_send", "aethernet_receive", "encrypt_message"],
  },
  {
    name: "CRM OAuth Synchronizer",
    description:
      "Bi-directional OAuth sync with Salesforce, HubSpot, and Zoho CRM for contact management, lead tracking, and automated workflows.",
    category: "OAuth & CRM",
    price: 179.0,
    rating: 4.8,
    status: "active",
    creator_name: "Kronova Labs",
    avatar_url: "/placeholder.svg?height=400&width=600&text=CRM+Sync",
    capabilities: ["Bi-directional Sync", "Lead Tracking", "Custom Field Mapping", "Automated Workflows"],
    system_prompt: `You are a CRM integration specialist using OAuth 2.1 for secure connections to major CRM platforms.`,
    model_id: "gpt-4o",
    tools: ["oauth_connect", "crm_sync", "field_mapping", "webhook_handler", "analyze_data"],
  },
  {
    name: "E-Commerce OAuth Hub",
    description:
      "Unified OAuth integration for Shopify, WooCommerce, and Stripe enabling order sync, inventory management, and payment automation.",
    category: "OAuth & E-Commerce",
    price: 189.0,
    rating: 4.9,
    status: "active",
    creator_name: "Kronova Labs",
    avatar_url: "/placeholder.svg?height=400&width=600&text=Ecommerce+Hub",
    capabilities: ["Multi-Platform Sync", "Inventory Management", "Payment Processing", "Order Automation"],
    system_prompt: `You are an e-commerce integration specialist with OAuth capabilities for major platforms.`,
    model_id: "gpt-4o",
    tools: ["oauth_connect", "inventory_sync", "order_process", "payment_process", "webhook_handler"],
  },
  {
    name: "Marketing Automation OAuth Agent",
    description:
      "OAuth-powered marketing automation connecting Mailchimp, SendGrid, and Google Ads for campaign management and analytics.",
    category: "OAuth & Marketing",
    price: 169.0,
    rating: 4.7,
    status: "active",
    creator_name: "Kronova Labs",
    avatar_url: "/placeholder.svg?height=400&width=600&text=Marketing+Auto",
    capabilities: ["Email Campaigns", "Audience Segmentation", "A/B Testing", "Analytics Integration"],
    system_prompt: `You are a marketing automation specialist with OAuth integration capabilities for major platforms.`,
    model_id: "gpt-4o",
    tools: ["oauth_connect", "email_campaign", "audience_segment", "analytics_track", "analyze_data"],
  },
]

async function seedOAuthAgents() {
  console.log("Starting OAuth agent seeding...")

  // Get the seed user ID from environment
  const seedUserId = process.env.SEED_USER_ID

  if (!seedUserId) {
    console.error("SEED_USER_ID environment variable is required")
    process.exit(1)
  }

  for (const agent of oauthAgents) {
    try {
      // Check if agent already exists
      const { data: existing } = await supabase.from("marketplace_agents").select("id").eq("name", agent.name).single()

      if (existing) {
        console.log(`Agent "${agent.name}" already exists, skipping...`)
        continue
      }

      // Insert the agent
      const { data, error } = await supabase
        .from("marketplace_agents")
        .insert({
          ...agent,
          creator_id: seedUserId,
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating agent "${agent.name}":`, error.message)
      } else {
        console.log(`✓ Created OAuth agent: ${agent.name}`)
      }
    } catch (error) {
      console.error(`Exception creating agent "${agent.name}":`, error)
    }
  }

  console.log("OAuth agent seeding completed!")
}

seedOAuthAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error)
    process.exit(1)
  })
