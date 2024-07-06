const bodyParser = require('body-parser')
const express = require('express')
require('dotenv').config()

const app = express()
app.use(express.urlencoded())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'))



app.use('/api', require('./routes/AuthRoutes'))
app.use('/api', require('./routes/VehicleRoutes'))

app.listen(process.env.PORT,() => console.log(`server is started ${process.env.PORT}`))