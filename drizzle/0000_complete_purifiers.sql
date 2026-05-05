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
  pub record;
BEGIN
  -- Case 1: a FOR ALL TABLES publication already exists (e.g. Electric
  -- started first and created electric_publication FOR ALL TABLES).
  -- Every table is already covered — nothing to do.
  IF EXISTS (SELECT 1 FROM pg_publication WHERE puballtables = true) THEN
    RETURN;
  END IF;

  -- Case 2: explicit-table publications exist — add todos to each.
  -- Covers Electric Cloud (cloud_electric_pub_*) and a local Electric
  -- that was started before the migration ran.
  FOR pub IN SELECT pubname FROM pg_publication WHERE puballtables = false LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = pub.pubname AND tablename = 'todos'
    ) THEN
      EXECUTE format('ALTER PUBLICATION %I ADD TABLE todos', pub.pubname);
    END IF;
  END LOOP;

  -- Case 3: no publication exists yet (fresh Postgres, Electric hasn't
  -- started). Pre-create electric_publication so Electric reuses it.
  -- Wrapped in a sub-block so a duplicate_object error (another process
  -- created it concurrently) never rolls back the outer transaction.
  IF NOT EXISTS (SELECT 1 FROM pg_publication) THEN
    BEGIN
      CREATE PUBLICATION electric_publication FOR TABLE todos;
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- concurrent create, safe to ignore
    END;
  END IF;
END;
$$;
