"use client";
import {
  FormControl,
  Select,
  SelectProps,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { useField } from "formik";
import React from "react";

type Props = { name: string; id: string; helperText?: string } & SelectProps;

const FormikSelect: React.FC<Props> = ({
  name,
  children,
  helperText,
  size,
  ...props
}) => {
  const [field, meta] = useField(name);

  const error = Boolean(meta.touched && meta.error);
  const showHelperText = error || !!helperText;
  const id = props.id;

  return (
    <FormControl fullWidth error={error} size={size}>
      <InputLabel id={id + "-label"}>{props.label}</InputLabel>
      <Select {...props} {...field} id={id} labelId={id + "-label"}>
        {children}
      </Select>
      {showHelperText && (
        <FormHelperText>{meta.error ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default FormikSelect;
