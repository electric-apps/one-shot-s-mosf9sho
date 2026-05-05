import { describe, it, expect } from "vitest"
import { todoSelectSchema, todoInsertSchema } from "@/db/zod-schemas"
import { generateValidRow, generateRowWithout } from "./helpers/schema-test-utils"

describe("todos schema", () => {
	it("has required fields", () => {
		const row = generateValidRow(todoSelectSchema as Parameters<typeof generateValidRow>[0])
		expect(row).toHaveProperty("id")
		expect(row).toHaveProperty("title")
		expect(row).toHaveProperty("completed")
		expect(row).toHaveProperty("created_at")
		expect(row).toHaveProperty("updated_at")
	})

	it("accepts a valid row", () => {
		const row = {
			id: crypto.randomUUID(),
			title: "Buy groceries",
			completed: false,
			created_at: new Date(),
			updated_at: new Date(),
		}
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects a row missing title", () => {
		const row = {
			id: crypto.randomUUID(),
			completed: false,
			created_at: new Date(),
			updated_at: new Date(),
		}
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("rejects a row missing id", () => {
		const row = {
			title: "Test todo",
			completed: false,
			created_at: new Date(),
			updated_at: new Date(),
		}
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("insert schema makes timestamps optional", () => {
		const row = {
			id: crypto.randomUUID(),
			title: "New todo",
		}
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("insert schema requires title", () => {
		const row = {
			id: crypto.randomUUID(),
		}
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})
})
