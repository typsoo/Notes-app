import "dotenv/config";

import { db } from "@/server/db";
import {
  documents,
  folders,
  users,
  userWorkspaces,
  workspaces,
} from "@/server/db/schema";
import type { Block } from "@blocknote/core";

function createParagraph(text: string): Block {
  return {
    id: crypto.randomUUID(),
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  };
}

function createHeading(text: string, level: 1 | 2 | 3 = 1): Block {
  return {
    id: crypto.randomUUID(),
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level,
    },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  };
}

function createNumberedListItem(text: string): Block {
  return {
    id: crypto.randomUUID(),
    type: "numberedListItem",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      start: 1,
    },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  };
}

async function main() {
  let [user] = await db.select().from(users).limit(1);

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        name: "Test User",
        email: "test@example.com",
      })
      .returning();
  }

  if (!user) {
    throw new Error("Failed to get or create user");
  }

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: "Test Workspace",
    })
    .returning();

  if (!workspace) {
    throw new Error("Failed to create workspace");
  }

  await db.insert(userWorkspaces).values({
    userId: user.id,
    workspaceId: workspace.id,
  });

  // 1. Create root folders (parentId: null)
  const [personalFolder] = await db
    .insert(folders)
    .values({
      workspaceId: workspace.id,
      name: "Personal",
      parentId: null,
    })
    .returning();

  const [workFolder] = await db
    .insert(folders)
    .values({
      workspaceId: workspace.id,
      name: "Work",
      parentId: null,
    })
    .returning();

  if (!personalFolder || !workFolder) {
    throw new Error("Failed to create root folders");
  }

  // 2. Create nested subfolder (parentId: workFolder.id)
  const [projectsFolder] = await db
    .insert(folders)
    .values({
      workspaceId: workspace.id,
      name: "Projects",
      parentId: workFolder.id,
    })
    .returning();

  if (!projectsFolder) {
    throw new Error("Failed to create nested folder");
  }

  // 3. Create documents (root, in root folder, and in nested folder)
  await db.insert(documents).values([
    {
      workspaceId: workspace.id,
      folderId: null,
      title: "Welcome Note",
      content: [
        createHeading("Welcome", 1),
        createParagraph("This is a root note without a folder."),
      ],
    },
    {
      workspaceId: workspace.id,
      folderId: personalFolder.id,
      title: "Personal Goals",
      content: [
        createNumberedListItem("Read books"),
        createNumberedListItem("Exercise regularly"),
      ],
    },
    {
      workspaceId: workspace.id,
      folderId: workFolder.id,
      title: "Meeting Notes",
      content: [createParagraph("Discuss sprint roadmap and goals.")],
    },
    {
      workspaceId: workspace.id,
      folderId: projectsFolder.id,
      title: "App Architecture",
      content: [
        createParagraph("Details about database schema and folder hierarchy."),
      ],
    },
  ]);

  console.log("Seed completed successfully");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
