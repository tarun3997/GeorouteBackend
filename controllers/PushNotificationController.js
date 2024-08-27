const admin = require("firebase-admin");
const haversine = require("haversine-distance");

const serviceAccount = require("../config/push-notification-key.json");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { prisma } = require("../db");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendNotification(message, id) {
  try {
    const adminFcmTokens = await prisma.notificationDevice.findMany({
      select: {
        notificationToken: true,
      },
    });
    const driverFcmToken = await prisma.vehicle.findUnique({
      where: {
        id: id,
      },
      select: {
        notificationToken: true,
      },
    });
    const tokens = [
      ...adminFcmTokens.map((device) => device.notificationToken),
      driverFcmToken.notificationToken,
    ].filter(Boolean);
    const payload = {
      notification: {
        title: message.title,
        body: message.body,
      },
    };
    const promises = tokens.map((token) =>
      admin.messaging().send({
        token,
        ...payload,
      })
    );
    await Promise.all(promises);

    await prisma.notification.create({
      data: {
        vehicleId: id,
        title: message.title,
        body: message.body,
      },
    });
    console.log('Notifications sent successfully!');
  } catch (error) {
    console.log("Error sending message:", error);
  }
}
async function handelGetNotification(req, res) {
    try {
        const {id} = req.params
        const claims = jwt.verify(id, process.env.ACCESS_TOKEN_SECRET);
        if(!claims){
            return res.status(401).send({message: 'unauthenticated'})
        }
        const response = await prisma.notification.findMany({
            where:{
                vehicleId:claims.id
            },
            select:{
                title: true,
                body: true,
                vehicle:{
                    select:{
                        vehicleNumber: true,
                    }
                },
                time: true
            }
        })
        res.status(200).send(response);
    } catch (error) {
        console.log(error)
        res.status(401).json({message:"Getting error from server"})   
    }
}
async function handelAdminGetNotification(req, res) {
    try {
        
        const response = await prisma.notification.findMany({
            select:{
                title: true,
                body: true,
                vehicle:{
                    select:{
                        vehicleNumber: true,
                    }
                },
                time: true
            }
        })
        console.log(response)
        res.status(200).send(response);
    } catch (error) {
        console.log(error)
        res.status(401).json({message:"Getting error from server"})   
    }
}
module.exports = { sendNotification, handelGetNotification,handelAdminGetNotification };
