"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { requestPasswordReset } from "@/app/actions/password-reset"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email)

      const result = await requestPasswordReset(formData)

      if (result.success) {
        setIsSubmitted(true)
        toast({
          title: "Check your email",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error requesting password reset:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reset your password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send reset link"}
                  </Button>
                  <p className="text-sm text-gray-500">
                    Remember your password?{" "}
                    <Link href="/login" className="text-blue-500 hover:underline">
                      Log in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md text-green-800 dark:bg-green-900 dark:text-green-100">
                  <p>If an account exists with this email, you will receive password reset instructions shortly.</p>
                  <p className="mt-2">Please check your email and follow the instructions to reset your password.</p>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/login")}>
                  Return to login
                </Button>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
