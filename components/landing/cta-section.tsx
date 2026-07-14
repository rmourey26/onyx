"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Rocket, Users, BookOpen } from "lucide-react"

export function CtaSection() {
  return (
    <section className="py-20 md:py-32 bg-background text-foreground">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Pioneer the Future of Business with Aether
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
            Join us in building a new era of intelligent, transparent, and sustainable enterprise. Whether you're
            looking to optimize your operations, invest in groundbreaking technology, or develop on a revolutionary
            platform, the Aether ecosystem is your launchpad.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/demo"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 shadow-lg shadow-primary/40 hover:shadow-primary/50 transition-shadow"
          >
            <Rocket className="mr-2 h-5 w-5" /> Request AetherNet Demo
          </Link>
          <Link
            href="/contact-sales"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-8"
          >
            <Users className="mr-2 h-5 w-5" /> Partner with Us
          </Link>
          <Link
            href="/whitepaper"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-12 px-8"
          >
            <BookOpen className="mr-2 h-5 w-5" /> Read Whitepaper
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
