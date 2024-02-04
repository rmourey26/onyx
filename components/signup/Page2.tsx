// components/signup/Page2.tsx
"use client";
import React from "react";
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
        <button onClick={props.onPrevious} className="btn mt-2 px-8 py-2 bg-slate-800 hover:bg-slate-600 text-white ml-auto">
          Back
        </button>
        
        
        <button
          
          onClick={props.onNext}
          className="btn px-2 py-8 mt-2 px-8 py-2 bg-slate-800 hover:bg-slate-600 text-white mx-auto"
        >
          Next
        </button>
        
      </div>
    </div>
   
    </div>
    </>
  );
};

export default Page2;
