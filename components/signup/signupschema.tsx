import { object, string } from "yup";

export const signupSchema = object({
  email: string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: string()
    .required("Password is required")
    .min(8, "Password should have a minimum of 8 characters")
    .matches(/\d/, "Password should have at least one number")
    .matches(/[A-Z]/, "Password should have at least one uppercase letter")
    .matches(/[a-z]/, "Password should have at least one lowercase letter"),
  first_name: string().required("First name is required"),
  last_name: string().required("Last name is required"),
  company_name: string().required("Intereset is required."),
});