import React from "react";
import { AuthForm } from "./components/AuthForm";

export default function page() {
	return (
		<div className="flex justify-center items-center h-screen">
			<div className="w-96">
				<AuthForm />
			</div>
		</div>
	);
}
