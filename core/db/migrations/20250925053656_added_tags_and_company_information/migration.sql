-- AlterTable
ALTER TABLE "policy" ADD COLUMN "company" TEXT;

-- CreateTable
CREATE TABLE "tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "policyTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "policyId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "policyTag_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "policyTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "policyTag_policyId_tagId_key" ON "policyTag"("policyId", "tagId");
