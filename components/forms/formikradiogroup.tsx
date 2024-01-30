// components/FormikRadioGroup.tsx
import { useField, useFormikContext } from "formik";
import React from "react";
import CustomRadioGroup, { CustomRadioGroupOption } from './CustomRadioGroup'
type FormikRadioGroupProps<TValue> = {
  name: string;
  options: CustomRadioGroupOption<TValue>[];
  label: string;
};
const FormikRadioGroup = <TValue,>(props: FormikRadioGroupProps<TValue>) => {
  const [field] = useField<TValue>(props.name);
  const { setFieldValue } = useFormikContext();
  return (
    <CustomRadioGroup
      options={props.options}
      // use field.value for value
      value={field.value}
      label={props.label}
      onChange={(val) => {
        // use setFieldValue to modify the formikContext
        setFieldValue(props.name, val);
      }}
    />
  );
};
export default FormikRadioGroup;
