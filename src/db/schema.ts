import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core"

export const todos = pgTable("todos", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	completed: boolean("completed").notNull().default(false),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})
