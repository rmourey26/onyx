import type { Metadata } from "next"
import SignupPageClient from "./pageClient"

export const metadata: Metadata = {
  title: "Sign Up - Kronova",
  description: "Create your account to access the Kronova AI platform",
}

export default async function SignupPage() {
  return <SignupPageClient />
}
