"use client";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { toast } from "@/components/ui/use-toast";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createTodo, updateTodoById } from "../actions";
import { Checkbox } from "@/components/ui/checkbox";

const FormSchema = z.object({
	title: z.string().min(10, {
		message: "Title must be at least 10 characters.",
	}),
	completed: z.boolean(),
});

export default function TodoForm({ isEdit }: { isEdit: boolean }) {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			title: "",
			completed: false,
		},
	});

	const handleCreateMember = (data: z.infer<typeof FormSchema>) => {
		createTodo();

		document.getElementById("create-trigger")?.click();

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
	};

	const handleUpdateMember = (data: z.infer<typeof FormSchema>) => {
		updateTodoById("hello");
		document.getElementById("update-trigger")?.click();

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
	};

	function onSubmit(data: z.infer<typeof FormSchema>) {
		if (isEdit) {
			handleUpdateMember(data);
		} else {
			handleCreateMember(data);
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="w-full space-y-6"
			>
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input
									placeholder="todo title"
									type="text"
									{...field}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="completed"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel>complete</FormLabel>
							</div>
						</FormItem>
					)}
				/>
				<Button type="submit" className="w-full" variant="outline">
					Submit
				</Button>
			</form>
		</Form>
	);
}