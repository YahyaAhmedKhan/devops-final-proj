const express = require('express')
const db = require('../db') // Adjust the path as necessary

const router = express()

// Login endpoint
router.post('/', async (req, res) => {
  try {
    const { origin, destination, date } = req.query
    console.log(origin, destination, date)

    const flightResults = await searchFlights(origin, destination, date)

    res.json(flightResults)
  } catch (err) {
    console.error('Error occurred while searching for flights')
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/:flightId', async (req, res) => {
  try {
    const { flightId } = req.params
    console.log(flightId)

    const flightResults = await searchFlightById(flightId)

    res.json(flightResults)
  } catch (err) {
    console.error('Error occurred while searching for flights')
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

async function searchFlightById (flightId) {
  try {
    const query = `
      SELECT f.*
      FROM flights AS f
      WHERE f.flight_id = $1;
    `
    const result = await db.query(query, [flightId])

    return result.rows
  } catch (error) {
    console.error('Error executing SQL query:', error)
    throw error
  }
}

async function searchFlights (origin, destination, date) {
  try {
    const query = `
        WITH FilteredFlights AS (
          SELECT flight_id
          FROM flights
          WHERE origin = $1 AND destination = $2
        ),
        FilteredFlightRecords AS (
          SELECT *
          FROM flight_records
          WHERE flight_id IN (SELECT flight_id FROM FilteredFlights) AND date = $3
        )
        SELECT f.*, fr.*
        FROM FilteredFlights AS sub_flight
        INNER JOIN FilteredFlightRecords AS sub_flight_records ON sub_flight.flight_id = sub_flight_records.flight_id
        INNER JOIN flights AS f ON f.flight_id = sub_flight.flight_id
        INNER JOIN flight_records AS fr ON fr.flight_record_id = sub_flight_records.flight_record_id;
      `

    const result = await db.query(query, [origin, destination, date])
    console.log(result.rows)
    return result.rows
  } catch (error) {
    console.error('Error executing SQL query:', error)
    throw error
  }
}

module.exports = router
