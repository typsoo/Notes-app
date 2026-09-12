import "dotenv/config";

import { db } from "@/server/db";
import {
  documents,
  folders,
  userWorkspaces,
  workspaces,
} from "@/server/db/schema";

const userId = "mocked-user-id";

async function main() {
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
    userId,
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
      content: "# Welcome\n\nThis is a root note without a folder.",
    },
    {
      workspaceId: workspace.id,
      folderId: personalFolder.id,
      title: "Personal Goals",
      content: "1. Read books\n2. Exercise regularly",
    },
    {
      workspaceId: workspace.id,
      folderId: workFolder.id,
      title: "Meeting Notes",
      content: "Discuss sprint roadmap and goals.",
    },
    {
      workspaceId: workspace.id,
      folderId: projectsFolder.id,
      title: "App Architecture",
      content: "Details about database schema and folder hierarchy.",
    },
  ]);

  console.log("Seed completed successfully");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
