-- CreateTable
CREATE TABLE `Vehicle` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleNumber` VARCHAR(191) NOT NULL,
    `vehicleType` ENUM('Bike', 'Car', 'Truck') NOT NULL,
    `vehicleModel` VARCHAR(191) NOT NULL,
    `vehicleRunKM` INTEGER NOT NULL,
    `vehicleFuelType` ENUM('Petrol', 'Desiel') NOT NULL,
    `vehicleKMLimit` INTEGER NOT NULL,

    UNIQUE INDEX `Vehicle_vehicleNumber_key`(`vehicleNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleDriver` (
    `id` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,

    UNIQUE INDEX `VehicleDriver_number_key`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleLocation` (
    `id` VARCHAR(191) NOT NULL,
    `latitude` INTEGER NOT NULL,
    `longitude` INTEGER NOT NULL,
    `vehicleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VehicleDriver` ADD CONSTRAINT `VehicleDriver_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehicleLocation` ADD CONSTRAINT `VehicleLocation_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
