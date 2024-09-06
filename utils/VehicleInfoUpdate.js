const haversine = require("haversine-distance");

async function handelVehicleInfo(vehicle, id) {
  try {
    const lastProcessedIndex = vehicle.lastProcessedIndex || 0;
    const locations = vehicle.vehicleLocation.slice(lastProcessedIndex);
    let totalDistance = 0;
    let validSpeeds = [];
    console.log('run')
    if (locations.length > 0) {
      locations.forEach((location, i) => {
        if (i < locations.length - 1) {
          const point1 = { lat: location.latitude, lng: location.longitude };
          const point2 = { lat: locations[i + 1].latitude, lng: locations[i + 1].longitude };
          const distance = haversine(point1, point2);
          
          if (distance > 50) {
            totalDistance += distance / 1000; // Convert to KM
          }
        }
        if (location.speed > 5) {
          validSpeeds.push(location.speed);
        }
      });

      let newAverageSpeed = 0;
      let newMaxSpeed = 0;
      
      if (validSpeeds.length > 0) {
        newAverageSpeed = validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length;
        newMaxSpeed = Math.max(...validSpeeds);
      }

      const roundedNewAverageSpeed = Math.round(newAverageSpeed * 100) / 100;

      console.log("rounded avr", roundedNewAverageSpeed)
      console.log("Avg speed", Math.round((vehicle.averageSpeed + roundedNewAverageSpeed) * 100) / 100)
      console.log("max speed", Math.max(vehicle.maxSpeed, newMaxSpeed))
      await global.prisma.vehicle.update({
        where: { id },
        data: {
          vehicleNewKm: totalDistance,
          lastProcessedIndex: vehicle.vehicleLocation.length,
          averageSpeed: Math.round((vehicle.averageSpeed + roundedNewAverageSpeed) * 100) / 100,
          maxSpeed: Math.max(vehicle.maxSpeed, newMaxSpeed),
        },
      });

      console.log("location is updated");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error updating vehicle info", error);
  }
}


module.exports = handelVehicleInfo