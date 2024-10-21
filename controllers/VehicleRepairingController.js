async function handleNewVehicleRepairing(req, res) {
    try {
      const { vehicleId, vehicleReason, description, damagePart } = req.body;
        await global.prisma.$transaction([
        global.prisma.repairingVehicle.create({
          data: {
            vehicleId,
            vehicleReason,
            description,
            damagePart
          }
        }), 
        global.prisma.vehicle.update({
          where: { id: vehicleId },
          data: { isVehicleUnderRepairing: true }
        })
      ]);
  
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error while marking vehicle as under repair:", error);
      res.status(500).json({ error: "Failed to mark vehicle as under repair" });
    }
}

async function handelVehicleRepairingDone(req,res) {
    try {
        const {id} = req.body;
        await global.prisma.vehicle.update({
            where:{
                id: id
            },
            data:{
                isVehicleUnderRepairing: false
            }
        })
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to mark vehicle as under repair" });
    }
}
async function handelVehicleTable(req, res) {
  try {
    const vehicleData = await global.prisma.vehicle.findMany({
      select:{
        vehicleNumber:true,
        vehicleRunKM: true,
        vehicleKMLimit: true,
        averageSpeed:true,
        isVehicleUnderRepairing:true,
        vehicleDriver:{
          select:{
            name:true
          }
        },
      }
    })
    res.status(200).json(vehicleData);
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({ error: "Error fetching vehicle details" });
  }
}
module.exports = {
    handleNewVehicleRepairing,
    handelVehicleRepairingDone,
    handelVehicleTable
}
  