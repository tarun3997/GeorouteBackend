const { prisma } = require("../db");
const haversine = require("haversine-distance");
const { isVehicleInBound } = require("../utils/VehicleInBound");
const { sendNotification } = require("./PushNotificationController");


async function VehicleLocation(req, res) {
  const { lat, lng ,vehicleId} = req.body;
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
    const vehicleLocation = {lat: parseFloat(lat), lng: parseFloat(lng)};
    if(!isVehicleInBound(vehicleLocation)){
      console.log('Vehicle is out of bounds.');
      await sendNotification('Alert', 'Vehicle is out of bounds!', 'd41VCvluTlO4-YEYU842fv:APA91bFHlfQduoJrhh2DpAzqjKyWuI-l0xazhGzuJcoARnEBSRAhxp7W1LwLKhykWiC210iGO_EeolCHwJJbVMzL984gUjfK4g8-k4gYvA0C_4Pe1q2n9Ht55Dr7QuGJBz4kS7R1vj9V');
    }else {
      console.log('Vehicle is within bounds.');
    }
   
    res.status(200).send("Location saved!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving location");
  }
}

module.exports = {VehicleLocation};
