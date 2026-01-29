import * as React from "react"

interface NewsletterConfirmationEmailProps {
  email: string
}

export const NewsletterConfirmationEmail: React.FC<NewsletterConfirmationEmailProps> = ({
  email,
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
      padding: '40px 30px',
      textAlign: 'center' as const,
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        margin: '0 auto 20px',
        background: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: '28px', color: '#0a1a2e', fontWeight: 'bold' }}>O</span>
      </div>
      <h1 style={{
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: '700',
        margin: '0 0 10px',
        letterSpacing: '-0.5px',
      }}>
        Welcome to Onyx Insights
      </h1>
      <p style={{
        color: '#94a3b8',
        fontSize: '16px',
        margin: '0',
      }}>
        Your subscription is confirmed
      </p>
    </div>

    {/* Body */}
    <div style={{
      backgroundColor: '#ffffff',
      padding: '40px 30px',
      borderBottom: '1px solid #e2e8f0',
    }}>
      <p style={{
        color: '#334155',
        fontSize: '16px',
        lineHeight: '1.6',
        margin: '0 0 20px',
      }}>
        Thank you for subscribing to the Onyx Insights newsletter!
      </p>
      
      <p style={{
        color: '#64748b',
        fontSize: '15px',
        lineHeight: '1.6',
        margin: '0 0 25px',
      }}>
        You will now receive weekly updates on:
      </p>

      <ul style={{
        color: '#475569',
        fontSize: '15px',
        lineHeight: '1.8',
        margin: '0 0 25px',
        paddingLeft: '20px',
      }}>
        <li style={{ marginBottom: '8px' }}>Latest enterprise technology trends</li>
        <li style={{ marginBottom: '8px' }}>Blockchain and Web3 security insights</li>
        <li style={{ marginBottom: '8px' }}>AI and automation best practices</li>
        <li style={{ marginBottom: '8px' }}>Exclusive product updates and announcements</li>
      </ul>

      <div style={{
        backgroundColor: '#f1f5f9',
        borderRadius: '12px',
        padding: '20px',
        borderLeft: '4px solid #38bdf8',
        margin: '0 0 25px',
      }}>
        <p style={{
          color: '#334155',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '0',
        }}>
          <strong>Your email:</strong> {email}
        </p>
      </div>

      <a
        href="https://onyx.quantumone.io/blog"
        style={{
          display: 'inline-block',
          backgroundColor: '#38bdf8',
          color: '#0a1a2e',
          fontSize: '16px',
          fontWeight: '600',
          textDecoration: 'none',
          padding: '14px 28px',
          borderRadius: '8px',
          textAlign: 'center' as const,
        }}
      >
        Explore Our Blog
      </a>
    </div>

    {/* Footer */}
    <div style={{
      backgroundColor: '#f8fafc',
      padding: '30px',
      textAlign: 'center' as const,
    }}>
      <p style={{
        color: '#64748b',
        fontSize: '13px',
        lineHeight: '1.6',
        margin: '0 0 15px',
      }}>
        You are receiving this email because you subscribed to Onyx Insights.
      </p>
      <p style={{
        color: '#94a3b8',
        fontSize: '12px',
        margin: '0',
      }}>
        © 2026 Onyx Platform. All rights reserved.
        <br />
        <a href="#" style={{ color: '#38bdf8', textDecoration: 'none' }}>Unsubscribe</a>
        {' | '}
        <a href="#" style={{ color: '#38bdf8', textDecoration: 'none' }}>Preferences</a>
      </p>
    </div>
  </div>
)

export default NewsletterConfirmationEmail
