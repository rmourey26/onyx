"use client"

import { useState, useTransition } from "react"
import { MessageCircle, Mail, CheckCircle, AlertCircle, ArrowRight, Clock, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { sendSupportInquiry } from "@/app/actions/support-inquiry-action"

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

const INITIAL_FORM: FormState = { name: "", email: "", subject: "", message: "" }

export function SupportPageClient() {
  const [activeTab, setActiveTab] = useState<"kairo" | "inquiry">("kairo")
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await sendSupportInquiry(form)
        setSubmitted(true)
        setForm(INITIAL_FORM)
      } catch {
        setError("Something went wrong. Please try again or email us directly at help@kronova.io.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20 max-w-4xl text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground text-balance">
            How can we help?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Get instant answers from Kairo, Kronova&apos;s intelligent support assistant, or submit an inquiry to our team.
          </p>
        </div>
      </section>

      {/* Tab switcher */}
      <section className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        <div className="flex gap-3 justify-center mb-10">
          <button
            onClick={() => setActiveTab("kairo")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-150",
              activeTab === "kairo"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            <Bot className="h-4 w-4" />
            Ask Kairo
          </button>
          <button
            onClick={() => setActiveTab("inquiry")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-150",
              activeTab === "inquiry"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            <Mail className="h-4 w-4" />
            Submit Inquiry
          </button>
        </div>

        {/* Kairo panel */}
        {activeTab === "kairo" && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Description */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                  <Bot className="h-3.5 w-3.5" />
                  AI-Powered Support
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground text-balance">
                  Get instant answers from Kairo
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Kairo is Kronova&apos;s intelligent support assistant, trained on our full platform documentation, blog articles, and technical guides. Ask anything about AetherNet QUAS, multi-agent orchestration, RWA tokenization, or your account.
                </p>
              </div>

              <ul className="flex flex-col gap-3">
                {[
                  "Available 24/7 — no waiting",
                  "Grounded in Kronova platform knowledge",
                  "Escalates complex issues to the team",
                  "Supports text and voice input",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA card */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Chat with Kairo</CardTitle>
                <CardDescription>
                  Kairo is ready to help right now. Click the button below to open the chat panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    // Trigger the global UnifiedFAB chat — dispatch a custom event
                    window.dispatchEvent(new CustomEvent("kronova:open-kairo"))
                  }}
                >
                  Open Kairo Chat
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Or click the chat icon in the bottom-right corner of any page.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inquiry panel */}
        {activeTab === "inquiry" && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Description */}
            <div className="flex flex-col gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                  <Mail className="h-3.5 w-3.5" />
                  Human Support
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground text-balance">
                  Submit an inquiry to our team
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  For billing, account access, enterprise contracts, or anything that requires a human, submit an inquiry and we&apos;ll respond within 24 hours.
                </p>
              </div>

              <ul className="flex flex-col gap-3">
                {[
                  "Response within 24 hours",
                  "Confirmation email sent immediately",
                  "Direct line to the Kronova team",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="text-sm text-muted-foreground">
                Or email us directly at{" "}
                <a href="mailto:help@kronova.io" className="text-primary hover:underline font-medium">
                  help@kronova.io
                </a>
              </div>
            </div>

            {/* Inquiry form */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Send a message</CardTitle>
                <CardDescription>We&apos;ll respond within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Message sent</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Check your inbox for a confirmation. We&apos;ll be in touch within 24 hours.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSubmitted(false)}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Your name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          disabled={isPending}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@company.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          disabled={isPending}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Describe your issue or question in as much detail as possible..."
                        value={form.message}
                        onChange={handleChange}
                        required
                        disabled={isPending}
                        rows={5}
                        className="resize-none"
                      />
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-md">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button type="submit" className="w-full gap-2" disabled={isPending}>
                      {isPending ? "Sending..." : "Send Message"}
                      {!isPending && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  )
}
