import { signOut } from "@/app/auth/actions";
import { SignOut }from "@/components/sign-out";
import { readUserSession } from "@/utils/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useTransition } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { redirect } from "next/navigation";

export default async function page() {

        const { data: userSession } = await readUserSession();

        if (!userSession.session) {
                return redirect("/");
        }

    return (
          <div className="container px-4 py-8 items-centered">
          <div className="mt-6">
                          <h1 className="text-2xl text-center font-semibold tracking-tight mb-4">Sign out of Onyx</h1>
            <SignOut/>
</div>
</div>
    )
        
}