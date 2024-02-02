import React from "react";
import DailogForm from "../DialogForm";
import { Button } from "@/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";
import EditForm from "./EditForm";

export default function EditMember() {
	return (
		<DailogForm
			id="update-trigger"
			title="Edit Member"
			Trigger={
				<Button variant="outline">
					<Pencil1Icon />
					Edit
				</Button>
			}
			form={<EditForm />}
		/>
	);
}