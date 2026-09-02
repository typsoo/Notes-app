// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { index, primaryKey, pgTableCreator, uniqueIndex} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `final-notes-app_${name}`);

export const users = createTable(
  "users",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({length: 256}).notNull(),
    email: d.varchar({length: 255}).notNull().unique(),
    createdAt: d
    .timestamp({ withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: d
    .timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}));


export const workspaces = createTable("workspaces", 
  (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 256 }).notNull(),

}));


export const userWorkspaces = createTable("user_workspaces", 
  (d) => ({
  userId: d.uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceId: d.uuid().notNull().references(() => workspaces.id, { onDelete: "cascade" })  ,
  createdAt: d
    .timestamp({ withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: d
    .timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  }),
  (t) => [
   primaryKey({ columns: [t.userId, t.workspaceId] }),
  ]
)



export const documents = createTable("documents",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    workspaceId: d.uuid().notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    title: d.varchar({ length: 256 }).notNull(),
    content: d.text().notNull(),
    isPinned: d.boolean().default(false).notNull(),
    isArchived: d.boolean().default(false).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("documents_workspaceId_idx").on(t.workspaceId),
    uniqueIndex("documents_workspaceId_title_idx").on(t.workspaceId, t.title)
  ]
)


export const documentLinks = createTable("document_links",
  (d) => ({
    sourceId: d.uuid().notNull().references(() => documents.id, { onDelete: "cascade" }),
    targetId: d.uuid().notNull().references(() => documents.id, { onDelete: "cascade" }),
  }),
  (t) => [
    primaryKey({ columns: [t.sourceId, t.targetId] }),
    index("document_links_targetId_idx").on(t.targetId),
  ]
)

