import React from "react";
import { AuthFormLegacy } from "./components/AuthFormLegacy";

export default function page() {
	return (
		<div className="flex justify-center items-center h-screen">
			<div className="w-96">
				<AuthFormLegacy />
			</div>
		</div>
	);
}
