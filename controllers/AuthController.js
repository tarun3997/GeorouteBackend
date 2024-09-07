const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { prisma } = require("../db");

async function handelLogin(req, res) {
  try {
    const { email, password, fcmToken } = req.body;
    const user = await prisma.admin.findUnique({
      where: {
        email: email,
      },
      include: {
        notificationDevice: true
      }
    });
    
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      const existingToken = user.notificationDevice.find(
        (device) => device.notificationToken === fcmToken
      );
      
      if (!existingToken) {
        await prisma.notificationDevice.create({
          data: {
            notificationToken: fcmToken,
            admin: {
              connect: {
                id: user.id
              }
            },
          },
        });
      }
      
      const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET);
      
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res
        .status(200)
        .json({ message: "Admin login successful", id: token, role: "ADMIN" });
      
    } else {
      const vehicle = await prisma.vehicle.findUnique({
        where: {
          vehicleNumber: email,
        },
      });
      
      if (vehicle) {
        const isMatch = await bcrypt.compare(password, vehicle.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid password" });
        }
        
        const token = jwt.sign(
          { id: vehicle.id },
          process.env.ACCESS_TOKEN_SECRET
        );
        
        if (!vehicle.notificationToken || vehicle.notificationToken !== fcmToken) {
          await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { notificationToken: fcmToken },
          });
        }
        
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        return res
          .status(200)
          .json({
            message: "Driver login successful",
            id: token,
            role: "DRIVER",
          });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function handelRegistration(req, res) {
  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await global.prisma.admin.create({
      data: {
        name: name,
        email: email,

        password: hashedPassword,
      },
    });
    res.status(201).json({ message: "User created successfully", id: user.id });
  } catch (error) {
    throw error;
  }
}

module.exports = { handelRegistration, handelLogin };
