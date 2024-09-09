/*
  Warnings:

  - The values [Desiel] on the enum `FuelType` will be removed. If these variants are still used in the database, this will fail.
  - The values [Bike,Car,Truck] on the enum `VehicleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `vehicleModel` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `VehicleDriver` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vehicleId]` on the table `VehicleDriver` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VehicleDriver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speed` to the `VehicleLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleId` to the `VehicleLocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FuelType_new" AS ENUM ('Petrol', 'Diesel');
ALTER TABLE "Vehicle" ALTER COLUMN "vehicleFuelType" TYPE "FuelType_new" USING ("vehicleFuelType"::text::"FuelType_new");
ALTER TYPE "FuelType" RENAME TO "FuelType_old";
ALTER TYPE "FuelType_new" RENAME TO "FuelType";
DROP TYPE "FuelType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "VehicleType_new" AS ENUM ('Motorcycle', 'Ton25', 'ALS', 'TATRA', 'WB', 'Bus', 'Safari', 'Scorpio');
ALTER TABLE "Vehicle" ALTER COLUMN "vehicleType" TYPE "VehicleType_new" USING ("vehicleType"::text::"VehicleType_new");
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "VehicleType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "VehicleDriver" DROP CONSTRAINT "VehicleDriver_vehicleId_fkey";

-- DropIndex
DROP INDEX "VehicleDriver_number_key";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "vehicleModel",
ADD COLUMN     "averageSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isOutOfBounds" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastProcessedIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxSpeed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "notificationToken" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vehicleNewKm" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "VehicleDriver" DROP COLUMN "number",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "VehicleLocation" ADD COLUMN     "speed" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vehicleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "NotificationDevice" (
    "id" TEXT NOT NULL,
    "notificationToken" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationDevice_notificationToken_key" ON "NotificationDevice"("notificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_id_key" ON "Vehicle"("id");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleDriver_vehicleId_key" ON "VehicleDriver"("vehicleId");

-- AddForeignKey
ALTER TABLE "NotificationDevice" ADD CONSTRAINT "NotificationDevice_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDriver" ADD CONSTRAINT "VehicleDriver_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleLocation" ADD CONSTRAINT "VehicleLocation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
