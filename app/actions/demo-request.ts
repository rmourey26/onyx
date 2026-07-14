"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface DemoRequestData {
  name: string
  email: string
  message: string
}

export async function sendDemoRequest(data: DemoRequestData) {
  const { name, email, message } = data

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "ResendIt Demo <demo@resend-it.com>",
      to: ["demo@resend-it.com"],
      subject: `Demo Request from ${name}`,
      reply_to: email,
      text: `
Name: ${name}
Email: ${email}
Message: ${message || "No message provided"}
      `,
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>New Demo Request</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Message:</strong> ${message || "No message provided"}</p>
</div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      throw new Error("Failed to send demo request")
    }

    return { success: true }
  } catch (error) {
    console.error("Error in sendDemoRequest:", error)
    throw new Error("Failed to send demo request")
  }
}
