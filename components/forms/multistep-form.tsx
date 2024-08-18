"use client"

import 'react' from "react"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Component() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  })
  const handleNext = () => {
    setCurrentStep(currentStep + 1)
  }
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }
  const handleInputChange = (e:React.SynthenticEvent) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  function handleSubmit = (e:React.SyntheticEvent) => {
    e.preventDefault()
    console.log(formData)
  }
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-center">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="h-0.5 w-full bg-muted" />
          </div>
          <div className="relative z-10 flex justify-between">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              3
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Address</h2>
            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Zip</Label>
              <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} required />
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Payment Information</h2>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" name="cvv" value={formData.cvv} onChange={handleInputChange} required />
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {currentStep < 3 ? <Button onClick={handleNext}>Next</Button> : <Button type="submit">Submit</Button>}
        </div>
      </form>
    </div>
  )
}
