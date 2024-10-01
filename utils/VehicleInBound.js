const haversine = require("haversine-distance");

const geofenceCenter = {
    lat: 24.554989,
    lng: 73.677599
}
const geofenceRadius = 1000;

function isVehicleInBound(vehicleLocation){
    const vehicleCoords = {
        lat: vehicleLocation.lat,
        lng: vehicleLocation.lng
      };

      const distance = haversine(geofenceCenter, vehicleCoords);
      return distance <= geofenceRadius;
}

module.exports = { isVehicleInBound}