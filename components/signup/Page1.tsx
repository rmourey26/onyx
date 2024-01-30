// components/signu/Page1.tsx
"use client";
import { Button } from "@mui/material";
import React from "react";
import { FormStepComponentType } from "@/components/signup/FormStepProps";
import FormikTextField from "../formik/FormikTextField";

const Page1: FormStepComponentType = (props) => {
  return (
    <div className="flex flex-col gap-2 w-[400px]">
      <FormikTextField name="email" label="Email" />
      <FormikTextField name="password" label="Password" type="password" />
      <Button variant="contained" onClick={props.onNext}>
        Next
      </Button>
    </div>
  );
};

export default Page1;

