import * as React from "react"

interface ContactNotificationEmailProps {
  name: string
  email: string
  subject: string
  message: string
  submittedAt?: string
}

export const ContactNotificationEmail: React.FC<ContactNotificationEmailProps> = ({
  name,
  email,
  subject,
  message,
  submittedAt = new Date().toISOString(),
}) => (
  <div style={{
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0',
    backgroundColor: '#f8fafc',
  }}>
    {/* Header */}
    <div style={{
      background: 'linear-gradient(135deg, #0a1a2e 0%, #0f172a 100%)',
      padding: '30px',
      textAlign: 'center' as const,
    }}>
      <h1 style={{
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: '700',
        margin: '0',
        letterSpacing: '-0.5px',
      }}>
        New Contact Form Submission
      </h1>
    </div>

    {/* Alert Banner */}
    <div style={{
      backgroundColor: '#38bdf8',
      padding: '12px 20px',
      textAlign: 'center' as const,
    }}>
      <p style={{
        color: '#0a1a2e',
        fontSize: '14px',
        fontWeight: '600',
        margin: '0',
      }}>
        Received on {new Date(submittedAt).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>

    {/* Body */}
    <div style={{
      backgroundColor: '#ffffff',
      padding: '30px',
    }}>
      {/* Contact Info Card */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
      }}>
        <h2 style={{
          color: '#0f172a',
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
          margin: '0 0 16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e2e8f0',
        }}>
          Contact Information
        </h2>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', color: '#64748b', fontSize: '14px', width: '100px' }}>Name:</td>
              <td style={{ padding: '8px 0', color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>{name}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#64748b', fontSize: '14px' }}>Email:</td>
              <td style={{ padding: '8px 0' }}>
                <a href={`mailto:${email}`} style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '14px' }}>
                  {email}
                </a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#64748b', fontSize: '14px' }}>Subject:</td>
              <td style={{ padding: '8px 0', color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>{subject}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Message Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        borderLeft: '4px solid #38bdf8',
      }}>
        <h2 style={{
          color: '#0f172a',
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
          margin: '0 0 16px',
        }}>
          Message
        </h2>
        <p style={{
          color: '#334155',
          fontSize: '15px',
          lineHeight: '1.7',
          margin: '0',
          whiteSpace: 'pre-wrap' as const,
        }}>
          {message}
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center' as const,
      }}>
        <a
          href={`mailto:${email}?subject=Re: ${subject}`}
          style={{
            display: 'inline-block',
            backgroundColor: '#38bdf8',
            color: '#0a1a2e',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            marginRight: '12px',
          }}
        >
          Reply to {name}
        </a>
      </div>
    </div>

    {/* Footer */}
    <div style={{
      backgroundColor: '#f1f5f9',
      padding: '20px 30px',
      textAlign: 'center' as const,
    }}>
      <p style={{
        color: '#64748b',
        fontSize: '12px',
        margin: '0',
      }}>
        This is an automated notification from the Onyx contact form.
        <br />
        © 2026 Onyx Platform
      </p>
    </div>
  </div>
)

export default ContactNotificationEmail
