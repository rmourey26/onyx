"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Rocket, Users, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
      {/* Ambient orbs */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="enterprise-card p-10 md:p-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl enterprise-text-gradient">
            Pioneer the Future of Business with Aether
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl leading-relaxed">
            Join us in building a new era of intelligent, transparent, and sustainable enterprise. Whether you&apos;re
            looking to optimize your operations, invest in groundbreaking technology, or develop on a revolutionary
            platform, the Aether ecosystem is your launchpad.
          </p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button asChild size="lg" className="enterprise-button h-12 px-8">
              <Link href="/demo">
                <Rocket className="mr-2 h-5 w-5" /> Request AetherNet Demo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Link href="/contact-sales">
                <Users className="mr-2 h-5 w-5" /> Partner with Us
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-12 px-8 hover:bg-primary/5 hover:text-primary transition-all">
              <Link href="/whitepaper">
                <BookOpen className="mr-2 h-5 w-5" /> Read Whitepaper
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
