import "dotenv/config" // Make sure to install dotenv: npm install dotenv
import Stripe from "stripe"
import { createAdminSupabaseClient } from "../lib/supabase/admin" // Adjust path as needed

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables.")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

const supabase = createAdminSupabaseClient()

const plans = [
  {
    name: "Starter",
    description: "For small stores getting started with AI.",
    prices: [{ amount: 2900, interval: "month" }], // $29/month
    metadata: { index: 0 },
  },
  {
    name: "Growth",
    description: "For growing businesses ready to scale with advanced AI.",
    prices: [{ amount: 9900, interval: "month" }], // $99/month
    metadata: { index: 1, featured: "true" },
  },
  {
    name: "Scale",
    description: "For large enterprises needing the full, unlimited suite.",
    prices: [{ amount: 24900, interval: "month" }], // $249/month
    metadata: { index: 2 },
  },
]

async function seedProducts() {
  console.log("Seeding Stripe products and prices...")

  // Clear existing data for a clean seed
  console.log("Clearing existing product and price data from Supabase...")
  await supabase.from("prices").delete().neq("id", "0")
  await supabase.from("products").delete().neq("id", "0")
  console.log("Cleared existing data.")

  for (const plan of plans) {
    try {
      const stripeProduct = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata,
      })
      console.log(`Created Stripe product: ${stripeProduct.name} (${stripeProduct.id})`)

      const { error: productError } = await supabase.from("products").insert({
        id: stripeProduct.id,
        active: true,
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata,
      })
      if (productError) throw new Error(`Supabase product insert error: ${productError.message}`)

      for (const price of plan.prices) {
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: price.amount,
          currency: "usd",
          recurring: {
            interval: price.interval as "month" | "year",
          },
        })
        console.log(`  - Created Stripe price: ${stripePrice.id}`)

        const { error: priceError } = await supabase.from("prices").insert({
          id: stripePrice.id,
          product_id: stripeProduct.id,
          active: true,
          unit_amount: price.amount,
          currency: "usd",
          type: "recurring",
          interval: price.interval,
        })
        if (priceError) throw new Error(`Supabase price insert error: ${priceError.message}`)
      }
    } catch (error) {
      console.error(`Error processing plan "${plan.name}":`, error)
    }
  }
  console.log("✅ Seeding complete!")
}

seedProducts().catch((e) => {
  console.error(e)
  process.exit(1)
})
