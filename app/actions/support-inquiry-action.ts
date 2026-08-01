"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SupportInquiryData {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendSupportInquiry(data: SupportInquiryData) {
  const { name, email, subject, message } = data

  try {
    // Internal notification to the support team
    const { error: internalError } = await resend.emails.send({
      from: "Kronova Support <help@kronova.io>",
      to: ["help@kronova.io"],
      subject: `Support Inquiry: ${subject}`,
      reply_to: email,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0e7490; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">New Support Inquiry</h1>
  </div>
  <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px;"><strong>Name:</strong> ${name}</p>
    <p style="margin: 0 0 16px;"><strong>Email:</strong> ${email}</p>
    <p style="margin: 0 0 16px;"><strong>Subject:</strong> ${subject}</p>
    <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #0e7490;">
      <p style="margin: 0; white-space: pre-wrap;">${message}</p>
    </div>
  </div>
  <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 16px;">
    &copy; ${new Date().getFullYear()} Kronova. All rights reserved.
  </p>
</div>
      `,
      text: `Support Inquiry\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    })

    if (internalError) {
      console.error("[support-inquiry] Failed to send internal notification:", internalError)
      throw new Error("Failed to send inquiry")
    }

    // Confirmation email to the user
    const { error: confirmationError } = await resend.emails.send({
      from: "Kronova Support <help@kronova.io>",
      to: [email],
      subject: "We received your message — Kronova Support",
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0e7490; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">Thanks for reaching out, ${name}.</h1>
    <p style="color: #e0f2fe; margin: 8px 0 0;">We've received your message.</p>
  </div>
  <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; color: #334155;">
      A member of the Kronova support team will review your inquiry and get back to you within <strong>24 hours</strong>.
    </p>
    <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your inquiry</p>
      <p style="margin: 0 0 8px;"><strong>Subject:</strong> ${subject}</p>
      <p style="margin: 0; color: #334155; font-size: 14px; white-space: pre-wrap;">${message}</p>
    </div>
    <p style="font-size: 14px; color: #64748b;">
      While you wait, you can also get instant answers from 
      <strong>Kairo</strong> — Kronova's intelligent support assistant — at 
      <a href="https://app.kronova.io/support" style="color: #0e7490; text-decoration: none;">kronova.io/support</a>.
    </p>
  </div>
  <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 16px;">
    &copy; ${new Date().getFullYear()} Kronova Technologies Inc. All rights reserved.
  </p>
</div>
      `,
      text: `Thanks for reaching out, ${name}.\n\nWe've received your message and will get back to you within 24 hours.\n\nYour inquiry:\nSubject: ${subject}\n${message}\n\n— Kronova Support`,
    })

    if (confirmationError) {
      // Non-fatal — the internal email succeeded; log but don't throw
      console.error("[support-inquiry] Failed to send confirmation to user:", confirmationError)
    }

    return { success: true }
  } catch (error) {
    console.error("[support-inquiry] Unexpected error:", error)
    throw new Error("Failed to send support inquiry")
  }
}
