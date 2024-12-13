const { Pool } = require('pg')

console.log('ababbabab')
const pool = new Pool({
  user: 'yahyaahmedkhan',
  host: 'localhost', // Replace with your PostgreSQL server host
  database: 'khanairlines_db',
  // password: 'your_password',
  port: 5432 // Default PostgreSQL port
})

module.exports = pool
