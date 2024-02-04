import React, { JSXElementConstructor, ReactElement, ReactNode } from "react";
import { RadioGroup } from "@headlessui/react";
import classNames from "classnames";

export type CustomRadioGroupOption<TValue> = {
  label: string;
  value: TValue;
};
export type CustomRadioGroupProps<TValue> = {
  label: ReactNode | ((bag: {}) => ReactElement<any, string | JSXElementConstructor<any>>);
  value: TValue;
  onChange(newVal: TValue): void;
  options: CustomRadioGroupOption<TValue>[];
};
// create a generic component definition that accepts any kind of value
const CustomRadioGroup = <TValue,>(props: CustomRadioGroupProps<TValue>) => {
 return(

      
       
<RadioGroup value={props.value} onChange={props.onChange}>
<RadioGroup.Label className="text-lg my-2">
  {props.label}
</RadioGroup.Label>
{/* render each option. */}
<div className="max-w-md mx-auto flex flex-col gap-2">
  {props.options.map((option) => {
    return (
      <RadioGroup.Option value={option.value} key={option.label}>
        {/* Use renderProps to get the checked state for each option. */}
        {/* Render the state appropriately using tailwind classes */}
        {({ checked }) => (
          <div
            className={classNames({
             

              
              "flex items-center bg-white text-sm font-medium text-slate-800 dark:text-slate-100 p-4 rounded dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm duration-150 ease-in-out":
                true,
                        
              "outline outline-1": checked,
            })}
          >
            <svg className="w-6 h-6 shrink-0 fill-current mr-4" viewBox="0 0 24 24">
                          <path className="text-slate-950" d="m12 10.856 9-5-8.514-4.73a1 1 0 0 0-.972 0L3 5.856l9 5Z" />
                          <path className="text-coolGray-300" d="m11 12.588-9-5V18a1 1 0 0 0 .514.874L11 23.588v-11Z" />
                          <path className="text-coolGray-200" d="M13 12.588v11l8.486-4.714A1 1 0 0 0 22 18V7.589l-9 4.999Z" />
                        </svg>
            <span className="w-5 h-5">
              {checked ? <span></span> : <span></span>}
            </span>
            <RadioGroup.Label>{option.label}</RadioGroup.Label>
          </div>
        )}
      </RadioGroup.Option>
    );
  })}
</div>
</RadioGroup>
);
}; 

export default CustomRadioGroup;
