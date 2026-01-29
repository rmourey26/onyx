import { Resend } from "resend"
import { ContactNotificationEmail } from "@/components/emails/contact-notification"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !message) {
      return Response.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    // Send notification email to admin
    const { data, error } = await resend.emails.send({
      from: "Onyx Contact <contact@resend.dev>",
      to: ["delivered@resend.dev"], // In production: your admin email
      replyTo: email,
      subject: `Contact Form: ${subject || "New Inquiry from " + name}`,
      react: ContactNotificationEmail({
        name,
        email,
        subject: subject || "General Inquiry",
        message,
        submittedAt: new Date().toISOString(),
      }),
    })

    if (error) {
      console.error("Contact email error:", error)
      return Response.json(
        { error: "Failed to send notification" },
        { status: 500 }
      )
    }

    // Send auto-reply to user
    await resend.emails.send({
      from: "Onyx Team <noreply@resend.dev>",
      to: [email],
      subject: "We received your message - Onyx",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0a1a2e 0%, #0f172a 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Thank You, ${name}!</h1>
          </div>
          <div style="background: #ffffff; padding: 30px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              We have received your message and will get back to you within 24 hours.
            </p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #38bdf8;">
              <p style="color: #475569; font-size: 14px; margin: 0;"><strong>Your message:</strong></p>
              <p style="color: #64748b; font-size: 14px; margin: 10px 0 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              Best regards,<br/>
              The Onyx Team
            </p>
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Onyx Platform</p>
          </div>
        </div>
      `,
    })

    return Response.json({
      success: true,
      message: "Message sent successfully",
      data,
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
