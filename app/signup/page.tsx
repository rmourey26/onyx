// app/signup/page.tsx
import Page1 from '@/components/signup/Page1'
import Page2 from '@/components/signup/Page2'
import Page3 from '@/components/signup/Page3'
import Page4 from '@/components/signup/Page4'

import SignUpForm from '@/components/signup/signupform';
import React from "react";

const SignupPage = () => {
  return (
    <div className="grid h-screen bg-white dark:bg-slate-900">
      <SignUpForm steps={[Page1, Page2, Page3, Page4]} />
    </div>
  );
};

export default SignupPage;