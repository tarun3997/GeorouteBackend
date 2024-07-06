async function handelVehicleDetail(req,res){
    try {
        const {vehicleNumber,vehicleType,vehicleRunKM,vehicleFuelType,vehicleKMLimit,driverName, id} = req.body
        const vehicle = await global.prisma.vehicle.create({
            data:{
                id: BigInt(id),
                vehicleNumber: vehicleNumber,
                vehicleType: vehicleType,
                vehicleRunKM: vehicleRunKM,
                vehicleFuelType: vehicleFuelType,
                vehicleKMLimit: vehicleKMLimit,
                vehicleDriver:{
                    create:{
                        name: driverName
                    }
                } 
            },
            include:{
                vehicleDriver: true
            }

        })
        console.log(vehicle)
        res.status(201).json(vehicle);
    } catch (error) {
        console.log("getting error",error)
    }
}
async function getVehicleDetails(req,res){
    try {
        const response = await global.prisma.vehicle.findMany()
        console.log(response)
        res.status(200).json(response)
    } catch (error) {
        console.log("getting error",error)
    }
}

async function getVehicleCount(req,res){
    try {
        const totalVehicle = await global.prisma.vehicle.count()
        const twoWheeler = await global.prisma.vehicle.count({
            where:{
                vehicleType: {
                    in: ["Motorcycle"]
                }
            }
        })
        const fourWheeler = await global.prisma.vehicle.count({
            where: {
                vehicleType: {
                    in: ["Safari", "Scorpio"]
                }
            }
        })
        const heavyVehicle= await global.prisma.vehicle.count({
            where: {
                vehicleType: {
                    in: ["Ton25", "ALS","TATRA", "WB","Bus"]
                }
            }
        })

        res.status(200).json({
            total: totalVehicle,
            twoWheeler: twoWheeler,
            fourWheeler: fourWheeler,
            heavyVehicle: heavyVehicle
        });
    } catch (error) {
        console.log("getting error",error)
        res.status(500).json({ error: "An error occurred while fetching vehicle counts" });

    }
}

module.exports = {handelVehicleDetail, getVehicleDetails, getVehicleCount}