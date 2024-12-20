CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"systemId" varchar NOT NULL,
	"nodeId" varchar NOT NULL,
	"content" "bytea" NOT NULL,
	"definition" json NOT NULL,
	"hash" varchar(8) NOT NULL,
	"previous" varchar(8),
	CONSTRAINT "nodes_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_userId_users_name_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "node_previous_fk" FOREIGN KEY ("previous") REFERENCES "public"."nodes"("hash") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "nodes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "system_id_idx" ON "nodes" USING btree ("systemId");--> statement-breakpoint
CREATE INDEX "node_id_idx" ON "nodes" USING btree ("nodeId");--> statement-breakpoint
CREATE INDEX "hash_idx" ON "nodes" USING btree ("hash");