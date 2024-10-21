/*
  Warnings:

  - You are about to alter the column `vehicleRunKM` on the `vehicle` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `vehicle` MODIFY `vehicleRunKM` DOUBLE NOT NULL,
    MODIFY `mileage` DOUBLE NOT NULL DEFAULT 0.0;
