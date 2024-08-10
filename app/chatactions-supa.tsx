"use server";

import { createSupbaseServerClient } from "@/utils/supaone";


import { redirect } from "next/navigation";

type formData = {
    id: string;
    message: string;
    user_id: string;
}


export async function updateChat(data:formData) {
      
  const supabase = await createSupbaseServerClient();

      try {

           const { data: chat, error } = await supabase
              .from('chat')
              .insert(
                { id: data.id, message: data.message})
              .select()

            const result = JSON.stringify(data)
              return result;

                if (error) throw error
                  alert('Message sent!')
                } catch (error) {
                  alert('Error updating the data!')
                }
}

export async function getChat(data:formData) {
      
  const supabase = await createSupbaseServerClient();
       
      try {

            const { data: chat, error } = await supabase.from('chat')
                 
                .select('id, user_id, messages')
                

                const result = JSON.stringify(data)
                    return result;

            if (error) throw error
                alert('Message sent!')
              } catch (error) {
                alert('Error updating the data!')
              }
}

export async function getChats(data:formData) {
      
  const supabase = await createSupbaseServerClient();
       
      try {

            const { data: chat, error } = await supabase.from('chat')
                 
                .select('*')
                .range(0,9)
                .eq('user_id',data.user_id)
                

                const result = JSON.stringify(data)
                    return result;

              if (error) throw error
                alert('Message sent!')
              } catch (error) {
                alert('Error updating the data!')
              }
}
      
       
        
            