import React from "react";
import AuthForm from "@/app/auth-server-action/components/AuthForm";
import { readUserSession } from "@/utils/actions";
import { redirect } from "next/navigation";

export default async function page() {
	const { data: userSession } = await readUserSession();

	if (userSession.session) {
		return redirect("/dashboard");
	}
	return (
		<div className="flex items-center justify-center h-screen">
			<AuthForm />
		</div>
	);
}