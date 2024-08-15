const { prisma } = require("../db");
const haversine = require("haversine-distance");
const { isVehicleInBound } = require("../utils/VehicleInBound");
const { sendNotifications } = require("./PushNotificationController");


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
      const vaildDistance = haversine(lastCoords, newCoords)
      if(vaildDistance > 300){
      distance = haversine(lastCoords, newCoords) / 1000; 
      }
    }
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    // console.log(distance)
    const newVehicleRunKM = (vehicle.vehicleNewKm || 0) + distance;
    console.log(newVehicleRunKM)
   await prisma.vehicleLocation.create({
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
      data: { vehicleNewKm: newVehicleRunKM },
    });
    const vehicleLocation = {lat: parseFloat(lat), lng: parseFloat(lng)};
    if(!isVehicleInBound(vehicleLocation)){
      console.log('Vehicle is out of bounds.');
      const message = {
        title: "Vehicle Out of Bounds",
        body: "The vehicle has moved out of the defined geofence."
    };

    const registrationToken = "cRHTdJHGQCObW8BpeHlLNI:APA91bF2rCHjYV1e8ovqPN0_EC5ErXj0EUTffVKwl5eFbRazNho9YlOHwbxLFynaFcnXhnJM40bJjZEOa-GFlL7EP0jQ15WBJ3kcFC-T_GrZa_T5KNQnw516MnC8bQNGtXTgB7ldL3wd";
      await sendNotifications(message, registrationToken)
    }else {
      console.log('Vehicle is within bounds.');
    }
   
    res.status(201).json({
      message: "Location saved!",
    });  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving location");
  }
}

module.exports = {VehicleLocation};
