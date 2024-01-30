import { ZodOptionalType } from "zod";

export type FormValues = {
    rows: {
      custom_param_one: string;
      custom_param_two: string;
    }[],
    budget_min: string;
    budget_max: string;
    age: number;
    chronic: string;
    zipcode: string;
    preferred_provider: string;
    company_name: string;
    email: string;
    gender: string;
    program_description: string;
    plan_provider: string;
    query_rate:string;
    organization_name: string;
    organization_id: string;
    plan_id: string;
    user_input: string;
    messages: string;
    vector_one: [string, number],
    first_name: string,
    last_name: string,
    full_name: string,
    password: string,
  
  }