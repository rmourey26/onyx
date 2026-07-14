import type { ReactNode } from "react"

interface UseCaseCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function UseCaseCard({ icon, title, description }: UseCaseCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-card-foreground/80">{description}</p>
    </div>
  )
}
