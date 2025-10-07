/*
  Warnings:

  - A unique constraint covering the columns `[hostname,type,link]` on the table `policy` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "policy_hostname_type_version_key";

-- CreateIndex
CREATE UNIQUE INDEX "policy_hostname_type_link_key" ON "policy"("hostname", "type", "link");
