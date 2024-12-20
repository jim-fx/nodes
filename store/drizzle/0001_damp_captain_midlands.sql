ALTER TABLE "nodes" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "userId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "systemId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "nodeId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "hash" varchar(8) NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "previous" integer;--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "nodes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "system_id_idx" ON "nodes" USING btree ("systemId");--> statement-breakpoint
CREATE INDEX "node_id_idx" ON "nodes" USING btree ("nodeId");--> statement-breakpoint
CREATE INDEX "hash_idx" ON "nodes" USING btree ("hash");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_name_unique" UNIQUE("name");