"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Icons } from "@/components/icons"
import { ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "@/lib/utils";
import { useTransition, useState } from "react";
import { updateInqueries } from '@/app/contact/actions'

const ContactSchema = z.object({
        name: z.string().min(1, { message: "Name can not be empty" }),
        email: z.string().email(),
        message: z.string().min(1, { message: "Message can not be empty" }),
});
type ContactValues = z.infer<typeof ContactSchema>
export function Contact() {
        const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<boolean>(false)

        const form = useForm<z.infer<typeof ContactSchema>>({
                resolver: zodResolver(ContactSchema),
                defaultValues: {
                        name: "",
                        email: "",
                        message: "",
                },
        });

        function onSubmit(data: ContactValues) {
     setIsLoading(true)   
     updateInqueries(data)
    toast({
      title: "Thank you for contacting Onyx. We received your inquiry and will respond within 24 hours. You may navigate away from this page.",

    });

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)

  }



        return (

                        <Form {...form}>
                                <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="w-full px-2 space-y-6"
                                >
<FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                        <FormItem>
                                                                <FormLabel>Name</FormLabel>
                                                                <FormControl>
                                                                        <Input placeholder="Satoshi Nakamoto" {...field} />
                                                                </FormControl>

                                                                <FormMessage />
                                                        </FormItem>
                                                )}
                                        />
                                             <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                        <FormItem>
                                                                <FormLabel>Email</FormLabel>
                                                                <FormControl>
                                                                        <Input placeholder="email@example.com" {...field} disabled={isLoading}/>
                                                                </FormControl>

                                                                <FormMessage />
                                                        </FormItem>
                                                )}
                                        />
                                        <FormField
                                                control={form.control}
                                                name="message"
                                                render={({ field }) => (
                                                        <FormItem>
                                                                <FormLabel>Message</FormLabel>
                                                                <FormControl>
                                                                        <Textarea
                                                                                placeholder="message"
                                                                                {...field}

                                                                        />
                                                                </FormControl>
                                                                <FormDescription>
                                                                        {
                                                                                "This a form description"
                                                                        }
                                                                </FormDescription>
                                                                <FormMessage />
                                                        </FormItem>
                                                )}
                                        />
           <Button
            type="submit"
            disabled={isLoading}
                                className="w-full flex items-center gap-2"
                                variant="outline"
                        >
                                Send Message
                                <ChevronRight/>
   </Button>
                                </form>
                        </Form>
        );
        }