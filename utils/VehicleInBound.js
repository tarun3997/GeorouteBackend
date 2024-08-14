const haversine = require("haversine-distance");

const geofenceCenter = {
    lat: 25.044014,
    lng: 73.899915
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