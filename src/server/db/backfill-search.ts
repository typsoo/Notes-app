import "dotenv/config";

import { sql } from "drizzle-orm";

import { db } from "@/server/db";
import { documentSearch, documents } from "@/server/db/schema";
import { blocksToPlainText } from "@/features/search/lib/plain-text";

async function main() {
  await db.execute(sql`create extension if not exists pg_trgm`);

  const rows = await db
    .select({ id: documents.id, content: documents.content })
    .from(documents);

  for (const row of rows) {
    const text = blocksToPlainText(row.content);

    await db
      .insert(documentSearch)
      .values({ documentId: row.id, text })
      .onConflictDoUpdate({
        target: documentSearch.documentId,
        set: { text },
      });
  }

  console.log(`Backfilled ${rows.length} document(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
