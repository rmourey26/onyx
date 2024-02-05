import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { loginWithEmailAndPassword } from '@/app/auth/actions'
import { AuthTokenResponse } from "@supabase/supabase-js";
import { useTransition } from "react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ToastAction } from "@/components/ui/toast"
const SignInSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1, {
		message: "Password is required.",
	}),
});

export default function SignInForm() {
	const [isPending, startTransition] = useTransition();
 const form = useForm<z.infer<typeof SignInSchema>>({
		resolver: zodResolver(SignInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSignInSubmit = async(data: z.infer<typeof SignInSchema>) => {
		  startTransition(async () => {
			 const { error } = JSON.parse(
				await loginWithEmailAndPassword(data)
			) as AuthTokenResponse;
		
if (error)	{	

  toast({
			title: "You submitted the following values:",
			description: (
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">
						{JSON.stringify(data, null, 2)}
					</code>
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
		<Form {...form}>
			<form className="w-full space-y-6"
     onSubmit={form.handleSubmit((data) => onSignInSubmit(data))}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									placeholder="example@gmail.com"
									{...field}
									type="email"
									onChange={field.onChange}
								/>
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
									onChange={field.onChange}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
						<Button
				className="w-full flex items-center gap-2"
				variant="outline"
			>
				Sign In{" "}
				<AiOutlineLoading3Quarters
					className={cn(" animate-spin", { hidden: !isPending })}
				/>
			</Button>
			</form>
		</Form>
	);
}
