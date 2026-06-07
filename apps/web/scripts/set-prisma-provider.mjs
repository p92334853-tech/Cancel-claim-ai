// Prisma's datasource `provider` can't be set via env, so we sync it from
// DATABASE_PROVIDER (default: sqlite for instant local dev; postgresql for prod).
// The schema fields are intentionally cross-compatible (no enums/Json/arrays).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "..", "prisma", "schema.prisma");

const provider = (process.env.DATABASE_PROVIDER || "sqlite").trim();
if (!["sqlite", "postgresql"].includes(provider)) {
  console.error(`Unsupported DATABASE_PROVIDER "${provider}" (use sqlite or postgresql).`);
  process.exit(1);
}

const original = readFileSync(schemaPath, "utf8");
const updated = original.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${provider}"`);
if (updated !== original) {
  writeFileSync(schemaPath, updated);
  console.log(`prisma: datasource provider set to "${provider}"`);
} else {
  console.log(`prisma: datasource provider already "${provider}"`);
}
