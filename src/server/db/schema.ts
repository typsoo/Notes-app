// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  index,
  primaryKey,
  pgTableCreator,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `final-notes-app_${name}`);

//---------- BETTER-AUTH TABLES ----------
export const users = createTable("users", (d) => ({
  id: d.uuid("id").primaryKey().defaultRandom(),
  name: d.text("name").notNull(),
  email: d.varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: d.boolean("email_verified").notNull().default(false),
  image: d.text("image"),
  createdAt: d
    .timestamp("created_at", { precision: 6, withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: d
    .timestamp("updated_at", { precision: 6, withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}));

export const session = createTable(
  "session",
  (d) => ({
    id: d.uuid("id").primaryKey().defaultRandom(),
    userId: d
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: d.varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: d
      .timestamp("expires_at", { precision: 6, withTimezone: true })
      .notNull(),
    ipAddress: d.text("ip_address"),
    userAgent: d.text("user_agent"),
    createdAt: d
      .timestamp("created_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: d
      .timestamp("updated_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const account = createTable(
  "account",
  (d) => ({
    id: d.uuid("id").primaryKey().defaultRandom(),
    userId: d
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    issuer: d.text("issuer").notNull(),
    accountId: d.text("account_id").notNull(),
    providerId: d.text("provider_id").notNull(),
    accessToken: d.text("access_token"),
    refreshToken: d.text("refresh_token"),
    accessTokenExpiresAt: d.timestamp("access_token_expires_at", {
      precision: 6,
      withTimezone: true,
    }),
    refreshTokenExpiresAt: d.timestamp("refresh_token_expires_at", {
      precision: 6,
      withTimezone: true,
    }),
    scope: d.text("scope"),
    idToken: d.text("id_token"),
    password: d.text("password"),
    createdAt: d
      .timestamp("created_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: d
      .timestamp("updated_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [index("account_userId_idx").on(t.userId)],
);

export const verification = createTable(
  "verification",
  (d) => ({
    id: d.uuid("id").primaryKey().defaultRandom(),
    identifier: d.text("identifier").notNull(),
    value: d.text("value").notNull(),
    expiresAt: d
      .timestamp("expires_at", { precision: 6, withTimezone: true })
      .notNull(),
    createdAt: d
      .timestamp("created_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: d
      .timestamp("updated_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

//---------- APP TABLES ----------

export const workspaces = createTable("workspaces", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 256 }).notNull(),
}));

export const userWorkspaces = createTable(
  "user_workspaces",
  (d) => ({
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: d
      .uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),

    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.userId, t.workspaceId] })],
);

export const documents = createTable(
  "documents",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    workspaceId: d
      .uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: d.varchar({ length: 256 }).notNull(),
    content: d.text().notNull(),
    isPinned: d.boolean().default(false).notNull(),
    isArchived: d.boolean().default(false).notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),

    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("documents_workspaceId_idx").on(t.workspaceId),
    uniqueIndex("documents_workspaceId_title_idx").on(t.workspaceId, t.title),
  ],
);

export const documentLinks = createTable(
  "document_links",
  (d) => ({
    sourceId: d
      .uuid()
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    targetId: d
      .uuid()
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
  }),
  (t) => [
    primaryKey({ columns: [t.sourceId, t.targetId] }),
    index("document_links_targetId_idx").on(t.targetId),
  ],
);
