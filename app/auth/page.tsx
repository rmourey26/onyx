import React from "react";
import AuthForm from "./auth-server-actions/components/AuthForm";
import { readUserSession } from "@/utils/actions/supaone";
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