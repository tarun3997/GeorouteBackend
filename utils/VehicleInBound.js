const haversine = require("haversine-distance");

const geofenceCenter = {
    lat: 28.6139,
    lng: 77.2090
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