import Link from 'next/link'

export default function OnboardingProgress({ step = 1 }: { step?: number }) {
  return (
    <div className="px-4 pt-12 pb-8">
      <div className="max-w-md mx-auto w-full">
        <div className="relative">
          <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>
          <ul className="relative flex justify-between w-full">
            <li>
              <Link className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 1 ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`} href="/signup?=page1">1</Link>
            </li>
            <li>
              <Link className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 2 ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`} href="/signup?=page2">2</Link>
            </li>
            <li>
              <Link className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 3 ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`} href="/signup?=page3">3</Link>
            </li>
            <li>
              <Link className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 4 ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`} href="/signup?=page4">4</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
