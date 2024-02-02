import React from "react";
import ListOfTodo from "./ListOfTodo";
import Table from "@/components/ui/Table";

export default function TodoTable() {
	const tableHeader = ["Title", "Status", "Created at", "Created by"];

	return (
		<Table headers={tableHeader}>
			<ListOfTodo />
		</Table>
	);
}