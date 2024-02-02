"use server";
import { createSupbaseServerClientReadOnly } from "../supaone";

export async function readUserSession() {
	const supabase = await createSupbaseServerClientReadOnly();

	return supabase.auth.getSession();
}