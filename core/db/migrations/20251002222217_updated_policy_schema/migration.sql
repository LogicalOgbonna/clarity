/*
  Warnings:

  - You are about to drop the column `domain` on the `policy` table. All the data in the column will be lost.
  - Added the required column `hostname` to the `policy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_policy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hostname" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "datePublished" DATETIME NOT NULL,
    "company" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_policy" ("company", "content", "createdAt", "datePublished", "id", "link", "type", "updatedAt", "version") SELECT "company", "content", "createdAt", "datePublished", "id", "link", "type", "updatedAt", "version" FROM "policy";
DROP TABLE "policy";
ALTER TABLE "new_policy" RENAME TO "policy";
CREATE UNIQUE INDEX "policy_hostname_type_version_key" ON "policy"("hostname", "type", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
