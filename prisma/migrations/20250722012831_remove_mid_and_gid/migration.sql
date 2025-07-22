/*
  Warnings:

  - You are about to drop the column `gid` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mid` on the `Message` table. All the data in the column will be lost.
  - Made the column `lid` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_gid_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_lid_fkey`;

-- DropIndex
DROP INDEX `Message_gid_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_lid_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_mid_key` ON `Message`;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `gid`,
    DROP COLUMN `mid`,
    MODIFY `lid` VARCHAR(191) NOT NULL;
