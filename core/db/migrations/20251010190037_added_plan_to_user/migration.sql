-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "browserId" TEXT NOT NULL,
    "numberOfSummaries" INTEGER NOT NULL DEFAULT 0,
    "password" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_user" ("browserId", "createdAt", "email", "id", "name", "numberOfSummaries", "updatedAt") SELECT "browserId", "createdAt", "email", "id", "name", "numberOfSummaries", "updatedAt" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_browserId_key" ON "user"("browserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
