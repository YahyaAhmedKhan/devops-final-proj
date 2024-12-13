const express = require('express')
const db = require('../db') // Adjust the path as necessary

const router = express()

router.post('/makeBooking', async (req, res) => {
  try {
    const { accountId, flightRecordId, passengerDetails } = req.body
    const flightResults = await makeBooking(accountId, flightRecordId, passengerDetails)
    res.status(200).json(flightResults) // Send the inserted row as JSON response
  } catch (error) {
    console.error('Error adding flight booking:', error)
    res.status(500).json({ error: error.message })
  }
}
)
async function makeBooking (accountId, flightRecordId, passengerDetails) {
  try {
    // Start a transaction
    await db.query('BEGIN')

    const flightBooking = await insertFlightBooking(accountId, flightRecordId)
    const flightBookingId = flightBooking.flight_booking_id

    const seatBookings = []
    for (let i = 0; i < passengerDetails.length; i++) {
      const seatBooking = await insertSeatBooking(passengerDetails[i], flightBookingId, i + 1)
      seatBookings.push(seatBooking)
    }

    // Commit the transaction
    await db.query('COMMIT')

    return [flightBooking, seatBookings]
  } catch (error) {
    // Rollback the transaction in case of an error
    await db.query('ROLLBACK')
    console.error('Transaction failed:', error)
    throw error
  }
}

async function insertFlightBooking (accountId, flightRecordId) {
  try {
    const flightBooking = await db.query(
      'INSERT INTO flight_bookings (total_seats, total_price, account_id, flight_record_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [0, 0, accountId, flightRecordId]
    )
    const insertedFlightBooking = flightBooking.rows[0]

    console.log('Inserted flight booking:', insertedFlightBooking)
    return insertedFlightBooking
  } catch (error) {
    console.error('Error inserting flight booking:', error)
    throw error
  }
}

async function insertSeatBooking (seatDeatils, flightBookingId, seatBookingNumber) {
  const seatNumber = generateRandomSeatNumber()
  const { firstName, lastName, gender, passportNumber, dateOfBirth, nationality, seatClass, specialNeeds, extraBaggage, price } = seatDeatils

  try {
    const seatBooking = await db.query(
        `INSERT INTO seat_bookings (
          flight_booking_id,
          seat_booking_number,
          seat_number,
          first_name,
          last_name,
          gender,
          passport_number,
          date_of_birth,
          nationality,
          seat_class,
          special_needs,
          extra_baggage,
          price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          flightBookingId,
          seatBookingNumber,
          seatNumber,
          firstName,
          lastName,
          gender,
          passportNumber,
          dateOfBirth,
          nationality,
          seatClass,
          specialNeeds,
          extraBaggage,
          price
        ]
    )

    console.log('Inserted seat booking:', seatBooking.rows[0])

    return seatBooking.rows[0]
  } catch (error) {
    console.error('Error inserting seat booking:', error)
    throw error
  }
}

const generateRandomSeatNumber = () => {
  const getRandomChar = (min, max) => {
    const charCode = Math.floor(Math.random() * (max - min + 1)) + min
    return String.fromCharCode(charCode)
  }

  const randomLetter = getRandomChar(65, 90) // ASCII codes for capital letters
  const randomDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0')

  return `${randomLetter}${randomDigits}`
}

module.exports = router
