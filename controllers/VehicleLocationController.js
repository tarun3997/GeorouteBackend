const { prisma } = require("../db");

async function VehicleLocation(req, res) {
  const { lat, lng } = req.body;
  console.log(`Received lat: ${lat}, lng: ${lng}`);
  try {
    const location = await prisma.vehicleLocation.create({
      data: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      },
    });
    console.log(location);
    res.status(200).send("Location saved!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving location");
  }
}

module.exports = VehicleLocation;
