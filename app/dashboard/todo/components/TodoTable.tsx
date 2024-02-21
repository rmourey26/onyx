import React from "react";
import ListOfTodo from "./ListOfTodo";
import DashboardTable from "@/components/ui/DashboardTable";

export default function TodoTable() {
	const tableHeader = ["Title", "Status", "Created at", "Created by"];

	return (
		<DashboardTable headers={tableHeader}>
			<ListOfTodo />
		</DashboardTable>
	);
}