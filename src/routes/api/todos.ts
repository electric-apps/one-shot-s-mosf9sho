import { createFileRoute } from "@tanstack/react-router"
import { db } from "@/db"
import { todos } from "@/db/schema"
import { todoInsertSchema } from "@/db/zod-schemas"
import { generateTxId, parseDates } from "@/db/utils"
import { proxyElectricRequest } from "@/lib/electric-proxy"
import { eq } from "drizzle-orm"

export const Route = createFileRoute("/api/todos")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				return proxyElectricRequest(request, "todos")
			},

			POST: async ({ request }) => {
				const body = parseDates(await request.json())
				const parsed = todoInsertSchema.safeParse(body)
				if (!parsed.success) {
					return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					})
				}

				let txid: number
				await db.transaction(async (tx) => {
					await tx.insert(todos).values(parsed.data)
					txid = await generateTxId(tx)
				})

				return new Response(JSON.stringify({ txid: txid! }), {
					status: 201,
					headers: { "Content-Type": "application/json" },
				})
			},

			PUT: async ({ request }) => {
				const body = await request.json()
				const { id, completed } = body as { id: string; completed: boolean }
				if (!id) {
					return new Response(JSON.stringify({ error: "id required" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					})
				}

				let txid: number
				await db.transaction(async (tx) => {
					await tx
						.update(todos)
						.set({ completed, updated_at: new Date() })
						.where(eq(todos.id, id))
					txid = await generateTxId(tx)
				})

				return new Response(JSON.stringify({ txid: txid! }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				})
			},

			DELETE: async ({ request }) => {
				const body = await request.json()
				const { id } = body as { id: string }
				if (!id) {
					return new Response(JSON.stringify({ error: "id required" }), {
						status: 400,
						headers: { "Content-Type": "application/json" },
					})
				}

				let txid: number
				await db.transaction(async (tx) => {
					await tx.delete(todos).where(eq(todos.id, id))
					txid = await generateTxId(tx)
				})

				return new Response(JSON.stringify({ txid: txid! }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				})
			},
		},
	},
})
