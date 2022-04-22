/*
  Warnings:

  - You are about to drop the column `number` on the `terms` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[semester]` on the table `terms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `semester` to the `terms` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "terms_number_key";

-- AlterTable
ALTER TABLE "terms" DROP COLUMN "number",
ADD COLUMN     "semester" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "terms_semester_key" ON "terms"("semester");
