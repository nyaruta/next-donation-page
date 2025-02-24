'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function DonationPage() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('CNY')
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'succeeded' | 'failed'>('initial')

  const createCheckoutSession = async (amount: number, currency: string) => {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const data = await response.json()
    return data.clientSecret
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPaymentStatus('processing')

    try {
      const secret = await createCheckoutSession(parseFloat(amount) * 100, currency)
      setClientSecret(secret)
    } catch (error) {
      console.error('Error:', error)
      setPaymentStatus('failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentStatus('succeeded')
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search)
      if (query.get('payment_intent_client_secret')) {
        setPaymentStatus('succeeded')
      }
    }
  }, [])

  if (paymentStatus === 'succeeded') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Thank You for Your Donation!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg mb-4">Your donation has been successfully processed.</p>
            <Button onClick={() => {
              setPaymentStatus('initial')
              setClientSecret('')
              setAmount('')
            }}>
              Make Another Donation
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Make a Donation</CardTitle>
          <CardDescription>Support our cause with a custom donation amount.</CardDescription>
        </CardHeader>
        {!clientSecret ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="currency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Currency
                </label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="HKD">HKD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent>
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{
                clientSecret,
                onComplete: handlePaymentSuccess
              }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
