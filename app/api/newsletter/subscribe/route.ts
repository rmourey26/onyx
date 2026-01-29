import { Resend } from "resend"
import { NewsletterConfirmationEmail } from "@/components/emails/newsletter-confirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "Valid email is required" },
        { status: 400 }
      )
    }

    // Send confirmation email
    const { data, error } = await resend.emails.send({
      from: "Onyx Newsletter <newsletter@resend.dev>",
      to: [email],
      subject: "Welcome to Onyx Insights Newsletter",
      react: NewsletterConfirmationEmail({ email }),
    })

    if (error) {
      console.error("Resend error:", error)
      return Response.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: "Subscription confirmation sent",
      data,
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
