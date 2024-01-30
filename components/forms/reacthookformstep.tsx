'use client';

import useAppFormContext from '@/lib/hooks/useAppFormContext';
import clsx from 'clsx';
// Components
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Step({ step, segment }: StepProps) {
  // const router = useRouter();

  // const { formState } = useAppFormContext();
  // const { isValid } = formState;

  // const validateStep = async (href: string) => {
  //   if (isValid) {
  //     router.push(href);
  //   }
  // };

  return (
    <Link href={`/${step.segment}`}>
      {/* <button type="button" onClick={() => validateStep(`/${step}`)}> */}
      <div className="flex items-center gap-4">
        <button
          className={clsx(
            'w-[33px] h-[33px] rounded-full border',
            'transition-colors duration-300',
            step.segment === segment
              ? 'bg-light-blue text-marine-blue border-transparent'
              : 'bg-transparent text-white border-white',
            'font-bold text-sm'
          )}
        >
          {step.number}
        </button>
        <div className="hidden lg:flex flex-col uppercase">
          <h3 className={clsx('font-normal text-[13px] text-cool-gray')}>
            Step {step.number}
          </h3>
          <h2
            className={clsx(
              'font-bold text-white text-[14px] tracking-[0.1em]'
            )}
          >
            {step.heading}
          </h2>
        </div>
      </div>
      {/* </button> */}
    </Link>
  );
}

interface StepProps {
  step: {
    number: number;
    segment: 'info' | 'plan' | 'addons' | 'summary';
    heading: string;
  };
  segment: 'info' | 'plan' | 'addons' | 'summary';
}