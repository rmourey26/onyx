// components/FormikCustomDropdown.tsx
import { useField, useFormikContext } from "formik";
import React from "react";
import DropdownFs, {DropdownFsOption } from "./dropdownfs";
type Props<T> = {
  name: string;
  options:DropdownFsOption<T>[];
};
const FormikCustomDropdown = <T,>(props: Props<T>) => {
  const name = props.name;
  const [field] = useField<T>(name);
  const { setFieldValue } = useFormikContext();
  // 👇 listen to any change in value and use setFieldValue
  // to modify the formik context state
  const handleChange = (val: T) => {
    setFieldValue(name, val);
  };
  return (
    <DropdownFs
      options={props.options}
      onChange={handleChange}
      value={field.value}
    />
  );
};
export default FormikCustomDropdown;