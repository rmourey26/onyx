import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import React, { ReactNode } from "react";

export default function DailogForm({
	Trigger,
	id,
	title,
	form,
}: {
	title: string;
	Trigger: ReactNode;
	id: string;
	form: ReactNode;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild id={id}>
				{Trigger}
			</DialogTrigger>
			<DialogContent className="px-4 py-4 sm:max-w-[525px] dark:bg-gradient-dark">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when
					</DialogDescription>
				</DialogHeader>
				{form}
			</DialogContent>
		</Dialog>
	);
}