import { EmailTemplate } from "@/components/email-template";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Hello world',
      react: EmailTemplate({ firstName: 'John' }),
    });

    if (error) {
      // Type guard to ensure 'error' is an Error object
      if (error instanceof Error) {
        return Response.json({ error: error.message }, { status: 500 });
      } else {
        // Handle cases where 'error' is not an Error object (e.g., a string or object)
        return Response.json({ error: String(error) }, { status: 500 });
      }
    }

    return Response.json(data);
  } catch (error) {
    // Type guard for the catch block 'error' as well.
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    } else {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }
}