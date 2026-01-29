import * as React from "react"

interface BlogNotificationEmailProps {
  title: string
  excerpt: string
  slug: string
  author: string
  category: string
  readTime?: string
}

export const BlogNotificationEmail: React.FC<BlogNotificationEmailProps> = ({
  title,
  excerpt,
  slug,
  author,
  category,
  readTime = "5 min read",
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
        display: 'inline-block',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        color: '#38bdf8',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        padding: '6px 14px',
        borderRadius: '20px',
        marginBottom: '16px',
      }}>
        New Article
      </div>
      <h1 style={{
        color: '#ffffff',
        fontSize: '26px',
        fontWeight: '700',
        margin: '0 0 12px',
        letterSpacing: '-0.5px',
        lineHeight: '1.3',
      }}>
        {title}
      </h1>
      <p style={{
        color: '#94a3b8',
        fontSize: '14px',
        margin: '0',
      }}>
        By {author} • {category} • {readTime}
      </p>
    </div>

    {/* Body */}
    <div style={{
      backgroundColor: '#ffffff',
      padding: '40px 30px',
    }}>
      <p style={{
        color: '#475569',
        fontSize: '16px',
        lineHeight: '1.7',
        margin: '0 0 30px',
      }}>
        {excerpt}
      </p>

      <div style={{ textAlign: 'center' as const }}>
        <a
          href={`https://onyx.quantumone.io/blog/${slug}`}
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 100%)',
            color: '#0a1a2e',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)',
          }}
        >
          Read Full Article →
        </a>
      </div>
    </div>

    {/* Divider */}
    <div style={{
      height: '1px',
      background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
      margin: '0 30px',
    }} />

    {/* More Articles Section */}
    <div style={{
      backgroundColor: '#ffffff',
      padding: '30px',
    }}>
      <h2 style={{
        color: '#0f172a',
        fontSize: '18px',
        fontWeight: '600',
        margin: '0 0 20px',
        textAlign: 'center' as const,
      }}>
        More from Onyx Insights
      </h2>
      
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
      }}>
        <a
          href="https://onyx.quantumone.io/blog"
          style={{
            display: 'inline-block',
            backgroundColor: '#f1f5f9',
            color: '#334155',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
          }}
        >
          Browse All Articles
        </a>
      </div>
    </div>

    {/* Footer */}
    <div style={{
      backgroundColor: '#0f172a',
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
        color: '#475569',
        fontSize: '12px',
        margin: '0',
      }}>
        <a href="#" style={{ color: '#38bdf8', textDecoration: 'none' }}>Unsubscribe</a>
        {' | '}
        <a href="#" style={{ color: '#38bdf8', textDecoration: 'none' }}>Manage Preferences</a>
        {' | '}
        <a href="https://onyx.quantumone.io" style={{ color: '#38bdf8', textDecoration: 'none' }}>Visit Onyx</a>
      </p>
      <p style={{
        color: '#475569',
        fontSize: '11px',
        marginTop: '20px',
      }}>
        © 2026 Onyx Platform. All rights reserved.
      </p>
    </div>
  </div>
)

export default BlogNotificationEmail
