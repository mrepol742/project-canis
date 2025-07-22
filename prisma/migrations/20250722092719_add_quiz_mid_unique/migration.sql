/*
  Warnings:

  - A unique constraint covering the columns `[mid]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Quiz_mid_key` ON `Quiz`(`mid`);
