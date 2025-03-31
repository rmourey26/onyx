"use client"

import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useTransition } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { readUserSession } from "@/utils/actions";
import { redirect } from "next/navigation";

export default async function AuthButton() {

         const { data: userSession } = await readUserSession();

        
        const [isPending, startTransition] = useTransition();
        const onSubmit = async () => {
                startTransition(async () => {
                        await signOut();
                });
        };

        
if (userSession.session) {
             
        
return (
                <form action={onSubmit}>
                        <Button
                                className="w-full flex items-center gap-2"
                                variant="outline"
                        >
                                SignOut{" "}
                                <AiOutlineLoading3Quarters
                                        className={cn(" animate-spin", { hidden: !isPending })}
                                />
                        </Button>
                </form>
        );
}

else  {

 return (

     <div className="hidden" />
 
 );

}

}