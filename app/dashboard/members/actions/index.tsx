"use server";

import { createSupbaseServerClient } from "@/utils/supaone";

import { redirect } from "next/navigation";

type formData = {
    email: string;
    password: string;
    confirm: string;
    username: string;
    role: string;
    status: string; 
}

export async function createMember() {
	console.log("create member");
}
export async function updateMemberById(id: string) {
	console.log("update member");
}
export async function deleteMemberById(id: string) {}
export async function readMembers() {}
