CREATE TYPE "public"."body_type" AS ENUM('compact', 'panel', 'panel-long', 'luton');--> statement-breakpoint
CREATE TYPE "public"."fuel" AS ENUM('diesel', 'petrol', 'electric', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."gearbox" AS ENUM('manual', 'automatic');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."license_category" AS ENUM('B', 'C1');--> statement-breakpoint
CREATE TYPE "public"."palette" AS ENUM('orange', 'teal', 'cobalt', 'sand', 'brown');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'unavailable');--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"message" text,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"h1" text NOT NULL,
	"summary" text NOT NULL,
	"intro" text[] DEFAULT '{}' NOT NULL,
	"use_cases" text[] DEFAULT '{}' NOT NULL,
	"seo_title" text NOT NULL,
	"seo_description" text NOT NULL,
	"body_type" "body_type" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vehicle_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_price_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"min_days" integer NOT NULL,
	"price_per_day_net" integer NOT NULL,
	CONSTRAINT "vehicle_price_tiers_vehicle_min_days_uq" UNIQUE("vehicle_id","min_days")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category_id" uuid NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"variant" text DEFAULT '' NOT NULL,
	"year" integer NOT NULL,
	"summary" text NOT NULL,
	"description" text[] DEFAULT '{}' NOT NULL,
	"ideal_for" text[] DEFAULT '{}' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"payload_kg" integer NOT NULL,
	"gross_weight_kg" integer NOT NULL,
	"cargo_volume_m3" numeric(4, 1) NOT NULL,
	"cargo_length_mm" integer NOT NULL,
	"cargo_width_mm" integer NOT NULL,
	"cargo_height_mm" integer NOT NULL,
	"seats" integer NOT NULL,
	"fuel" "fuel" NOT NULL,
	"gearbox" "gearbox" NOT NULL,
	"license_category" "license_category" DEFAULT 'B' NOT NULL,
	"body_type" "body_type" NOT NULL,
	"palette" "palette" DEFAULT 'orange' NOT NULL,
	"km_limit_per_day" integer NOT NULL,
	"extra_km_price_grosze" integer NOT NULL,
	"deposit_grosze" integer NOT NULL,
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_price_tiers" ADD CONSTRAINT "vehicle_price_tiers_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_category_id_vehicle_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."vehicle_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiries_status_created_idx" ON "inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "vehicle_images_vehicle_idx" ON "vehicle_images" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "vehicles_category_idx" ON "vehicles" USING btree ("category_id");