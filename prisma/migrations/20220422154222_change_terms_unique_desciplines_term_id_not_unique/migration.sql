/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `terms` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "disciplines_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "terms_number_key" ON "terms"("number");
