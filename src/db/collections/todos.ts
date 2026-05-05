import { createCollection } from "@tanstack/react-db"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import { todoSelectSchema } from "@/db/zod-schemas"
import { absoluteApiUrl } from "@/lib/client-url"

export const todosCollection = createCollection(
	electricCollectionOptions({
		id: "todos",
		schema: todoSelectSchema,
		getKey: (row) => row.id,
		shapeOptions: {
			url: absoluteApiUrl("/api/todos"),
			parser: {
				timestamptz: (date: string) => new Date(date),
			},
		},
		onInsert: async ({ transaction }) => {
			const { modified: newTodo } = transaction.mutations[0]
			const res = await fetch("/api/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newTodo),
			})
			if (!res.ok) throw new Error(await res.text())
			const { txid } = await res.json()
			return { txid }
		},
		onUpdate: async ({ transaction }) => {
			const { modified: updated } = transaction.mutations[0]
			const res = await fetch("/api/todos", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: updated.id, completed: updated.completed }),
			})
			if (!res.ok) throw new Error(await res.text())
			const { txid } = await res.json()
			return { txid }
		},
		onDelete: async ({ transaction }) => {
			const { original: deleted } = transaction.mutations[0]
			const res = await fetch("/api/todos", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: deleted.id }),
			})
			if (!res.ok) throw new Error(await res.text())
			const { txid } = await res.json()
			return { txid }
		},
	}),
)
