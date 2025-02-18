import { Bitcoin, Cloud, Shield, Zap } from "lucide-react"

const features = [
  {
    name: "Blockchain AI Analytics",
    description: "Harness the power of blockchain and AI to derive actionable insights from your data.",
    icon: Bitcoin,
  },
  {
    name: "Hybrid Architecture",
    description: "Scalable, resilient, and efficient solutions built for the digital era",
    icon: Cloud,
  },
  {
    name: "Enterprise-Grade Security",
    description: "State-of-the-art security measures to protect your most valuable assets now and into the quantum era.",
    icon: Shield,
  },
  {
    name: "High-Performance Systems",
    description: "Optimized for speed and efficiency, our solutions deliver unparalleled performance and energy efficiency.",
    icon: Zap,
  },
]

export default function Features() {
  return (
    <section className="container space-y-16 py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-extrabold leading-[1.1]">Cutting-Edge Solutions</h2>
        <p className="mt-4 text-muted-foreground">
          Discover how Onyx can transform your business with our patented reusable packaging and blockchain platform.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.name} className="relative overflow-hidden rounded-lg border bg-background p-8">
            <div className="flex items-center gap-4">
              <feature.icon className="h-8 w-8" />
              <h3 className="font-bold">{feature.name}</h3>
            </div>
            <p className="mt-2 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}