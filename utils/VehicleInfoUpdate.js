const haversine = require("haversine-distance");

async function handelVehicleInfo(vehicle, id) {
  try {
    const lastProcessedIndex = vehicle.lastProcessedIndex || 0;
    const locations = vehicle.vehicleLocation.slice(lastProcessedIndex);
    let totalDistance = 0;
    let validSpeeds = [];
    if (locations.length > 0) {
      locations.forEach((location, i) => {
        if (i < locations.length - 1) {
          const point1 = { lat: Math.round(location.latitude * 100) / 100,
            lng: Math.round(location.longitude * 100) / 100, };
          const point2 = {
            lat: Math.round(locations[i + 1].latitude * 100) / 100,
            lng: Math.round(locations[i + 1].longitude * 100) / 100,
          };
          const distance = haversine(point1, point2)
          if(distance > 50){
          totalDistance += haversine(point1, point2) / 1000;
          }
        }
        if (location.speed > 5) {
          validSpeeds.push(location.speed);
        }
      });

      const [newAverageSpeed, newMaxSpeed] = validSpeeds.length
        ? [
            validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length,
            Math.max(...validSpeeds),
          ]
        : [0, 0];
      const roundedNewAverageSpeed = Math.round(newAverageSpeed * 100) / 100;

      await global.prisma.vehicle.update({
        where: { id },
        data: {
          vehicleNewKm: totalDistance,
          lastProcessedIndex: vehicle.vehicleLocation.length,
          averageSpeed:
            Math.round((vehicle.averageSpeed + roundedNewAverageSpeed) * 100) /
            100,
          maxSpeed: Math.max(vehicle.maxSpeed, newMaxSpeed),
        },
      });
      console.log("location is updated")
    }
  } catch (error) {
    console.log(error)
    throw new Error("Getting error in updateing vehicle info", error);
    
  }
}

module.exports = handelVehicleInfo