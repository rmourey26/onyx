// components/signup/SignUpForm.tsx
"use client";
import { Form, Formik } from "formik";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FormStepComponentType } from '../formstepsprops'
import { FormValues } from "@/lib/form";

type Props = {
  steps: FormStepComponentType[];
};
const SignUpForm = ({ steps }: Props) => {
  const handleSubmit = async (values: FormValues, {setSubmitting}) => {
    setIsSubmitting(true)
    class MatchRule {
      custom_rules_answer: any
      custom_rules_name: any
      custom_rules_select: any
      max_answers: any
      min_answers: any
      constructor(custom_rules_answer, custom_rules_name, max_answers, min_answers, custom_rules_select) {
        this.custom_rules_answer = custom_rules_answer;
        this.custom_rules_name = custom_rules_name;
        this.custom_rules_select = custom_rules_select;
        this.max_answers = max_answers;
        this.min_answers = min_answers;
      }
      toString() {
        return `${this.custom_rules_name} ${this.custom_rules_select} ${this.custom_rules_answer} ${this.max_answers} ${this.min_answers}`;
      }
    }
     
     let Temp = Array.from(values.rows.values());
     function extractValue(arr: Object[], prop: string) {
        let extractedValue = arr.map(item => item[prop]);
           return extractedValue as unknown as string;
      }
      let result: string = extractValue(Temp, 'custom_rules_answer');
      let nameresult:string = extractValue(Temp, 'custom_rules_name');
      let tempstring:string = extractValue(Temp, 'custom_rules_name');
      let cxstring: string = extractValue(Temp, 'custom_rules_select');
      result = result.toString();
      tempstring = tempstring.toString()
       
      
    try {
      const { data, error } = await supabase.from('questions')
     
      .insert({
        
          custom_rules_name: tempstring,
          custom_rules_answer: result,
          min_answers: values.min_answers,
          max_answers: values.max_answers,
          custom_rules_select: values.custom_rules_select,
          
          

          updated_at: new Date().toISOString(),
           
      })
      
      
      Array.prototype.forEach.call(values.rows, (x) => console.log(x));
      
      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully:', data);
        console.log(values.rows)
        // Clear form values or handle success actions
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
     
      setIsSubmitting(false);
      
    }
  };
  


  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("step"); // get the current step using search params
  const pageIndex = page ? +page : 1;
  // get the step component
  const StepComponent = steps.at(pageIndex - 1);
  const stepExists = !!StepComponent;
  return (
    // use Formik context to handle the form state and onSubmit
    <Formik
      onSubmit={(values: any) => {
        console.log(values);
      }}
      initialValues={{
        email: "",
        company_name: "",
        plan_provider: "",
        preferred_provider: "",
        program_description: "",
        query_rate: "",
        gender: "",
        age: "",
        chronic: "",
        zipcode: "",
        plan_id: "",
        user_input: "",
        rows: [],
        people: [],
        budget_min: 0,
        budget_max: 0,
        custom_param_one: '',
        custom_param_two: '',
        organization_name: '',

      }}
    >
      <Form>
        {/* render the step component if it exists */}
        {!!stepExists && (
          <StepComponent
            onNext={() => {
              // navigate to next page if it is not the last page using `router.push`
              if (pageIndex < steps.length) {
                const nextPage = pageIndex + 1;
                router.push(`/signup?step=${nextPage}`);
              }
            }}
            onPrevious={() => {
              // navigate to the previous page using `router.push`
              const prevPage = pageIndex - 1;
              if (prevPage > 1) {
                router.push(`/signup?step=${prevPage}`);
              } else {
                router.push("/signup");
              }
            }}
          />
        )}
      </Form>
    </Formik>
  );
};

export default SignUpForm;