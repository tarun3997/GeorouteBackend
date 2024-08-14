const { prisma } = require("../db");
const haversine = require("haversine-distance");
const { isVehicleInBound } = require("../utils/VehicleInBound");
const { sendNotification } = require("./PushNotificationController");


async function VehicleLocation(req, res) {
  const { lat, lng ,vehicleId,speed} = req.body;
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

    console.log(vehicle)
    const newVehicleRunKM = (vehicle.vehicleRunKM || 0) + distance;

   const location = await prisma.vehicleLocation.create({
      data: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        speed: parseFloat(speed),
        vehicle: {
          connect: { id: vehicleId },
        },
      },
    });
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { vehicleRunKM: newVehicleRunKM },
    });
    const vehicleLocation = {lat: parseFloat(lat), lng: parseFloat(lng)};
    if(!isVehicleInBound(vehicleLocation)){
      console.log('Vehicle is out of bounds.');
    }else {
      console.log('Vehicle is within bounds.');
    }
   
    res.status(201).json({
      message: "Location saved!",
      location: location
    });  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving location");
  }
}

module.exports = {VehicleLocation};
