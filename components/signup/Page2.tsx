// components/signup/Page2.tsx
"use client";
import React from "react";
import { Button } from '@mui/material'
import { FormStepComponentType } from '@/components/forms/formstepprops';

import FormikRadioGroup from '@/components/forms/formikradiogroup'
import OnboardingProgress from "@/components/onboarding-progress";


const Page2: FormStepComponentType = (props) => {
  return (
    <>

    {/* Content */}
    <div className="w-full md:w-1/2">
    <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">


    
      <OnboardingProgress step={2} />
      <h1 className="text-3xl text-slate-800 dark:text-slate-100 font-bold mb-6">How do you want to login? ✨</h1>
      <FormikRadioGroup
          name="match_type"
                      //add name props
          label=""
          options={[
            {
              label: "Email",
              value: 'Email',
            },
            {
              label: "Stripe",
              value: 'Stripe',
            },
            {
              label: "Plaid",
              value: 'Plaid',
            },
          ]}
        ></FormikRadioGroup>
     <div className="flex justify-center gap-2">
        <Button color="inherit" variant="contained" onClick={props.onPrevious}>
          Back
        </Button>
        
        
        <Button
          color="inherit" variant="contained"
          onClick={props.onNext}
      
        >
          Next
        </Button>
        
      </div>
    </div>
   
    </div>
    </>
  );
};

export default Page2;
