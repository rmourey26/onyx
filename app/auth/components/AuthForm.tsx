"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Icons } from "@/components/icons"
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
import { toast } from "@/components/ui/use-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "@/lib/utils";
import { useTransition } from "react";
import { loginWithEmailAndPassword } from "../actions";
import { AuthTokenResponse } from "@supabase/supabase-js";

const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1, { message: "Password can not be empty" }),
});

export default function AuthForm() {
	const [isPending, startTransition] = useTransition();

	const form = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function onSubmit(data: z.infer<typeof LoginSchema>) {
		startTransition(async () => {
			const { error } = JSON.parse(
				await loginWithEmailAndPassword(data)
			) as AuthTokenResponse;

			if (error) {
				toast({
					title: "Fail to login",
					description: (
						<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
							<code className="text-white">{error.message}</code>
						</pre>
					),
				});
			} else {
				toast({
					title: "Successfully login 🎉",
				});
			}
		});
	}

	return (
		<div className="w-96">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full space-y-6"
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder="email@example.com" {...field} />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										placeholder="password"
										{...field}
										type="password"
									/>
								</FormControl>
								<FormDescription>
									{
										"Forget password? Please contact your admin for assistance."
									}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
    <Button
				className="w-full flex items-center gap-2"
				variant="outline"
			>
				Log In{" "}
				<AiOutlineLoading3Quarters
					className={cn(" animate-spin", { hidden: !isPending })}
				/>
			</Button>
				</form>
			</Form>
		</div>
	);
}