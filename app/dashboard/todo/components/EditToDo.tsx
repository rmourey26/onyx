import React from "react";
import DailogForm from "./DialogForm";
import { Button } from "@/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";
import MemberForm from "./TodoForm";

export default function EditTodo() {
	return (
		<DailogForm
			id="update-trigger"
			title="Edit Todo"
			Trigger={
				<Button variant="outline">
					<Pencil1Icon />
					Edit
				</Button>
			}
			form={<MemberForm isEdit={true} />}
		/>
	);
}