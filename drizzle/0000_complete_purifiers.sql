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
  pub_count int;
BEGIN
  -- Add todos to any already-existing explicit-table publications.
  -- Covers Electric Cloud (cloud_electric_pub_*) and a local Electric
  -- that was started before the migration ran.
  FOR pub IN SELECT pubname FROM pg_publication WHERE puballtables = false LOOP
    EXECUTE format('ALTER PUBLICATION %I ADD TABLE todos', pub.pubname);
  END LOOP;

  -- If no explicit-table publication exists yet (fresh local Postgres,
  -- migration runs before Electric starts), pre-create the default
  -- Electric publication so Electric picks it up on first start.
  SELECT count(*) INTO pub_count FROM pg_publication WHERE puballtables = false;
  IF pub_count = 0 THEN
    CREATE PUBLICATION electric_publication FOR TABLE todos;
  END IF;
END;
$$;
