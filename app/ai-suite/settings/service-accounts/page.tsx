import { listServiceAccounts } from "@/app/actions/service-account-actions"
import { ServiceAccountManager } from "@/components/ai-suite/service-accounts/service-account-manager"
import { Shield } from "lucide-react"

export const metadata = {
  title: "Service Accounts — Kronova Settings",
  description: "Manage machine identities and their associated API keys.",
}

export default async function ServiceAccountsPage() {
  const { data: accounts } = await listServiceAccounts()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 border border-primary/20 flex items-center justify-center shrink-0">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold enterprise-text-gradient">Service Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Machine identities for automated workloads. Keys owned by a service account are never revoked when a human user leaves.
          </p>
        </div>
      </div>

      {/* Info callout */}
      <div className="glass-morphism rounded-xl border border-primary/15 px-4 py-3 text-sm text-muted-foreground">
        <strong className="text-foreground">How it works:</strong> Create a service account, then go to{" "}
        <a href="/ai-suite/settings/api-keys" className="text-primary hover:underline">API Keys</a>{" "}
        to issue keys that reference this account. Use those keys in CI/CD pipelines, agents, and integrations.
      </div>

      <ServiceAccountManager initialAccounts={accounts} />
    </div>
  )
}
