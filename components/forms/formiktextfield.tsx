"use client";
import { TextField as MuiTextField, TextFieldProps } from "@mui/material";
import { FieldInputProps, useField } from "formik";

export type FormikTextFieldProps = { name: string } & TextFieldProps;
type TexFieldConfig = TextFieldProps & FieldInputProps<any>;

const FormikTextField = ({ name, ...props }: FormikTextFieldProps) => {
  const [field, meta] = useField(name);

  const newProps: TexFieldConfig = {
    ...field,
    ...props,
  };

  if (meta.error) {
    newProps.error = true;
    newProps.helperText = meta.error;
  }

  return <MuiTextField {...newProps} />;
};

export default FormikTextField;