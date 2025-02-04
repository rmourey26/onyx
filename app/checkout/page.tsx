"use client"
// app/checkout/page.tsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './checkoutForm'; // Import your custom form component

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

    const handlePaymentIntentCreation = async (amount: number) => {
        const response = await fetch('/api/stripe', {
              method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ amount }),
                              });
                                  const data = await response.json();
                                      setClientSecret(data.clientSecret);
                                        };

                                          return (
                                              <div>
                                                    <h1>Checkout</h1>
                                                          {clientSecret && (
                                                                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                                            <CheckoutForm />
                                                                                    </Elements>
                                                                                          )}
                                                                                                {!clientSecret && (
                                                                                                        <button onClick={() => handlePaymentIntentCreation(1000)}>
                                                                                                                  Pay $10
                                                                                                                          </button>
                                                                                                                                )}
                                                                                                                                    </div>
                                                                                                                                      );
                                                                                                                                      }