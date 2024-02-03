// components/signu/Page1.tsx
"use client";
import { Button } from "@mui/material";
import React from "react";
import { FormStepComponentType } from '@/components/forms/formstepprops';
import FormikTextField from '@/components/forms/formiktextfield'

const Page1: FormStepComponentType = (props) => {
  return (
    <div className="flex-col gap-2 w-[400px] flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
      <FormikTextField sx={{ boxShadow:0}} variant="outlined" name="email" label="Email" />
      <FormikTextField sx={{ boxShadow:0}} variant="outlined" name="password" label="Password" type="password" />
      <Button variant="contained" onClick={props.onNext}>
        Next
      </Button>
    </div>
  );
};

export default Page1;

