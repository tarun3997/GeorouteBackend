const { prisma } = require("../db");
const haversine = require("haversine-distance");
const { isVehicleInBound } = require("../utils/VehicleInBound");
const { sendNotification } = require("./PushNotificationController");

async function VehicleLocation(req, res) {
  const { lat, lng, vehicleId, speed } = req.body;
  try {
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

    const vehicleLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const isInBound = isVehicleInBound(vehicleLocation);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { isOutOfBounds: true }
    });

    if (!isInBound && !vehicle.isOutOfBounds) {
      const message = {
        title: "Vehicle Out of Bounds",
        body: "The vehicle has moved out of the defined geofence.",
      };
      await sendNotification(message, vehicleId);
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { isOutOfBounds: true }
      });
    } else if(isInBound && vehicle.isOutOfBounds) {
      const message = {
        title: "Vehicle Back in Bounds",
        body: "The vehicle has returned to the defined geofence.",
      };
      await sendNotification(message, vehicleId);
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { isOutOfBounds: false }
      });
    }else {
      console.log("Vehicle status hasn't changed.");
    }

    res.status(201).json({
      message: "Location saved!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving location");
  }
}

module.exports = { VehicleLocation };
