// components/signup/SignUpForm.tsx
"use client";
import { Form, Formik, FormikHelpers } from "formik";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FormStepComponentType } from '@/components/forms/formstepprops'
import { FormValues } from '@/lib/form'
import { createBrowserClient } from '@supabase/ssr'


type Props = {
  steps: FormStepComponentType[];
};
const SignUpForm = ({ steps }: Props) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  
  const handleSubmit = async (values: FormValues, {setSubmitting}: FormikHelpers<FormValues>) => {
    setSubmitting(true)
    
    
     
     
       
      
    try {
      const { data, error } = await supabase.from('gpt_one')
     
      .insert({
        
          email: values.email,
          company_name: values.company_name,
          
          

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
     
      setSubmitting(false);
      
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
