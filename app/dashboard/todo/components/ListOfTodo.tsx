import React from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import EditTodo from "./EditTodo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ListOfTodo() {
	const todos = [
		{
			title: "Subscribe to my channel",
			status: "completed",
			created_at: new Date().toDateString(),
			create_by: "Garfield",
		},
		{
			title: "Subscribe to my channel",
			status: "completed",
			created_at: new Date().toDateString(),
			create_by: "Trender",
		},
		{
			title: "Subscribe to my channel",
			status: "completed",
			created_at: new Date().toDateString(),
			create_by: "Some string",
		},
	];
	return (
		<div className="dark:bg-inherit bg-white mx-2 rounded-sm">
			{todos.map((todo, index) => {
				return (
					<div
						className=" grid grid-cols-5  rounded-sm  p-3 align-middle font-normal "
						key={index}
					>
						{Object.keys(todo).map((key, index) => {
							if (key === "status") {
								return (
									<div
										key={index}
										className="flex items-center"
									>
										<div>
											<span
												className={cn(
													"  dark:bg-zinc-800 px-2 py-1 rounded-full shadow capitalize  border-[.5px] text-sm",
													{
														"border-green-500 bg-green-400 dark:text-green-400":
															todo.status ===
															"completed",
													}
												)}
											>
												{todo.status}
											</span>
										</div>
									</div>
								);
							} else {
								return (
									<h1
										className="flex items-center dark:text-white text-lg"
										key={index}
									>
										{todo[key as keyof typeof todo]}
									</h1>
								);
							}
						})}

						<div className="flex gap-2 items-center">
							<Button
								variant="outline"
								className="bg-dark dark:bg-inherit"
							>
								<TrashIcon />
								delete
							</Button>
							<EditTodo />
						</div>
					</div>
				);
			})}
		</div>
	);
}