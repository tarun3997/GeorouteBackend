const axios = require("axios");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { format, isToday } = require("date-fns");
const haversine = require("haversine-distance");
const { formatInTimeZone } = require("date-fns-tz");
const handelVehicleInfo = require("../utils/VehicleInfoUpdate");
const { differenceInMinutes } = require("date-fns/fp");

async function handelVehicleDetail(req, res) {
  try {
    const {
      vehicleNumber,
      vehicleType,
      vehicleRunKM,
      fuelAmount,
      vehicleFuelType,
      vehicleKMLimit,
      driverName,
      id,
    } = req.body;

    const lastFourDigits = vehicleNumber.slice(-4);
    const generatePassword = `${lastFourDigits}${driverName}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatePassword, salt)
    
    const vehicle = await global.prisma.vehicle.create({
      data: {
        id: id,
        vehicleNumber: vehicleNumber,
        vehicleType: vehicleType,
        vehicleRunKM: vehicleRunKM,
        vehicleFuelType: vehicleFuelType,
        vehicleKMLimit: vehicleKMLimit,
        password: hashedPassword,
        vehicleDriver: {
          create: {
            name: driverName,
          },
        },
        fuelLogs: {
          create: {
            fuelAmount : fuelAmount,
            odometerReading: vehicleRunKM,
          }
        },
      },
      include: {
        vehicleDriver: true,
        fuelLogs: true,
      },
    });
    console.log(vehicle)
    res.status(201).json(vehicle);
  } catch (error) {
    console.log(error);
  }
}

async function getVehicleDetails(req, res) {
  try {
    const vehicles = await global.prisma.vehicle.findMany({
      select: {
        id: true,
        vehicleNumber: true,
        vehicleType: true,
        vehicleRunKM: true,
        vehicleFuelType: true,
        vehicleKMLimit: true,
        isVehicleUnderRepairing: true,
        mileage: true,
        fuelLogs: {
          select: {
            fuelAmount: true,
            refuelDate: true,
          }
        },
        vehicleLocation: {
          orderBy: {
            time: "desc",
          },
          take: 1,
        },
      },
    });

    const vehicleDetails = await Promise.all(
      vehicles.map(async (vehicle) => {
        const latestLocation = vehicle.vehicleLocation[0]; // The latest location
        let locationName = "Error fetching location";
        let isActive = true;
        let formattedTime = "N/A";

        if (latestLocation) {
          const { latitude, longitude, time } = latestLocation;
          try {
            const response = await axios.get(
              `https://apis.mapmyindia.com/advancedmaps/v1/${process.env.MAP_MY_INDIA_API_KEY}/rev_geocode`,
              {
                params: {
                  lat: latitude,
                  lng: longitude,
                },
              }
            );
            locationName =
              response.data.results[0].formatted_address || "Unknown location";
          } catch (error) {}
          const date = new Date(time);
          const timeZone = "Asia/Kolkata"; // Specify your timezone here
          formattedTime = formatInTimeZone(date, timeZone, "p");
          const now = new Date();
          const nowZoned = formatInTimeZone(now, timeZone, "p");
          const timeDifference = differenceInMinutes(nowZoned, formattedTime);
          isActive = timeDifference < 1;
        }

        return {
          id: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          vehicleType: vehicle.vehicleType,
          vehicleRunKM: vehicle.vehicleRunKM,
          isVehicleUnderRepairing: vehicle.isVehicleUnderRepairing,
          vehicleFuelType: vehicle.vehicleFuelType,
          vehicleKMLimit: vehicle.vehicleKMLimit,
          vehicleLocation: latestLocation
            ? {
                latitude: latestLocation.latitude,
                longitude: latestLocation.longitude,
                locationName,
              }
            : "No location data",
          updatedTime: formattedTime,
          isActive: isActive,
        };
      })
    );


    res.json(vehicleDetails);
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({ error: "Error fetching vehicle details" });
  }
}

async function getVehicleCount(req, res) {
  try {
    const totalVehicle = await global.prisma.vehicle.count();
    const twoWheeler = await global.prisma.vehicle.count({
      where: {
        vehicleType: {
          in: ["Motorcycle"],
        },
      },
    });
    const fourWheeler = await global.prisma.vehicle.count({
      where: {
        vehicleType: {
          in: ["Safari", "Scorpio", "Gypsy"],
        },
      },
    });
    const heavyVehicle = await global.prisma.vehicle.count({
      where: {
        vehicleType: {
          in: ["Tom25", "ALS", "TATRA", "WB", "BUS"],
        },
      },
    });
    const repairingVehicle = await global.prisma.vehicle.count({
      where:{
        isVehicleUnderRepairing: true
      }
    })

    res.status(200).json({
      total: totalVehicle,
      twoWheeler: twoWheeler,
      fourWheeler: fourWheeler,
      heavyVehicle: heavyVehicle,
      repairingVehicle: repairingVehicle,
    });
  } catch (error) {
    console.log("getting error", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching vehicle counts" });
  }
}

async function getVehicleDetailById(req, res) {
  try {
    const { id, role } = req.headers;
    let userId;
    if (role === "USER") {
      const claims = jwt.verify(id, process.env.ACCESS_TOKEN_SECRET);
      if (!claims) {
        return res.status(401).send({ message: 'Unauthenticated' });
      }
      userId = claims.id;
    } else if (role === "ADMIN") {
      userId = id;
    } else {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const vehicle = await global.prisma.vehicle.findUnique({
      where: { id: userId },
      select: {
        id: true,
        vehicleNumber: true,
        vehicleType: true,
        vehicleRunKM: true,
        vehicleFuelType: true,
        vehicleKMLimit: true,
        vehicleNewKm: true,  
        lastProcessedIndex: true, 
        isVehicleUnderRepairing: true,
        averageSpeed: true,
        maxSpeed: true,
        mileage:true,
        RepairingVehicle:{
          select:{
            vehicleReason: true,
            description: true,
            damagePart: true
          },
        },
        vehicleDriver: { select: { name: true } },
        vehicleLocation: { orderBy: { time: "desc" } }, 
      },
    });


    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }


    const lastProcessedIndex = vehicle.lastProcessedIndex || 0;
    const locations = vehicle.vehicleLocation.slice(lastProcessedIndex);

    let newDistance = 0;
    let validSpeeds = [];


    if (locations.length > 0) {
      locations.forEach((location, i) => {
        if (i < locations.length - 1) {
          const point1 = { lat: location.latitude, lng: location.longitude };
          const point2 = {
            lat: locations[i + 1].latitude,
            lng: locations[i + 1].longitude,
          };

          newDistance += haversine(point1, point2) / 1000;
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


      await global.prisma.vehicle.update({
        where: { id: userId },
        data: {
          vehicleNewKm: vehicle.vehicleNewKm + newDistance, 
          lastProcessedIndex: vehicle.vehicleLocation.length, 
          averageSpeed: newAverageSpeed || vehicle.averageSpeed,
          maxSpeed: Math.max(vehicle.maxSpeed, newMaxSpeed), 
        },
      });
    }


    const latestLocation = vehicle.vehicleLocation[0];
    let locationName = "Error fetching location";
    let isActive = true;
    let formattedTime = "N/A";

    if (latestLocation) {
      const { latitude, longitude, time } = latestLocation;
      try {
        const response = await axios.get(
          `https://apis.mapmyindia.com/advancedmaps/v1/${process.env.MAP_MY_INDIA_API_KEY}/rev_geocode`,
          {
            params: { lat: latitude, lng: longitude },
          }
        );
        locationName =
          response.data.results[0]?.formatted_address || "Unknown location";
      } catch (error) {
        console.error("Error fetching location name:", error);
      }

      const date = new Date(time);
      const timeZone = "Asia/Kolkata";
      formattedTime = formatInTimeZone(date, timeZone, "p");
      const now = new Date();
      const nowZoned = formatInTimeZone(now, timeZone, "p");
      const timeDifference = differenceInMinutes(nowZoned, formattedTime);
      isActive = timeDifference < 1;
    }

    const vehicleDetails = {
      id: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      driverName: vehicle.vehicleDriver?.name || "No driver",
      vehicleType: vehicle.vehicleType,
      vehicleRunKM: Math.abs(vehicle.vehicleRunKM + vehicle.vehicleNewKm).toFixed(2), // Accumulated distance
      vehicleNewKm: parseFloat(vehicle.vehicleNewKm).toFixed(2),
      vehicleFuelType: vehicle.vehicleFuelType,
      vehicleKMLimit: vehicle.vehicleKMLimit,
      vehicleLimitLeft: Math.abs(vehicle.vehicleNewKm - vehicle.vehicleKMLimit).toFixed(2),
      vehicleLocation: latestLocation
        ? {
            latitude: latestLocation.latitude,
            longitude: latestLocation.longitude,
            lastSpeed: latestLocation.speed,
            locationName,
          }
        : "No location data",
      updatedTime: formattedTime,
      isActive: isActive,
      averageSpeed: vehicle.averageSpeed, 
      maxSpeed: vehicle.maxSpeed, 
      isVehicleUnderRepairing: vehicle.isVehicleUnderRepairing,
      vehicleReason: vehicle.RepairingVehicle?.[0]?.vehicleReason || "No repair reason",
      description: vehicle.RepairingVehicle?.[0]?.description || "No description",
      damagePart: vehicle.RepairingVehicle?.[0]?.damagePart || "No damage part specified",
    };
    // console.log(vehicleDetails)
    res.json(vehicleDetails);
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({ error: "Error fetching vehicle details" });
  }
}

async function recordFuelRefill(req, res) {
  try {
    const { id, fuelAmount, odometerReading } = req.body;

    const claims = jwt.verify(id.id, process.env.ACCESS_TOKEN_SECRET);
      if (!claims) {
        return res.status(401).send({ message: 'Unauthenticated' });
      }
     const vehicleId = claims.id;
    const lastFuelLog = await global.prisma.fuelLog.findFirst({
      where: { vehicleId },
      orderBy: { refuelDate: 'desc' }, 
    });

    let mileage = null;
    if (lastFuelLog) {
      const distanceTraveled = odometerReading - lastFuelLog.odometerReading;
      const fuelConsumed = lastFuelLog.fuelAmount;

      mileage = distanceTraveled / fuelConsumed;
    }

    const fuelLog = await global.prisma.fuelLog.create({
      data: {
        vehicleId,
        fuelAmount,
        odometerReading,
      },
    });


    res.status(201).json({
      message: "Fuel refill recorded successfully",
      mileage: mileage ? mileage.toFixed(2) : "N/A", 
    });
  } catch (error) {
    console.error("Error recording fuel refill:", error);
    res.status(500).json({ error: "Error recording fuel refill" });
  }
}

async function deleteVehicle(req, res) {
  try {
      const { id } = req.params; 

      const deletedVehicle = await global.prisma.vehicle.delete({
          where: {
              id: id,
          },
      });
      res.status(200).json({ message: 'Vehicle and all related entries deleted successfully', deletedVehicle });
  } catch (error) {
      console.error(error); 
      res.status(500).json({ message: 'An error occurred while deleting the vehicle', error: error.message });
  }
}


module.exports = {
  handelVehicleDetail,
  getVehicleDetails,
  getVehicleCount,
  getVehicleDetailById,
  recordFuelRefill,
  deleteVehicle
};
