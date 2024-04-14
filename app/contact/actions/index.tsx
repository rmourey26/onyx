"use server";

import { createSupbaseServerClient } from "@/utils/supaone";

import { redirect } from "next/navigation";

type formData = {
    name: string;
    email: string;
    message: string;
}


export async function updateInqueries(data:formData) {
      const supabase = await createSupbaseServerClient();

try {

const { data: inqueries, error } = await supabase
  .from('inqueries')
  .insert(
    { name: data.name, email: data.email, message: data.message})
  .select()

const result = JSON.stringify(data)
  return result;


if (error) throw error
      alert('Message sent!')
    } catch (error) {
      alert('Error updating the data!')
    }
}