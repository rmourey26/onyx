"use server";

import { createSupbaseServerClient } from "@/utils/supaone";
import { redirect } from "next/navigation";

export async function loginWithEmailAndPassword(formData: FormData) {
 const supabase = await createSupbaseServerClient();	
 const data = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	  }

	

	const result = await supabase.auth.signInWithPassword(data);
	return JSON.stringify(result);
}

export async function logout() {
	const supabase = await createSupbaseServerClient();
	await supabase.auth.signOut();
	redirect("/auth");
}