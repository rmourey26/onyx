"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Zap, ArrowRight, Users, Cpu } from "lucide-react"
import Link from "next/link"

export function RoiSustainabilityFocusSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Exponential Efficiency, Verifiable ROI</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Move beyond incremental improvements. Our platform is engineered to deliver a step-change in operational
            performance and quantifiable business value.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative aspect-video rounded-xl overflow-hidden shadow-2xl group"
          >
            <Image
              src="/images/landing/workflow-roi-sustainability-dashboard.png"
              alt="Dashboard showing exponential ROI and efficiency metrics"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="text-xl font-semibold">Actionable Intelligence</h3>
              <p className="text-sm opacity-90 mt-1">Powered by the Aether Ecosystem.</p>
            </div>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                icon: <Zap className="h-7 w-7 text-primary" />,
                title: "Up to 200x Faster Results",
                description:
                  "Autonomous AI agents operate in parallel, 24/7, delivering actionable results and completing complex workflows at a speed traditional computing and manual processes cannot match.",
              },
              {
                icon: <Users className="h-7 w-7 text-primary" />,
                title: "Massive Labor Hour Reduction",
                description:
                  "Automate entire categories of manual, repetitive, and cognitive tasks, freeing up your human team to focus on high-value strategic initiatives and innovation.",
              },
              {
                icon: <Cpu className="h-7 w-7 text-primary" />,
                title: "Optimized for Advanced IoT",
                description:
                  "Our platform is purpose-built for the demands of modern hardware, providing the necessary speed and security to manage fleets of drones, robotics, and medical devices.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                className="flex items-start gap-4 p-4 bg-card/50 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 mt-1">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
            <motion.div
              variants={cardVariants}
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              className="pt-4"
            >
              <Link
                href="/contact-sales"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full sm:w-auto"
              >
                Calculate Your ROI <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
