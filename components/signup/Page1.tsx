// components/signu/Page1.tsx
"use client";
import { Button } from "@mui/material";
import React from "react";
import { FormStepComponentType } from '@/components/forms/formstepprops';
import FormikTextField from '@/components/forms/formiktextfield'
import OnboardingProgress from '@/components/onboarding-progress'

const Page1: FormStepComponentType = (props) => {
  return (
  
<>
    {/* Content */}
    <div className="grid grid-col spacing={1} w-full md:w-1/2">
    <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">


    
      <OnboardingProgress step={1} />
 
    
      <FormikTextField className="form-input w-full" InputLabelProps={{sx: {boxShadow:0},}} sx={{ boxShadow:0, '&:focus-within::before': { boxShadow: 0 } }} variant="standard" name="email" label="Email" />
      <FormikTextField className="form-input w full" sx={{ boxShadow:0}} variant="outlined" name="password" label="Password" type="password" />
      <Button color="inherit" variant="contained" onClick={props.onNext}>
        Next
      </Button>
    </div>
</div>

</>
  );
};

export default Page1;

