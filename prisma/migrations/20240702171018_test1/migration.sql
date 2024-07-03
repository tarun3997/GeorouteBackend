/*
  Warnings:

  - You are about to alter the column `latitude` on the `VehicleLocation` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `longitude` on the `VehicleLocation` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `VehicleLocation` MODIFY `latitude` DOUBLE NOT NULL,
    MODIFY `longitude` DOUBLE NOT NULL;
