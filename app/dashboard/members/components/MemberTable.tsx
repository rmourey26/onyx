import { Button } from "@/components/ui/button";
import React from "react";
import { TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import ListOfMembers from "./ListOfMembers";
import DashboardTable from "@/components/ui/DashboardTable";

export default function MemberTable() {
	const tableHeader = ["Name", "Role", "Joined", "Status"];

	return (
		<DashboardTable headers={tableHeader}>
			<ListOfMembers />
		</DashboardTable>
	);
}