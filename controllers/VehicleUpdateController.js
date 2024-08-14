const { prisma } = require("../db");

async function UpdateVehicleKmLimit(req, res) {
    try {
        const {id, newLimit} = req.body;

        await prisma.vehicle.update({
            where:{
                id: id
            },
            data:{
                vehicleKMLimit: newLimit
            }
        })

        res.status(201).json({message:"Limit updated successfuly"})
    } catch (error) {
        console.error('Error updating limit:', error);
        res.status(500).json({ error: 'Error updating limit' });
    }
}

module.exports = {UpdateVehicleKmLimit}