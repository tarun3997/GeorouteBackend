const { prisma } = require("../db");
const haversine = require("haversine-distance");


async function VehicleLocation(req, res) {
  const { lat, lng ,vehicleId} = req.body;
  console.log(`Received lat: ${lat}, lng: ${lng} ${vehicleId}`);
  try {
    const lastLocation = await prisma.vehicleLocation.findFirst({
      where:{vehicleId: vehicleId },
      orderBy: { time: 'desc' },
    })

    let distance = 0;
    if (lastLocation) {
      const lastCoords = { lat: lastLocation.latitude, lng: lastLocation.longitude };
      const newCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
      distance = haversine(lastCoords, newCoords) / 1000; // Convert to kilometers
    }
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    const newVehicleRunKM = (vehicle.vehicleRunKM || 0) + distance;

   const location = await prisma.vehicleLocation.create({
      data: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        vehicle: {
          connect: { id: vehicleId },
        },
      },
    });
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { vehicleRunKM: newVehicleRunKM },
    });
    console.log(newVehicleRunKM);
    console.log(location);
    res.status(200).send("Location saved!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving location");
  }
}

module.exports = {VehicleLocation};
