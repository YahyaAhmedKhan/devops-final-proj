const express = require('express')
const router = express.Router()
const db = require('../db') // Adjust the path as necessary

// Route to get all accounts
router.get('/getall', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM accounts') // Replace 'accounts' with your actual table name
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
})

// Route to get a single account by ID
router.get('/:id', async (req, res) => {
  try {
    const accountId = req.params.id
    const account = await db.query(
      'SELECT * FROM accounts WHERE account_id = $1',
      [accountId]
    )
    res.json(account.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
})

// Route to create a new account
router.post('/', async (req, res) => {
  try {
    console.log(req.body)
    const { email, password } = req.body
    const newAccount = await db.query(
      'INSERT INTO accounts (email, password) VALUES ($1, $2) RETURNING *',
      [email, password]
    )
    res.json(newAccount.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
})

// Route to update an existing account
router.put('/:id', async (req, res) => {
  try {
    const accountId = req.params.id
    const { email, password, balance } = req.body
    const updatedAccount = await db.query(
      'UPDATE accounts SET email = $1, password = $2, balance = $3 WHERE account_id = $4 RETURNING *',
      [email, password, balance, accountId]
    )
    res.json(updatedAccount.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
})

// Route to delete an account
router.delete('/:id', async (req, res) => {
  try {
    const accountId = req.params.id
    const deletedAccount = await db.query(
      'DELETE FROM accounts WHERE account_id = $1 RETURNING *',
      [accountId]
    )
    res.json(deletedAccount.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).send('Server Error')
  }
})

module.exports = router
