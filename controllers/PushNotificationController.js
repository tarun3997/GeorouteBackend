const admin = require("firebase-admin");
const haversine = require("haversine-distance");

const serviceAccount = require("../config/push-notification-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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
async function sendNotification(req, res){
    const { message, registrationToken } = req.body;
 
    try {
        const response = await admin.messaging().send({
            token: registrationToken,
            notification:{
                title: message.title,
                body: message.body,
            }
        })
        res.json({message: "Successfully sent message:"} )
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.log('Error sending message:', error);
   
    }
    
}


async function sendNotifications(message, registrationToken){
    
    try {
        const response = await admin.messaging().send({
            token: registrationToken,
            notification: {
                title: message.title,
                body: message.body,
            }
        });
    } catch (error) {
        console.log('Error sending message:', error);
   
    }
    
}


module.exports = { sendNotifications, sendNotification };
