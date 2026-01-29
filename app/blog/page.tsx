"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight, Mail, CheckCircle2 } from "lucide-react"

// Sample blog posts - In production, these would come from database
const blogPosts = [
  {
    id: "1",
    slug: "introducing-onyx-platform",
    title: "Introducing the Onyx Platform: Enterprise-Grade Digital Identity",
    excerpt: "Discover how Onyx is revolutionizing digital identity management with cutting-edge blockchain technology and AI-powered security features.",
    content: "",
    author: "Onyx Team",
    publishedAt: "2026-01-15",
    readTime: "5 min read",
    category: "Product",
    tags: ["blockchain", "identity", "security"],
    featured: true,
  },
  {
    id: "2",
    slug: "web3-security-best-practices",
    title: "Web3 Security Best Practices for Enterprise Applications",
    excerpt: "Learn the essential security practices every enterprise should implement when building Web3 applications.",
    content: "",
    author: "Security Team",
    publishedAt: "2026-01-10",
    readTime: "8 min read",
    category: "Security",
    tags: ["web3", "security", "enterprise"],
    featured: false,
  },
  {
    id: "3",
    slug: "ai-agents-future",
    title: "The Future of AI Agents in Business Automation",
    excerpt: "Explore how AI agents are transforming business operations and what this means for the future of work.",
    content: "",
    author: "AI Research",
    publishedAt: "2026-01-05",
    readTime: "6 min read",
    category: "AI",
    tags: ["ai", "automation", "agents"],
    featured: true,
  },
]

export default function BlogPage() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      if (response.ok) {
        setSubscribed(true)
        setEmail("")
      }
    } catch (error) {
      console.error("Subscription error:", error)
    } finally {
      setLoading(false)
    }
  }

  const featuredPosts = blogPosts.filter(post => post.featured)
  const recentPosts = blogPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-tech py-12 md:py-16 lg:py-20">
        <div className="container-tech max-w-7xl">
          <div className="max-w-4xl mx-auto text-center px-4">
            <Badge className="badge-tech mb-4 md:mb-6">Onyx Insights</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 heading-gradient">
              Enterprise Tech Insights
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
              Stay ahead with the latest insights on blockchain, AI, security, and enterprise technology from the Onyx team.
            </p>

            {/* Newsletter Subscription */}
            <div className="glass-panel p-6 md:p-8 max-w-xl mx-auto">
              {subscribed ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold">You are subscribed!</h3>
                  <p className="text-muted-foreground">Check your email for confirmation.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 justify-center mb-4">
                    <Mail className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Subscribe to our Newsletter</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get weekly updates on the latest in enterprise technology.
                  </p>
                  <form onSubmit={handleSubscribe} className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-tech flex-1"
                      required
                    />
                    <Button type="submit" className="btn-tech" disabled={loading}>
                      {loading ? "..." : "Subscribe"}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="divider-tech" />

      {/* Featured Posts */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container-tech max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-2 px-4">
            <span className="w-1.5 h-6 md:h-8 bg-primary rounded-full" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4">
            {featuredPosts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="enterprise-card h-full group cursor-pointer">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <CardTitle className="text-lg md:text-xl lg:text-2xl group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <span className="text-primary flex items-center gap-1 text-xs md:text-sm font-medium group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
        <div className="container-tech max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-2 px-4">
            <span className="w-1.5 h-6 md:h-8 bg-secondary rounded-full" />
            Recent Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="enterprise-card h-full group cursor-pointer">
                  <CardHeader className="space-y-3">
                    <Badge variant="outline" className="w-fit text-xs">
                      {post.category}
                    </Badge>
                    <CardTitle className="text-base md:text-lg group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tags Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container-tech max-w-7xl px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Browse by Topic</h2>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {["blockchain", "identity", "security", "web3", "enterprise", "ai", "automation", "agents"].map((tag) => (
              <Link key={tag} href={`/blog/tag/${tag}`}>
                <Badge variant="outline" className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
