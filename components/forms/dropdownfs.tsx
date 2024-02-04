import { Listbox } from "@headlessui/react";
import React from "react"
import cn from "classnames";

export type DropdownFsOption<T> = {
    label: string;
    value: T;
  };
  //👇 generic props
  export type DropdownFsProps<T> = {
    options: DropdownFsOption<T>[];
    value: T;
    onChange(value: T): void;
  };
  //👇 generic dropdown component
  const DropdownFs = <T,>(props: DropdownFsProps<T>) => {
    
    const options = props.options;
    const selectedItem = options.find((o) => o.value === props.value);
    const label = selectedItem?.label ?? "Select Option...";
    return (
      <div className="z-50 top-16 align-self-center mb-2 form-input w-full mx-auto border-none">
      <Listbox value={props.value} onChange={props.onChange} as={React.Fragment}>
      <div className="relative">
        <div className={"dropdown dropdown-end mx-auto border-none drop-shadow-none"}></div>
        <div className="relative cursor-default overflow-hidden rounded-lg bg-transparent text-left shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-300 sm:text-sm">

        <Listbox.Button className="btn w-full flex items-center justify-between min-w-[11rem] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200" aria-label="Select option">{label}
        <span className="flex items-center">

        </span>
        <svg className="shrink-0 ml-1 fill-current text-slate-400" width="11" height="7" viewBox="0 0 11 7">
              <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
            </svg>
            </Listbox.Button>
        <Listbox.Options
        className={cn({
          "dropdown-content menu": true,
          "font-medium text-sm text-slate-600 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-700 focus:outline-none": true,
          "p-2 shadow-none bg-base-100 rounded-box w-72": false,
          "form-multiselect":true,
          "shadow-none": true,
        })}
        >
          {options.map((option, i) => (
            <Listbox.Option key={i} value={option.value}>
              {({ active, disabled, selected }) => (
                <button
                className={cn({
                  active: selected,
                  "btn-disabled": disabled,
                  "flex items-center justify-between w-full py-2 px-3 cursor-pointer" : active ? "bg-slate-50 dark:bg-slate-700/20" : option.value === selected && 'text-slate-950'
                })}
              >
              <span>{option.label}</span>
              <svg className={`shrink-0 mr-2 fill-current text-slate-950 ${option.value !== selected && 'invisible'}`} width="12" height="9" viewBox="0 0 12 9">
                        <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
                      </svg>
              </button>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
        </div>
        </div>
      </Listbox>
      </div>
    );
  };

  export default DropdownFs;