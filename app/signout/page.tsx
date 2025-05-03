import { signOut } from "@/app/auth/actions";
import { SignOut }from "@/components/sign-out";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useTransition } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function page() {

    return (
          <div className="container px-4 py-8 items-centered">
          <div className="mt-6">
                          <h1 className="text-2xl text-center font-semibold tracking-tight mb-4">Sign out of Onyx</h1>
            <SignOut/>
</div>
</div>
    )
        
}