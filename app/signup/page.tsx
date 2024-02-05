// app/signup/page.tsx
import Page1 from '@/components/signup/Page1'
import Page2 from '@/components/signup/Page2'
import Page3 from '@/components/signup/Page3'
import Page4 from '@/components/signup/Page4'

import SignUpForm from '@/components/signup/signupform';
import React from "react";

const SignupPage = () => {
  return (
    <div className="flex grid h-screen">
        
           <div className="px-4 py-8">
            <div className="grid-col mx-auto">
<SignUpForm steps={[Page1, Page2, Page3, Page4]} />
    </div>
    </div>
    </div>
  );
};

export default SignupPage;
