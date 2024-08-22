"use server";

import { createSupbaseServerClient } from "@/utils/supaone";

import { redirect } from "next/navigation";

type formData = {
    email: string;
    password: string;
    username: string;
    role: string;
    status: string; 
}

export async function createMember(data:formData) {
const supabase = await createSupbaseServerClient();

try {

const { data: members_table, error } = await supabase
  .from('members_table')
  .insert(
    { email: data.email, password: data.password, username: data.username, role: data.role, status: data.status})
  .select()

const result = JSON.stringify(data)
  return result;


if (error) throw error
      alert('Member Created!')
    } catch (error) {
      alert('Error updating the data!')
    }
}
	console.log("create user");
}
 
}     

export async function updateMemberById(id: string) {
	console.log("update member");
}
export async function deleteMemberById(id: string) {}
export async function readMembers() {}