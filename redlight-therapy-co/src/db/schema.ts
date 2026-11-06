import {
  pgTable, serial, text, integer, boolean, timestamp, jsonb, uniqueIndex, index, pgEnum, numeric,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "customer"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);
export const enquiryStatusEnum = pgEnum("enquiry_status", ["new", "in_progress", "quoted", "won", "closed", "spam"]);
export const productStatusEnum = pgEnum("product_status", ["draft", "published"]);
export const docVisibilityEnum = pgEnum("doc_visibility", ["public", "customers"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  role: roleEnum("role").notNull().default("customer"),
  name: text("name").notNull().default(""),
  active: boolean("active").notNull().default(true),
  canViewPrices: boolean("can_view_prices").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);

export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const passwordTokens = pgTable("password_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export const businessProfiles = pgTable("business_profiles", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull().default(""),
  country: text("country").notNull().default(""),
  website: text("website").notNull().default(""),
  businessType: text("business_type").notNull().default(""),
  address: text("address").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  website: text("website").notNull().default(""),
  businessType: text("business_type").notNull(),
  productsOfInterest: jsonb("products_of_interest").$type<string[]>().notNull().default([]),
  estimatedQuantities: text("estimated_quantities").notNull().default(""),
  additionalInfo: text("additional_info").notNull().default(""),
  status: applicationStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note").notNull().default(""),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
}, (t) => [index("applications_status_idx").on(t.status)]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  sort: integer("sort").notNull().default(0),
}, (t) => [uniqueIndex("categories_slug_idx").on(t.slug)]);

export type SpecRow = { group: string; label: string; value: string };
export type ModelRow = { model: string; note: string };

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  status: productStatusEnum("status").notNull().default("published"),
  featured: boolean("featured").notNull().default(false),
  sort: integer("sort").notNull().default(0),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  imageAlt: text("image_alt").notNull().default(""),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  models: jsonb("models").$type<ModelRow[]>().notNull().default([]),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  specs: jsonb("specs").$type<SpecRow[]>().notNull().default([]),
  dimensions: text("dimensions").notNull().default(""),
  whatsIncluded: text("whats_included").notNull().default(""),
  usage: text("usage").notNull().default(""),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("products_slug_idx").on(t.slug)]);

export const productDocuments = pgTable("product_documents", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  fileName: text("file_name").notNull(),
  visibility: docVisibilityEnum("visibility").notNull().default("public"),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Rows from the trade price list. product_id is null until a row is linked to a catalogue product. */
export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  sourceName: text("source_name").notNull(),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  currency: text("currency").notNull().default("GBP"),
  tradePrice: numeric("trade_price", { precision: 10, scale: 2 }),
  rrp: numeric("rrp", { precision: 10, scale: 2 }),
  resellerMargin: text("reseller_margin").notNull().default(""),
  moq: integer("moq"),
  notes: text("notes").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const volumeTiers = pgTable("volume_tiers", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  minQty: integer("min_qty").notNull(),
  maxQty: integer("max_qty"),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  description: text("description").notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull(),
  kind: text("kind").notNull().default("order"),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  businessName: text("business_name").notNull().default(""),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  country: text("country").notNull().default(""),
  subject: text("subject").notNull().default(""),
  notes: text("notes").notNull().default(""),
  pricesIncluded: boolean("prices_included").notNull().default(false),
  status: enquiryStatusEnum("status").notNull().default("new"),
  adminNote: text("admin_note").notNull().default(""),
  businessEmailStatus: text("business_email_status").notNull().default("pending"),
  ackEmailStatus: text("ack_email_status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("enquiries_ref_idx").on(t.reference), index("enquiries_status_idx").on(t.status)]);

export const enquiryItems = pgTable("enquiry_items", {
  id: serial("id").primaryKey(),
  enquiryId: integer("enquiry_id").notNull().references(() => enquiries.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  model: text("model").notNull().default(""),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("GBP"),
});

export const emailLog = pgTable("email_log", {
  id: serial("id").primaryKey(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  kind: text("kind").notNull(),
  status: text("status").notNull(),
  provider: text("provider").notNull().default(""),
  error: text("error").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});
