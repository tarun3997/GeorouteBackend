const axios = require('axios');
require('dotenv').config()
const { format, isToday,differenceInMinutes } = require('date-fns');



async function handelVehicleDetail(req,res){
    try {
        const {vehicleNumber,vehicleType,vehicleRunKM,vehicleFuelType,vehicleKMLimit,driverName, id} = req.body

        const vehicle = await global.prisma.vehicle.create({
            data:{
                id: id,
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
        res.status(201).json(vehicle);
    } catch (error) {
      console.log(error)
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
          vehicleLocation: {
            orderBy: {
                time: 'desc'
            },
            take: 1 // Take only the latest location
          }
        }
      });
  
      const vehicleDetails = await Promise.all(vehicles.map(async (vehicle) => {
        const latestLocation = vehicle.vehicleLocation[0]; // The latest location
        let locationName = 'Error fetching location';
        let isActive = true;
        let formattedTime = 'N/A';

        if (latestLocation) {
          const { latitude, longitude, time } = latestLocation;
          try {
            const response = await axios.get(`https://apis.mapmyindia.com/advancedmaps/v1/${process.env.MAP_MY_INDIA_API_KEY}/rev_geocode`, {
              params: {
                lat: latitude,
                lng: longitude
              }
            });
            locationName = response.data.results[0].formatted_address || 'Unknown location';
          } catch (error) {
          }
          const date = new Date(time);
          const now = new Date();
          const timeDifference = differenceInMinutes(now, date);
          isActive = timeDifference >= 1;

          if (isToday(date)) {
            formattedTime = format(date, 'p'); // Only time
          } else {
            formattedTime = format(date, 'P p'); // Date and time
          }
        }
        
        return {
          id: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          vehicleType: vehicle.vehicleType,
          vehicleRunKM: vehicle.vehicleRunKM,
          vehicleFuelType: vehicle.vehicleFuelType,
          vehicleKMLimit: vehicle.vehicleKMLimit,
          vehicleLocation: latestLocation ? { latitude: latestLocation.latitude, longitude: latestLocation.longitude, locationName } : 'No location data',
          updatedTime: formattedTime,
          isActive: isActive
        };
      }));

      res.json(vehicleDetails);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      res.status(500).json({ error: 'Error fetching vehicle details' });
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

async function getVehicleDetailById(req, res) {
  try {
    const { id } = req.params;

    const vehicle = await global.prisma.vehicle.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        vehicleNumber: true,
        vehicleType: true,
        vehicleRunKM: true,
        vehicleFuelType: true,
        vehicleKMLimit: true,
        vehicleDriver: {
          select: {
            name: true,
          },
        },
        vehicleLocation: {
          where: { time: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }, // Fetch today's data
          orderBy: { time: 'desc' }
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const locations = vehicle.vehicleLocation;
    let locationName = 'Error fetching location';
    let isActive = true;
    let formattedTime = 'N/A';
    let averageSpeed = 0;
    let maxSpeed = 0;

    if (locations.length > 0) {
      let totalSpeed = 0;
      let speedCount = 0;
      for (let loc of locations) {
        const speed = loc.speed;
        totalSpeed += speed;
        if (speed > maxSpeed) maxSpeed = speed;
        speedCount += 1;
      }
      if (speedCount > 0) {
        averageSpeed = totalSpeed / speedCount;
      }
      averageSpeed = averageSpeed.toFixed(2);
      maxSpeed = maxSpeed.toFixed(2);

      const latestLocation = locations[locations.length - 1];
      const { latitude, longitude, time } = latestLocation;
      try {
        const response = await axios.get(`https://apis.mapmyindia.com/advancedmaps/v1/${process.env.MAP_MY_INDIA_API_KEY}/rev_geocode`, {
          params: {
            lat: latitude,
            lng: longitude,
          },
        });
        locationName = response.data.results[0].formatted_address || 'Unknown location';
      } catch (error) {
        console.error('Error fetching location name:', error);
      }

      const date = new Date(time);
      const now = new Date();
      const timeDifference = differenceInMinutes(now, date);
      isActive = timeDifference < 1;

      if (isToday(date)) {
        formattedTime = format(date, 'p'); 
      } else {
        formattedTime = format(date, 'P p'); 
      }
    }

    const vehicleDetails = {
      id: vehicle.id,
      vehicleNumber: vehicle.vehicleNumber,
      driverName: vehicle.vehicleDriver.name,
      vehicleType: vehicle.vehicleType,
      vehicleRunKM: vehicle.vehicleRunKM,
      vehicleFuelType: vehicle.vehicleFuelType,
      vehicleKMLimit: vehicle.vehicleKMLimit,
      vehicleLimitLeft: Math.abs(vehicle.vehicleRunKM - vehicle.vehicleKMLimit),
      vehicleLocation: locations.length ? { latitude: locations[locations.length - 1].latitude, longitude: locations[locations.length - 1].longitude, locationName } : 'No location data',
      updatedTime: formattedTime,
      isActive: isActive,
      averageSpeed,
      maxSpeed,
    };

    res.json(vehicleDetails);
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    res.status(500).json({ error: 'Error fetching vehicle details' });
  }
}

module.exports = {handelVehicleDetail, getVehicleDetails, getVehicleCount, getVehicleDetailById}