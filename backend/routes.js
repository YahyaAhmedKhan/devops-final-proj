const express = require('express')
const router = express.Router()
const accountRoutes = require('./routes/accounts.js')
const loginRoutes = require('./routes/login.js')
const flightRoutes = require('./routes/flights.js')
const bookingRoutes = require('./routes/booking.js')

router.use('/accounts', accountRoutes)
router.use('/login', loginRoutes)
router.use('/flights', flightRoutes)
router.use('/booking', bookingRoutes)

module.exports = router
