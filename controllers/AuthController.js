const bcrypt = require("bcryptjs");
const  jwt  = require("jsonwebtoken");
const { prisma } = require("../db");

async function handelLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await prisma.admin.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.status(200).json({ message: "Login successful", id: user.id });
  } catch (error) {
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
    res.status(201).json({ message: "User created successfully",id: user.id });
  } catch (error) {
    throw(error);
  }
}

module.exports = { handelRegistration, handelLogin };

