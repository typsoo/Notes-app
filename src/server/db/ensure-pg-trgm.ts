import "dotenv/config";

import { sql } from "drizzle-orm";

import { db } from "@/server/db";

async function main() {
  await db.execute(sql`create extension if not exists pg_trgm`);
  console.log("pg_trgm is available.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
