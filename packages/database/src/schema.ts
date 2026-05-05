import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
    role: text("role"), // Custom field for Dane
    phone: text("phone"),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    securityConfig: jsonb("security_config"), // stores { login_alerts: true, session_timeout: 3600, ... }
    apiKey: text("api_key").unique(), // for external integrations
    notificationPrefs: jsonb("notification_prefs"), // stores { invoice: { email: true, sms: false }, ... }
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const property = pgTable("property", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  hasResidential: boolean("has_residential").default(false),
  hasCommercial: boolean("has_commercial").default(false),
  residentialUnits: text("residential_units"), // JSON stringified
  commercialUnits: text("commercial_units"), // JSON stringified
  isLive: boolean("is_live").default(false),
  setupStep: text("setup_step").default("1"),
  config: text("config"), // JSON stringified configuration
  ownerId: text("owner_id")
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull(),
});

export const tenant = pgTable("tenant", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  mpesaNumber: text("mpesa_number"),
  idNumber: text("id_number"),
  idType: text("id_type").default("National ID"),
  nextOfKin: text("next_of_kin"), // JSON stringified array of {name, phone, relationship}
  propertyId: text("property_id")
    .references(() => property.id),
  unitId: text("unit_id"),
  arrears: text("arrears").default("0"),
  moveInCharges: text("move_in_charges").default("0"),
  moveInPhotos: text("move_in_photos"), // JSON array of URLs
  moveInDate: timestamp("move_in_date"),
  notes: text("notes"),
  managerId: text("manager_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const invoice = pgTable("invoice", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenant.id),
  propertyId: text("property_id").references(() => property.id),
  managerId: text("manager_id").notNull().references(() => user.id),
  period: text("period").notNull(),
  description: text("description"),
  amount: text("amount").notNull(),
  paid: text("paid").default("0"),
  balance: text("balance").notNull(),
  status: text("status").default("unpaid"),
  dueDate: timestamp("due_date"),
  issuedAt: timestamp("issued_at").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull(),
});

export const payment = pgTable("payment", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenant.id),
  invoiceId: text("invoice_id").references(() => invoice.id),
  managerId: text("manager_id").notNull().references(() => user.id),
  amount: text("amount").notNull(),
  method: text("method").default("cash"),
  reference: text("reference"),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const maintenanceRequest = pgTable("maintenance_request", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull().references(() => property.id),
  unitId: text("unit_id"),
  tenantId: text("tenant_id").references(() => tenant.id),
  managerId: text("manager_id").notNull().references(() => user.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").default("general"),
  priority: text("priority").default("normal"),
  status: text("status").default("open"),
  photos: text("photos"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const expense = pgTable("expense", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull().references(() => property.id),
  managerId: text("manager_id").notNull().references(() => user.id),
  requestId: text("request_id").references(() => maintenanceRequest.id),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: text("amount").notNull(),
  vendorName: text("vendor_name"),
  vendorPhone: text("vendor_phone"),
  receipt: text("receipt"),
  paidDate: timestamp("paid_date"),
  createdAt: timestamp("created_at").notNull(),
});

export const vendor = pgTable("vendor", {
  id: text("id").primaryKey(),
  managerId: text("manager_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  specialty: text("specialty"),
  rating: text("rating").default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull(),
});

export const communicationLog = pgTable("communication_log", {
  id: text("id").primaryKey(),
  managerId: text("manager_id").notNull().references(() => user.id),
  tenantId: text("tenant_id").references(() => tenant.id),
  propertyId: text("property_id").references(() => property.id),
  batchId: text("batch_id"), // Linked to a campaign/batch
  channel: text("channel").notNull(), 
  type: text("type").notNull(), 
  subject: text("subject"),
  content: text("content").notNull(),
  status: text("status").default("pending"), 
  externalId: text("external_id"), 
  sentAt: timestamp("sent_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const communicationTemplate = pgTable("communication_template", {
  id: text("id").primaryKey(),
  managerId: text("manager_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  subject: text("subject"),
  contentHtml: text("content_html"),
  contentText: text("content_text").notNull(),
  channel: text("channel").default("both"), // sms, email, both
  category: text("category").default("general"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const communicationBatch = pgTable("communication_batch", {
  id: text("id").primaryKey(),
  managerId: text("manager_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  channel: text("channel").notNull(),
  totalRecipients: text("total_recipients").default("0"),
  successCount: text("success_count").default("0"),
  failedCount: text("failed_count").default("0"),
  status: text("status").default("pending"), 
  createdAt: timestamp("created_at").notNull(),
});

export const communicationFlow = pgTable("communication_flow", {
  id: text("id").primaryKey(),
  managerId: text("manager_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  trigger: text("trigger").notNull(), // invoice_generated, payment_received, tenant_added, manual_nudge
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const communicationFlowStep = pgTable("communication_flow_step", {
  id: text("id").primaryKey(),
  flowId: text("flow_id").notNull().references(() => communicationFlow.id),
  templateId: text("template_id").notNull().references(() => communicationTemplate.id),
  channel: text("channel").default("both"),
  offsetDays: integer("offset_days").default(0), // 0 = immediate, -5 = 5 days before, 3 = 3 days after
  createdAt: timestamp("created_at").notNull(),
});

export const communicationAnalytics = pgTable("communication_analytics", {
  id: text("id").primaryKey(),
  managerId: text("manager_id").notNull().references(() => user.id),
  flowId: text("flow_id").references(() => communicationFlow.id),
  propertyId: text("property_id").references(() => property.id),
  period: text("period").notNull(), // YYYY-MM
  sentCount: integer("sent_count").default(0),
  successCount: integer("success_count").default(0),
  failedCount: integer("failed_count").default(0),
  costEstimate: text("cost_estimate").default("0"),
  updatedAt: timestamp("updated_at").notNull(),
});

// --- GOVERNANCE & SYSTEM AUDIT ---
export const systemAuditLog = pgTable("system_audit_log", {
  id: text("id").primaryKey(),
  managerId: text("manager_id").notNull(),
  action: text("action").notNull(), // e.g., 'RENT_ADJUSTED', 'TENANT_DELETED'
  entityType: text("entity_type").notNull(), // e.g., 'unit', 'tenant', 'invoice'
  entityId: text("entity_id"),
  actorId: text("actor_id"),
  actorName: text("actor_name"),
  payload: jsonb("payload"), // Stores { before: ..., after: ... }
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cronHeartbeat = pgTable("cron_heartbeat", {
  id: text("id").primaryKey(),
  jobName: text("job_name").notNull(), // e.g., 'INVOICE_GENERATION_DAEMON'
  status: text("status").notNull(), // 'success', 'failed', 'scheduled'
  executedAt: timestamp("executed_at"),
  scheduledFor: timestamp("scheduled_for"),
  durationMs: integer("duration_ms"),
  details: jsonb("details"), // Stores errors or success summaries
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const twoFactor = pgTable("two_factor", {
	id: text("id").primaryKey(),
	secret: text("secret").notNull(),
	backupCodes: text("backup_codes").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	verified: boolean("verified").default(false),
});

export const passkey = pgTable("passkey", {
	id: text("id").primaryKey(),
	name: text("name"),
	publicKey: text("public_key").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	credentialID: text("credential_id").notNull(),
	counter: integer("counter").notNull(),
	deviceType: text("device_type").notNull(),
	backedUp: boolean("backed_up").notNull(),
	transports: text("transports"),
	aaguid: text("aaguid"),
	createdAt: timestamp("created_at"),
});

export const invite = pgTable("invite", {
  id: text("id").primaryKey(),
  inviterId: text("inviter_id").notNull().references(() => user.id),
  email: text("email").notNull(),
  role: text("role").notNull(), // 'owner' or 'manager'
  status: text("status").default("pending"), // 'pending', 'accepted', 'expired'
  targetId: text("target_id"), // e.g., propertyId for owner assignment
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

