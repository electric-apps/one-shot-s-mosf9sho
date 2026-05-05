CREATE TABLE "todos" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "todos" REPLICA IDENTITY FULL;

DO $$
DECLARE
  pub_name text;
BEGIN
  SELECT pubname INTO pub_name FROM pg_publication WHERE pubname LIKE 'cloud_electric%' LIMIT 1;
  IF pub_name IS NOT NULL THEN
    EXECUTE format('ALTER PUBLICATION %I ADD TABLE todos', pub_name);
  END IF;
END;
$$;
