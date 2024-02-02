import { Input } from "@/components/ui/input";
import React from "react";

export default function SearchTodo() {
	return (
		<Input
			placeholder="search by title,author"
			className=" border-zinc-600  focus:border-zinc-600"
		/>
	);
}