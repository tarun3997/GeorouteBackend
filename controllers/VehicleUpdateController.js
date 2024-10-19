const { prisma } = require("../db");

async function UpdateVehicleKmLimit(req, res) {
    try {
        const {id, newLimit} = req.body;

        await prisma.vehicle.update({
            where:{
                id: id
            },
            data:{
                vehicleKMLimit: newLimit
            }
        })

        res.status(201).json({message:"Limit updated successfuly"})
    } catch (error) {
        console.error('Error updating limit:', error);
        res.status(500).json({ error: 'Error updating limit' });
    }
}

function calMileage(newFuelEntered, odometerReading, vehicleRunKM) {
    return (vehicleRunKM-odometerReading)/newFuelEntered;
}

async function UpdateVehicleFuel(req, res) {
    try {
        const { vehicleId, newFuelEntered, odometerReading, vehicleRunKM } = req.body;
          await global.prisma.$transaction([
          global.prisma.repairingVehicle.create({
            data: {
                vehicleId,
                newFuelEntered,
                odometerReading
            }
          }),
          global.prisma.vehicle.update({
            where: { id: vehicleId },
            data: { 
                vehicleId: vehicleId,
                mileage: calMileage(newFuelEntered, odometerReading, vehicleRunKM),
                fuelAmount: newFuelEntered,
                odometerReading: odometerReading,
                vehicleRunKM: odometerReading
            }
          })
        ]);
    
        res.status(200).json({ success: true });
      } catch (error) {
        console.error("Error while updating fuel", error);
        res.status(500).json({ error: "Failed to update" });
      }
}

module.exports = {UpdateVehicleKmLimit, UpdateVehicleFuel}