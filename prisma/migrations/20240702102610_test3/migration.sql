/*
  Warnings:

  - You are about to drop the column `vehicleId` on the `VehicleLocation` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `VehicleLocation` DROP FOREIGN KEY `VehicleLocation_vehicleId_fkey`;

-- AlterTable
ALTER TABLE `Admin` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `VehicleLocation` DROP COLUMN `vehicleId`,
    ADD COLUMN `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
