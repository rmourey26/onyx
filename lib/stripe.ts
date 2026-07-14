import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables.")
}

// Validate that we're using a secret key, not a publishable key
if (process.env.STRIPE_SECRET_KEY.startsWith("pk_")) {
  throw new Error(
    "STRIPE_SECRET_KEY contains a publishable key (pk_...). " +
      "Please use a secret key (sk_...) instead. " +
      "You can find your secret key at https://dashboard.stripe.com/apikeys",
  )
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
})
