// Uwaga: importy względne (bez aliasu `@/`) – ten plik czyta też drizzle-kit,
// który nie rozwiązuje aliasów z tsconfig.
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  BODY_TYPES,
  FUELS,
  GEARBOXES,
  LICENSE_CATEGORIES,
  PALETTES,
  VEHICLE_STATUSES,
} from "../modules/vehicles/types";

export const bodyTypeEnum = pgEnum("body_type", BODY_TYPES);
export const fuelEnum = pgEnum("fuel", FUELS);
export const gearboxEnum = pgEnum("gearbox", GEARBOXES);
export const licenseCategoryEnum = pgEnum("license_category", LICENSE_CATEGORIES);
export const paletteEnum = pgEnum("palette", PALETTES);
export const vehicleStatusEnum = pgEnum("vehicle_status", VEHICLE_STATUSES);
export const inquiryStatusEnum = pgEnum("inquiry_status", ["new", "contacted", "closed"]);
export const userRoleEnum = pgEnum("user_role", ["owner", "staff"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const vehicleCategories = pgTable("vehicle_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  h1: text("h1").notNull(),
  summary: text("summary").notNull(),
  intro: text("intro").array().notNull().default([]),
  useCases: text("use_cases").array().notNull().default([]),
  seoTitle: text("seo_title").notNull(),
  seoDescription: text("seo_description").notNull(),
  bodyType: bodyTypeEnum("body_type").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => vehicleCategories.id, { onDelete: "restrict" }),
    make: text("make").notNull(),
    model: text("model").notNull(),
    variant: text("variant").notNull().default(""),
    year: integer("year").notNull(),
    summary: text("summary").notNull(),
    description: text("description").array().notNull().default([]),
    idealFor: text("ideal_for").array().notNull().default([]),
    features: text("features").array().notNull().default([]),
    payloadKg: integer("payload_kg").notNull(),
    grossWeightKg: integer("gross_weight_kg").notNull(),
    cargoVolumeM3: numeric("cargo_volume_m3", { precision: 4, scale: 1 }).notNull(),
    cargoLengthMm: integer("cargo_length_mm").notNull(),
    cargoWidthMm: integer("cargo_width_mm").notNull(),
    cargoHeightMm: integer("cargo_height_mm").notNull(),
    seats: integer("seats").notNull(),
    fuel: fuelEnum("fuel").notNull(),
    gearbox: gearboxEnum("gearbox").notNull(),
    licenseCategory: licenseCategoryEnum("license_category").notNull().default("B"),
    bodyType: bodyTypeEnum("body_type").notNull(),
    palette: paletteEnum("palette").notNull().default("orange"),
    kmLimitPerDay: integer("km_limit_per_day").notNull(),
    /** Grosze za każdy kilometr ponad limit. */
    extraKmPriceGrosze: integer("extra_km_price_grosze").notNull(),
    depositGrosze: integer("deposit_grosze").notNull(),
    status: vehicleStatusEnum("status").notNull().default("available"),
    /** Szkic / ukrycie auta na stronie bez usuwania go z bazy. */
    isPublished: boolean("is_published").notNull().default(true),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("vehicles_category_idx").on(t.categoryId)],
);

export const vehiclePriceTiers = pgTable(
  "vehicle_price_tiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    minDays: integer("min_days").notNull(),
    /** Cena netto za dobę w groszach. */
    pricePerDayNet: integer("price_per_day_net").notNull(),
  },
  (t) => [unique("vehicle_price_tiers_vehicle_min_days_uq").on(t.vehicleId, t.minDays)],
);

export const vehicleImages = pgTable(
  "vehicle_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    /** Autor i licencja zdjęcia (atrybucja CC). */
    credit: text("credit"),
    /** Strona źródłowa zdjęcia. */
    sourceUrl: text("source_url"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("vehicle_images_vehicle_idx").on(t.vehicleId)],
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    startDate: date("start_date", { mode: "string" }),
    endDate: date("end_date", { mode: "string" }),
    message: text("message"),
    status: inquiryStatusEnum("status").notNull().default("new"),
    /** Moment wyrażenia zgody na kontakt (RODO). */
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inquiries_status_created_idx").on(t.status, t.createdAt)],
);

/** Konta panelu administracyjnego (szef = `owner`, pracownik = `staff`). */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Zawsze małymi literami. */
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("staff"),
  /** Hasz scrypt w formacie `scrypt$N$r$p$sól$hasz` (zob. modules/auth/password.ts). */
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  /** Licznik nieudanych logowań z rzędu; po przekroczeniu limitu konto jest blokowane czasowo. */
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
});

/** Sesje logowania. W bazie trzymamy tylko hasz tokenu z ciasteczka, nigdy sam token. */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const vehicleCategoriesRelations = relations(vehicleCategories, ({ many }) => ({
  vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  category: one(vehicleCategories, {
    fields: [vehicles.categoryId],
    references: [vehicleCategories.id],
  }),
  priceTiers: many(vehiclePriceTiers),
  images: many(vehicleImages),
  inquiries: many(inquiries),
}));

export const vehiclePriceTiersRelations = relations(vehiclePriceTiers, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehiclePriceTiers.vehicleId], references: [vehicles.id] }),
}));

export const vehicleImagesRelations = relations(vehicleImages, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleImages.vehicleId], references: [vehicles.id] }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  vehicle: one(vehicles, { fields: [inquiries.vehicleId], references: [vehicles.id] }),
}));
