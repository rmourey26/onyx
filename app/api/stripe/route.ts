// app/api/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", 
    typescript: true,
    });

    export async function POST(req: NextRequest) {
      const { amount } = await req.json();

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                  amount,
                        currency: 'usd', // Change to your desired currency
                              automatic_payment_methods: {
                                      enabled: true,
                                            },
                                                });

                                                    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
                                                      } catch (error) {
                                                          console.error('Error creating PaymentIntent:', error);
                                                              return NextResponse.json({ error: 'Failed to create PaymentIntent' }, { status: 500 });
                                                                }
                                                                }