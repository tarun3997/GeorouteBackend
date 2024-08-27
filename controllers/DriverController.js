const jwt = require("jsonwebtoken");
require("dotenv").config();

const { prisma } = require("../db");

async function handelDriverDetail(req, res) {
    try {
        const {id} = req.params;
        const claims = jwt.verify(id, process.env.ACCESS_TOKEN_SECRET);
        if(!claims){
            return res.status(401).send({message: 'unauthenticated'})
        } 
        const driver = await prisma.vehicle.findUnique({
            where:{
                id:claims.id
            },
            select:{
                vehicleNumber: true,
                vehicleType: true,
                vehicleRunKM: true,
                vehicleFuelType: true,
                vehicleKMLimit: true,
                vehicleNewKm: true,
                averageSpeed: true,
                maxSpeed: true,
                lastProcessedIndex: true,
                vehicleDriver:{
                    select:{
                        name: true
                    }
                },
                vehicleLocation: {
                    orderBy: {
                      time: "desc",
                    },
                  },
            }
        })
        res.status(200).json(driver)
    } catch (error) {
        console.log(error);
    }
}

async function IsUserIsAdmin(req, res) {
    try {
        const {id} = req.params;
        const claims = jwt.verify(id, process.env.ACCESS_TOKEN_SECRET);
        if(!claims){
            return res.status(401).send({message: 'unauthenticated'})
        } 
        const isAdmin = await prisma.admin.findUnique({
            where:{
                id: claims.id
            }
        })
        if(isAdmin){
            return res.status(200).json({user: "ADMIN"});
        }else{
            const isDriver = await prisma.vehicle.findUnique({
                where:{
                    id: claims.id
                }
            })
            if(isDriver){
                return res.status(200).json({user: "DRIVER"});
            }else{
                return res.status(401).json({user: "UNAUTHORIZED"});
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({user: "UNAUTHORIZED"});
    }
}

module.exports = {handelDriverDetail, IsUserIsAdmin}