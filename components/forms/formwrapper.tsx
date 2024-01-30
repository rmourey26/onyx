import clsx from 'clsx';
import React from 'react';

export default function FormWrapper({
  children,
  heading,
  description,
}: FormWrapperProps) {
  return (
    <section
      className={clsx(
        'flex flex-col w-full h-full',
        'px-6 lg:px-[100px] pt-7 lg:pt-12 pb-8 lg:pb-4',
        'bg-white lg:bg-transparent rounded-lg lg:rounded-none shadow-lg lg:shadow-none'
      )}
    >
      <h1 className="text-2xl lg:text-[34px] font-bold text-marine-blue">
        {heading}
      </h1>
      <p className="text-cool-gray mt-1">{description}</p>
      {children}
    </section>
  );
}

interface FormWrapperProps {
  children: React.ReactNode;
  heading: string;
  description: string;
}