import { Separator } from "@/components/ui/separator"
import { AccountForm } from "./supa-account-form"

export default function SettingsAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your profile..
        </p>
      </div>
      <Separator />
      <AccountForm />
    </div>
  )
}
