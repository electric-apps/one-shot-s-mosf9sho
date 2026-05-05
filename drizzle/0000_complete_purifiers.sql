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
  FOR pub IN SELECT pubname FROM pg_publication WHERE puballtables = false LOOP
    EXECUTE format('ALTER PUBLICATION %I ADD TABLE todos', pub.pubname);
  END LOOP;
END;
$$;
