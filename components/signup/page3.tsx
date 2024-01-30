"use client";
import {  Menu } from "@headlessui/react";
import { FormStepComponentType } from '../formstepsprops'
import FormikSelect from '../formikselect'
import FormikTextField from "../formiktextfield";
import FormikCustomDropdown from "../formikcustomdropdown";
import OnboardingProgress from "@/app/(onboarding)/onboarding-progress";
import OnboardingHeader from "@/app/(onboarding)/onboarding-header";
import OnboardingImage from "@/app/(onboarding)/onboarding-image";

const Page3: FormStepComponentType = (props) => {
  return (
    <div className="md:flex">

    {/* Content */}
    <div className="w-full md:w-1/2">
    <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">

<OnboardingHeader />

      <OnboardingProgress step={3} />
      <h1 className="text-3xl text-slate-800 dark:text-slate-100 font-bold mb-6 mx-auto">Create New Match Program ✨</h1>
      <FormikTextField className="form-input w-full" name="program_name" label="Match Program Name"/>
      <FormikTextField className="form-input w-full" name="program_description" label="Program Description" type="text" />
      
      <label htmlFor="match_frequency" className="block text-xs mx-auto">When should we send your matches?</label>
<FormikCustomDropdown name={'match_frequency'} options={[
 {
   label: "Daily",
   value: 'Daily',
 },
 {
   label: "Weekly",
   value: 'Weekly',
 },
 {
   label: "Bi-weekly",
   value: 'Bi-weekly',
 },
 {
  label: "Monthly",
  value: 'Monthly',
}, ]} />   
      
      </div>
      <div className="flex justify-center gap-2">
        <button onClick={props.onPrevious} className="btn mt-4 bg-indigo-500 hover:bg-indigo-600 text-white ml-auto">
          Back
        </button>
        <button onClick={props.onNext} className="btn mt-4 bg-indigo-500 hover:bg-indigo-600 text-white mx-auto">
          Next
        </button>
      </div>
    
    <OnboardingImage />
    </div>
    </div>
  );
};

export default Page3;
