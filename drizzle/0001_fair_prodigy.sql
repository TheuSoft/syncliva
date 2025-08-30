CREATE TYPE "public"."user_role" AS ENUM('admin', 'receptionist', 'doctor');--> statement-breakpoint
CREATE TABLE "receptionists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"name" text NOT NULL,
	"avatar_image_url" text,
	"email" text,
	"invite_token" text,
	"invite_token_expires_at" timestamp,
	"invited_at" timestamp,
	"registered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "receptionist_id" uuid;--> statement-breakpoint
ALTER TABLE "receptionists" ADD CONSTRAINT "receptionists_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_receptionist_id_receptionists_id_fk" FOREIGN KEY ("receptionist_id") REFERENCES "public"."receptionists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "patients_cpf_clinic_idx" ON "patients" USING btree ("cpf","clinic_id");