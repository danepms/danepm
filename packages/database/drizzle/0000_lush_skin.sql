CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"manager_id" text NOT NULL,
	"flow_id" text,
	"property_id" text,
	"period" text NOT NULL,
	"sent_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"cost_estimate" text DEFAULT '0',
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_batch" (
	"id" text PRIMARY KEY NOT NULL,
	"manager_id" text NOT NULL,
	"name" text NOT NULL,
	"channel" text NOT NULL,
	"total_recipients" text DEFAULT '0',
	"success_count" text DEFAULT '0',
	"failed_count" text DEFAULT '0',
	"status" text DEFAULT 'pending',
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_flow" (
	"id" text PRIMARY KEY NOT NULL,
	"manager_id" text NOT NULL,
	"name" text NOT NULL,
	"trigger" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_flow_step" (
	"id" text PRIMARY KEY NOT NULL,
	"flow_id" text NOT NULL,
	"template_id" text NOT NULL,
	"channel" text DEFAULT 'both',
	"offset_days" integer DEFAULT 0,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_log" (
	"id" text PRIMARY KEY NOT NULL,
	"manager_id" text NOT NULL,
	"tenant_id" text,
	"property_id" text,
	"batch_id" text,
	"channel" text NOT NULL,
	"type" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"status" text DEFAULT 'pending',
	"external_id" text,
	"sent_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_template" (
	"id" text PRIMARY KEY NOT NULL,
	"manager_id" text NOT NULL,
	"name" text NOT NULL,
	"subject" text,
	"content_html" text,
	"content_text" text NOT NULL,
	"channel" text DEFAULT 'both',
	"category" text DEFAULT 'general',
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cron_heartbeat" (
	"id" text PRIMARY KEY NOT NULL,
	"job_name" text NOT NULL,
	"status" text NOT NULL,
	"executed_at" timestamp,
	"scheduled_for" timestamp,
	"duration_ms" integer,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"manager_id" text NOT NULL,
	"request_id" text,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"amount" text NOT NULL,
	"vendor_name" text,
	"vendor_phone" text,
	"receipt" text,
	"paid_date" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite" (
	"id" text PRIMARY KEY NOT NULL,
	"inviter_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"status" text DEFAULT 'pending',
	"target_id" text,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"property_id" text,
	"manager_id" text NOT NULL,
	"period" text NOT NULL,
	"description" text,
	"amount" text NOT NULL,
	"paid" text DEFAULT '0',
	"balance" text NOT NULL,
	"status" text DEFAULT 'unpaid',
	"due_date" timestamp,
	"issued_at" timestamp NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_request" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"unit_id" text,
	"tenant_id" text,
	"manager_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general',
	"priority" text DEFAULT 'normal',
	"status" text DEFAULT 'open',
	"photos" text,
	"resolved_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"aaguid" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"invoice_id" text,
	"manager_id" text NOT NULL,
	"amount" text NOT NULL,
	"method" text DEFAULT 'cash',
	"reference" text,
	"notes" text,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"image_url" text,
	"user_id" text NOT NULL,
	"has_residential" boolean DEFAULT false,
	"has_commercial" boolean DEFAULT false,
	"residential_units" text,
	"commercial_units" text,
	"is_live" boolean DEFAULT false,
	"setup_step" text DEFAULT '1',
	"config" text,
	"owner_id" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "system_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"manager_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"actor_id" text,
	"actor_name" text,
	"user_agent" text,
	"payload" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"mpesa_number" text,
	"id_number" text,
	"id_type" text DEFAULT 'National ID',
	"next_of_kin" text,
	"property_id" text,
	"unit_id" text,
	"arrears" text DEFAULT '0',
	"move_in_charges" text DEFAULT '0',
	"move_in_photos" text,
	"move_in_date" timestamp,
	"move_out_date" timestamp,
	"move_out_photos" text,
	"final_statement" text,
	"status" text DEFAULT 'active',
	"notes" text,
	"manager_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"verified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"phone" text,
	"two_factor_enabled" boolean DEFAULT false,
	"security_config" jsonb,
	"api_key" text,
	"notification_prefs" jsonb,
	"suspended" boolean DEFAULT false,
	"suspended_at" timestamp,
	"suspended_by" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "vendor" (
	"id" text PRIMARY KEY NOT NULL,
	"manager_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"specialty" text,
	"rating" text DEFAULT '0',
	"notes" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_analytics" ADD CONSTRAINT "communication_analytics_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_analytics" ADD CONSTRAINT "communication_analytics_flow_id_communication_flow_id_fk" FOREIGN KEY ("flow_id") REFERENCES "public"."communication_flow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_analytics" ADD CONSTRAINT "communication_analytics_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_batch" ADD CONSTRAINT "communication_batch_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_flow" ADD CONSTRAINT "communication_flow_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_flow_step" ADD CONSTRAINT "communication_flow_step_flow_id_communication_flow_id_fk" FOREIGN KEY ("flow_id") REFERENCES "public"."communication_flow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_flow_step" ADD CONSTRAINT "communication_flow_step_template_id_communication_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."communication_template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_template" ADD CONSTRAINT "communication_template_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_request_id_maintenance_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."maintenance_request"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor" ADD CONSTRAINT "vendor_manager_id_user_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;