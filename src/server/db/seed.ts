import "dotenv/config";

import { db } from "@/server/db";
import { documents, userWorkspaces, workspaces } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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

  await db.insert(documents).values([
    {
      workspaceId: workspace.id,
      title: "Document 1",
      content: "Hello",
    },
    {
      workspaceId: workspace.id,
      title: "Document 2",
      content: "World",
    },
  ]);

  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
