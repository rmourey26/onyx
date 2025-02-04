"use client"
// app/checkout/checkoutForm.tsx
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "@/lib/utils";
import { useTransition } from "react";
import { result } from 'lodash';

const CheckoutSchema = z.object({
  email: z.string().email(),
  name: z
      .string()
      .min(2, {
        message: "Name must be at least 2 characters.",
      })
      .max(30, {
        message: "Name must not be longer than 30 characters.",
      }),

});

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof CheckoutSchema>>({
      resolver: zodResolver(CheckoutSchema),
      defaultValues: {
        email: "",
        name: "",
      },
    });

  function onSubmit(data: z.infer<typeof CheckoutSchema>) {
      startTransition(async () => {
        if (!stripe || !elements) {
          // Stripe.js hasn't yet loaded.
          // Make sure to disable form submission until Stripe.js has loaded.
          return;
        }
    
        const result = await stripe.confirmPayment({
          //`Elements` instance that was used to create the Payment Element
          elements,
          confirmParams: {
            return_url: "https://example.com/order/123/complete",
          },
        });
  
        if (result.error) {
          toast({
            title: "Stripe payment failed!",
            description: (
              <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                <code className="text-white">{result.error.message}</code>
              </pre>
            ),
          });
        } else {
          toast({
            title: "Successfull payment 🎉",
          });
        }
      });
    }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
    </form>
  )
};

export default CheckoutForm;