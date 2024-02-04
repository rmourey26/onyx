"use client";
import {  Menu } from "@headlessui/react";
import { FormStepComponentType } from '@/components/forms/formstepprops'
import { Button } from '@mui/material'
import FormikCustomDropdown from '@/components/forms/formikcustomdropdown'
import { ErrorMessage, Field, FieldArray } from "formik"
import FormikTextField from '@/components/forms/formiktextfield';
import OnboardingProgess from '@/components/onboarding-progress'
import React, { useState } from "react";

const Page4: FormStepComponentType = (props) => {
  const [rulesFlow, setRulesFlow] = useState("automatic");
  const customRuleTemplate = ({
    custom_rules_name: "",
    custom_rules_answer: "",
    custom_rules_select: "Match users with same answers",
  });

  const isCustom = rulesFlow !== "automatic";
  

  const handleChangeType = (type: string, resetForm: any) => {
    if (type === "custom") {
      setRulesFlow("custom");
    
    } else {
      setRulesFlow("automatic");
      
    }
  };
  

  return (
<>



  

      <OnboardingProgess step={4} />
      <div className="px-4 py-8">
            <div className="max-w-md mx-auto">
      <h1 className="text-3xl text-slate-800 dark:text-slate-100 font-bold mb-6">Onyx OCR ✨</h1>
     
      <FormikTextField className="form-input w-full" name="custom_rules_name" label="What department do you work in?" />
      <FormikTextField className="form-input w-full" name="custom_rules_answer" label="Answer separated by commmas (John, " type="text" />
      <label className="flex-1 relative block cursor-pointer">
                            <input
                              type="radio"
                              name="radio-buttons"
                              className="peer sr-only"
                              defaultChecked
                              onClick={() => handleChangeType("automatic", "resetForm")}
                            />
                            <div className="h-full text-center bg-white dark:bg-slate-800 px-4 py-6 rounded border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm duration-150 ease-in-out">
                              <svg className="inline-flex w-10 h-10 shrink-0 fill-current mb-2" viewBox="0 0 40 40">
                                <circle className="text-coolGray-100" cx="20" cy="20" r="20" />
                                <path className="text-slate-950" d="m26.371 23.749-3.742-1.5a1 1 0 0 1-.629-.926v-.878A3.982 3.982 0 0 0 24 17v-1.828A4.087 4.087 0 0 0 20 11a4.087 4.087 0 0 0-4 4.172V17a3.982 3.982 0 0 0 2 3.445v.878a1 1 0 0 1-.629.928l-3.742 1.5a1 1 0 0 0-.629.926V27a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.323a1 1 0 0 0-.629-.928Z" />
                              </svg>
                              <div className="font-medium text-slate-800 dark:text-slate-100 mb-1">Auto OCR</div>
                              <div className="text-sm">Onxy will handle everything</div>
                            </div>
                            <div className="absolute inset-0 border-2 border-transparent peer-checked:border-indigo-400 dark:peer-checked:border-slate-950 rounded pointer-events-none" aria-hidden="true"></div>
                          </label>
                          <label className="flex-1 relative block cursor-pointer">
                            <input
                              type="radio"
                              name="radio-buttons"
                              className="peer sr-only"
                              onClick={() => setRulesFlow("custom")}
                            />
                            <div className="h-full text-center bg-white dark:bg-slate-800 px-2 py-6 rounded border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm duration-150 ease-in-out">
                              <svg className="inline-flex w-10 h-10 shrink-0 fill-current mb-2" viewBox="0 0 40 40">
                                <circle className="text-coolGray-100" cx="20" cy="20" r="20" />
                                <path className="text-slate-950" d="m26.371 23.749-3.742-1.5a1 1 0 0 1-.629-.926v-.878A3.982 3.982 0 0 0 24 17v-1.828A4.087 4.087 0 0 0 20 11a4.087 4.087 0 0 0-4 4.172V17a3.982 3.982 0 0 0 2 3.445v.878a1 1 0 0 1-.629.928l-3.742 1.5a1 1 0 0 0-.629.926V27a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.323a1 1 0 0 0-.629-.928Z" />
                                <circle className="text-coolGray-100" cx="20" cy="20" r="20" />
                                <path className="text-coolGray-300" d="m30.377 22.749-3.709-1.5a1 1 0 0 1-.623-.926v-.878A3.989 3.989 0 0 0 28.027 16v-1.828c.047-2.257-1.728-4.124-3.964-4.172-2.236.048-4.011 1.915-3.964 4.172V16a3.989 3.989 0 0 0 1.982 3.445v.878a1 1 0 0 1-.623.928c-.906.266-1.626.557-2.159.872-.533.315-1.3 1.272-2.299 2.872 1.131.453 6.075-.546 6.072.682V28a2.99 2.99 0 0 1-.182 1h7.119A.996.996 0 0 0 31 28v-4.323a1 1 0 0 0-.623-.928Z" />
                                <path className="text-slate-950" d="m22.371 24.749-3.742-1.5a1 1 0 0 1-.629-.926v-.878A3.982 3.982 0 0 0 20 18v-1.828A4.087 4.087 0 0 0 16 12a4.087 4.087 0 0 0-4 4.172V18a3.982 3.982 0 0 0 2 3.445v.878a1 1 0 0 1-.629.928l-3.742 1.5a1 1 0 0 0-.629.926V28a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.323a1 1 0 0 0-.629-.928Z" />
                              </svg>
                              <div className="font-medium text-slate-800 dark:text-slate-100 mb-1">Set Custom Params</div>
                              <div className="text-sm">Whats your painpoint?</div>
                            </div>
                            <div className="absolute inset-0 border-2 border-transparent peer-checked:border-indigo-400 dark:peer-checked:border-slate-950 rounded pointer-events-none" aria-hidden="true"></div>
                          </label>
                        </div>
                        <div>
                          <FieldArray name="rows">
                            
                            {({ push, remove, form }) => {
                              const { values } = form;
                            
                            
                              return (
                                <div>
                                  {isCustom &&
                                    values.rows.length > 0 &&
                                    values.rows.map((row:any, idx: any) => (
                                      <div className="row" key={idx}>
                                        <label htmlFor={`rows.[${idx}].custom_rules_name`} className="block text-xs mb-2">
                                          Question #{idx + 1}{" "}
                                          <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="col mb-4">
                                          <div className="flex">
                                            <Field
                                              name={`rows.[${idx}].custom_rules_name`}
                                              id="custom_rules_name"
                                              className="form-input w-full"
                                              type="text"
                                              placeholder="What department are you in?"
                                            />
                                            {/* <button
                                    type="button"
                                    className="form-input ml-4"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M11.7 0.3C11.3 -0.1 10.7 -0.1 10.3 0.3L0.3 10.3C0.1 10.5 0 10.7 0 11V15C0 15.6 0.4 16 1 16H5C5.3 16 5.5 15.9 5.7 15.7L15.7 5.7C16.1 5.3 16.1 4.7 15.7 4.3L11.7 0.3ZM4.6 14H2V11.4L8 5.4L10.6 8L4.6 14ZM9.40039 3.9999L12.0004 6.5999L13.6004 4.9999L11.0004 2.3999L9.40039 3.9999Z"
                                        fill="#64748B"
                                      />
                                    </svg>
                                  </button> */}
                                          </div>
                                          <ErrorMessage
                                            name={`rows.[${idx}].custom_rules_name`}
                                            component="div"
                                            className="mt-2 text-sm text-red-600"
                                          />
                                        </div>

                                        <div className="mb-4">
                                          <div className="flex"> 
                                            <label htmlFor="custom_rules_answer" className="block text-xs mb-2"></label>
                                            <Field
                                              id="custom_rules_answer"
                                              name={`rows.[${idx}].custom_rules_answer`}
                                              className="form-input w-full"
                                              type="text"
                                              placeholder="Answer separated with commas (John, Bill, Tim)"
                                            />
                                          </div>
                                          <ErrorMessage
                                            name={`rows.[${idx}].custom_rules_answer`}
                                            component="div"
                                            className="mt-2 text-sm text-red-600"
                                          />
                                          <div className="mt-2">
                                           <button className="mt-2 btn bg-slate-950 hover:bg-indigo-600 text-white ml-auto" onClick={() => remove(idx)}> - Remove</button>
                                       </div>

                                        </div>
                                         <label htmlFor="custom_rules_select" className="block text-xs mb-2">Match Strategy</label>
<FormikCustomDropdown name={'custom_rules_select'} options={[
 {
   label: "Match users with same answers",
   value: 'Match users with same answers',
 },
 {
   label: "Match users with different answers",
   value: 'Match users with different answers',
 },
 {
   label: "Question should not affect matching",
   value: 'Question should not affect matching',
 },]} />   
                                        <div className="mb-4">
                                        
                                              
     
                                          <div className="flex justify-between w-full">
                                            <div>
                                          <label htmlFor="min_answers" className="block text-xs mb-2">Min Matches</label>
 <FormikCustomDropdown name={'min_answers'} options={[{
                  label: "1 match",
                  value: 1,
                },
                {
                  label: "2 matches",
                  value: 2,
                },
                {
                  label: "3 matches",
                  value: 3,
                },
                ]} />    
                </div>
                <div>
<label htmlFor="max_answers" className="block text-xs mb-2">Max Matches</label>
 <FormikCustomDropdown name={'max_answers'} options={[{
                  label: "2 matches",
                  value: 2,
                },
                {
                  label: "3 matches",
                  value: 3,
                },
                {
                  label: "4 matches",
                  value: 4,
                },
                ]} /> 
                </div>
                
 
 
 
 
 
       
      
 
 
      
      
    


                                          
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  <label
                                    className="block text-xs mb-4"
                                    htmlFor="question"
                                  >
                                    Create{" "}
                                    {values.rows.length === 0 ? "New" : "Another"}{" "}
                                    Matching Rule
                                    <span className="text-rose-500">*</span>
                                  </label>


                                  <a
                                    className={`btn ml-auto cursor-pointer ${isCustom
                                      ? "bg-slate-950 hover:bg-indigo-600 text-white"
                                      : "bg-gray-200 text-gray-400"
                                      }`}
                                    onClick={
                                      isCustom ? () => push({custom_rules_name: '', custom_rules_answer:'', min_answers: 0}) : undefined
                                      
                                    }
                                    
                                  >
                                    <svg
                                      className="pr-2 inline-flex shrink-0 fill-current"
                                      width="17"
                                      height="16"
                                      viewBox="0 0 17 16"
                                    >
                                      <path
                                        className={
                                          isCustom ? "text-coolGray-300" : "text-gray-400"
                                        }
                                        opacity="0.8"
                                        d="M15.7693 7H9.82054V1C9.82054 0.4 9.42396 0 8.82908 0C8.23421 0 7.83763 0.4 7.83763 1V7H1.88891C1.29404 7 0.897461 7.4 0.897461 8C0.897461 8.6 1.29404 9 1.88891 9H7.83763V15C7.83763 15.6 8.23421 16 8.82908 16C9.42396 16 9.82054 15.6 9.82054 15V9H15.7693C16.3641 9 16.7607 8.6 16.7607 8C16.7607 7.4 16.3641 7 15.7693 7Z"
                                      />
                                    </svg>
                                    Add Rule
                                  </a>

                                
                                </div>
                              )
                            }}
                                    </FieldArray>
                            
                        </div>

                
                <div className="flex justify-center gap-2">
     
       <Button  color="inherit" variant="contained" onClick={props.onPrevious}>
          Back
        </Button>
        
        
        <Button
          color="inherit" variant="contained"
          onClick={props.onNext}
      
        >
          Complete
        </Button>
      
      </div>
      </div>
     
      </>
    
  );
};

export default Page4;
