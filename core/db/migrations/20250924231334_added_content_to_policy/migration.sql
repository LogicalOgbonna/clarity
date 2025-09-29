/*
  Warnings:

  - Added the required column `content` to the `policy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_policy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_policy" ("createdAt", "domain", "id", "link", "type", "updatedAt", "version") SELECT "createdAt", "domain", "id", "link", "type", "updatedAt", "version" FROM "policy";
DROP TABLE "policy";
ALTER TABLE "new_policy" RENAME TO "policy";
CREATE UNIQUE INDEX "policy_domain_type_version_key" ON "policy"("domain", "type", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
