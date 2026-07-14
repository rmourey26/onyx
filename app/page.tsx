import type { Metadata } from "next"
import { HeroSection } from "@/components/landing/hero-section"
import { ProblemSolutionSection } from "@/components/landing/problem-solution-section"
import { EcosystemShowcase } from "@/components/landing/landing-feature-showcase"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { RoiSustainabilityFocusSection } from "@/components/landing/roi-sustainability-focus-section"
import { DeveloperApiSection } from "@/components/landing/developer-api-section"
import { CtaSection } from "@/components/landing/cta-section"
import { AppInstallBanner } from "@/components/app-install-banner"
import { PWARegister } from "@/components/pwa-register"

export const metadata: Metadata = {
  title: "Kronova Intelligent Systems",
  description:
    "Enterprise AI That Pays for Itself in 90 days. The only platform combining Canton Network, private stablecoins, 18 proprietary AI tools, voice command. Replace 12 vendors with one. See ROI in your first quarter.",
  keywords: [
    "Kronova",
    "Vertical AI",
    "AI Agents",
    "AI Agent Platform",
    "Autonomous Agents",
    "AI Workflow Automation",
    "Post-Quantum Blockchain",
    "IoT AI",
    "Robotics AI",
    "AI Communication Network",
    "Stablecoins",
    "Asset tokenization",
  ],
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        <HeroSection />
        {/*
        <ProblemSolutionSection />
        <EcosystemShowcase />
        <HowItWorksSection />
        <RoiSustainabilityFocusSection />
        <DeveloperApiSection />
        <CtaSection />
        */}
        
        
      </main>
      <AppInstallBanner />
      <PWARegister />
    </div>
  )
}
