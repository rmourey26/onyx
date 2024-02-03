// components/signu/Page1.tsx
"use client";
import { Button } from "@/mui/material";
import React from "react";
import { FormStepComponentType } from '@/components/forms/formstepprops';
import FormikTextField from '@/components/forms/formiktextfield'
import OnboardingProgress from '@/components/onboarding-progress'

const Page1: FormStepComponentType = (props) => {
  return (
    <div className=" md:flex">

    {/* Content */}
    <div className="w-full md:w-1/2">
    <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">


    
      <OnboardingProgress step={1} />
 
    <div className="flex-col gap-2 w-[400px] box-shadow:0 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
      <FormikTextField className="form-input w-full" sx={{ boxShadow:0, '&:focus-within::before': { boxShadow: 0 } }} variant="standard" name="email" label="Email" />
      <FormikTextField className="form-input w full" sx={{ boxShadow:0}} variant="outlined" name="password" label="Password" type="password" />
      <Button variant="contained" onClick={props.onNext}>
        Next
      </Button>
    </div>
</div>
</div>
</div>
  );
};

export default Page1;

