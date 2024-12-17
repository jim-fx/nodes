CREATE TABLE "nodes" (
	"id" serial NOT NULL,
	"content" "bytea" NOT NULL,
	"definition" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text
);
