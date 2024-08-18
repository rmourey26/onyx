import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="max-w-md w-full space-y-6 p-8 rounded-lg shadow-lg bg-card">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Join the Waitlist</h1>
          <p className="text-muted-foreground">Be the first to know when we launch our new product.</p>
        </div>
        <form className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" placeholder="Any additional comments" />
          </div>
          <Button type="submit" className="w-full">
            Join Waitlist
          </Button>
        </form>
      </div>
    </div>
  )
}