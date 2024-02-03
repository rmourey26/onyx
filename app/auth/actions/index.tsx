"use server";

import { createSupbaseServerClient } from "@/utils/supaone";
import { redirect } from "next/navigation";

export async function loginWithEmailAndPassword(data: {
	email: string;
	password: string;
}) {
	const supabase = await createSupbaseServerClient();

	const result = await supabase.auth.signInWithPassword(data);
	return JSON.stringify(result);
}

export async function logout() {
	const supabase = await createSupbaseServerClient();
	await supabase.auth.signOut();
	redirect("/auth");
}