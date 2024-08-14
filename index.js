const express = require('express')
require('dotenv').config()

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'))



app.use('/api', require('./routes/AuthRoutes'))
app.use('/api', require('./routes/VehicleRoutes'))
app.use('/api/update', require('./routes/UpdateRoutes'))

app.listen(process.env.PORT,() => console.log(`server is started ${process.env.PORT}`))