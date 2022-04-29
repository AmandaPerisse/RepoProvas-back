/*
  Warnings:

  - A unique constraint covering the columns `[pdfUrl]` on the table `tests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tests_pdfUrl_key" ON "tests"("pdfUrl");
