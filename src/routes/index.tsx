import { createFileRoute } from "@tanstack/react-router"
import { useLiveQuery } from "@tanstack/react-db"
import * as React from "react"
import { todosCollection } from "@/db/collections/todos"
import { useToast } from "@/components/Toaster"
import type { Todo } from "@/db/zod-schemas"

export const Route = createFileRoute("/")({
	ssr: false,
	component: App,
})

function App() {
	const { data: todos = [] } = useLiveQuery((q) =>
		q.from({ todo: todosCollection }).orderBy(({ todo }) => todo.created_at, "asc"),
	)
	const [title, setTitle] = React.useState("")
	const { toast } = useToast()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const trimmed = title.trim()
		if (!trimmed) return
		try {
			todosCollection.insert({
				id: crypto.randomUUID(),
				title: trimmed,
				completed: false,
				created_at: new Date(),
				updated_at: new Date(),
			})
			setTitle("")
		} catch {
			toast({ title: "Error", description: "Failed to add todo", variant: "destructive" })
		}
	}

	const handleToggle = (todo: Todo) => {
		try {
			todosCollection.update(todo.id, (draft) => {
				draft.completed = !draft.completed
				draft.updated_at = new Date()
			})
		} catch {
			toast({ title: "Error", description: "Failed to update todo", variant: "destructive" })
		}
	}

	const handleDelete = (id: string) => {
		try {
			todosCollection.delete(id)
		} catch {
			toast({ title: "Error", description: "Failed to delete todo", variant: "destructive" })
		}
	}

	return (
		<div className="flex min-h-svh justify-center bg-gray-50 p-8">
			<div className="w-full max-w-md">
				<h1 className="mb-6 text-2xl font-bold text-gray-900">Todos</h1>

				<form onSubmit={handleSubmit} className="mb-4 flex gap-2">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Add a new todo..."
						className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
					<button
						type="submit"
						disabled={!title.trim()}
						className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Add
					</button>
				</form>

				{todos.length === 0 ? (
					<p className="text-center text-sm text-gray-500">No todos yet. Add one above!</p>
				) : (
					<ul className="space-y-2">
						{todos.map((todo) => (
							<li
								key={todo.id}
								className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm"
							>
								<input
									type="checkbox"
									checked={todo.completed}
									onChange={() => handleToggle(todo)}
									className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-blue-600"
								/>
								<span
									className={`flex-1 text-sm ${todo.completed ? "text-gray-400 line-through" : "text-gray-900"}`}
								>
									{todo.title}
								</span>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation()
										handleDelete(todo.id)
									}}
									className="text-gray-400 hover:text-red-500"
									aria-label="Delete todo"
								>
									×
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	)
}
