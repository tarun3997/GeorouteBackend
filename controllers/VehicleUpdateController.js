const { prisma } = require("../db");

async function UpdateVehicleKmLimit(req, res) {
    try {
        const { id, newLimit } = req.body;

        await prisma.vehicle.update({
            where: {
                id: id
            },
            data: {
                vehicleKMLimit: newLimit
            }
        });

        res.status(201).json({ message: "Limit updated successfully" });
    } catch (error) {
        console.error('Error updating limit:', error);
        res.status(500).json({ error: 'Error updating limit' });
    }
}
async function UpdateVehicleFuel(req, res) {
    try {
        const { vehicleId, newFuelEntered, vehicleRunKM } = req.body;
        console.log("Received:", { vehicleId, newFuelEntered, vehicleRunKM });

        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });

        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        console.log("Current Vehicle Data:", vehicle);

        if (newFuelEntered <= 0) {
            return res.status(400).json({ error: "New fuel entered must be greater than 0" });
        }

        const mileage = calMileage(newFuelEntered, vehicle.vehicleRunKM, vehicleRunKM);
        console.log("Calculated Mileage:", mileage);

        const fuelLogEntry = await prisma.fuelLog.findFirst({
            where: { vehicleId: vehicleId }
        });

        if (!fuelLogEntry) {
            return res.status(404).json({ error: "Fuel log not found for this vehicle" });
        }

        // Update transaction
        const result = await prisma.$transaction([
            prisma.fuelLog.update({
                where: { id: fuelLogEntry.id }, // Use the id of the found FuelLog entry
                data: {
                    fuelAmount: newFuelEntered,
                    odometerReading: vehicleRunKM,
                }
            }),
            prisma.vehicle.update({
                where: { id: vehicleId },
                data: {
                    mileage: mileage,
                    vehicleRunKM: vehicleRunKM,
                }
            })
        ]);

        console.log("Transaction Result:", result);

        res.status(200).json({ success: true, message: "Fuel updated successfully" });
    } catch (error) {
        console.error("Error while updating fuel:", error);
        res.status(500).json({ error: "Failed to update fuel" });
    }
}


function calMileage(newFuelEntered, previousOdometerReading, currentOdometerReading) {
    const mileage = (currentOdometerReading - previousOdometerReading) / newFuelEntered;
    return parseFloat(mileage.toFixed(2));
}


module.exports = { UpdateVehicleKmLimit, UpdateVehicleFuel };