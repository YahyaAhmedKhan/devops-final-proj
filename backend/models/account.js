/* eslint-disable no-useless-catch */
const db = require('../db') // Import the database connection

// Create a new account
const createAccount = async (email, password, balance) => {
  const query =
    'INSERT INTO accounts (email, password, balance) VALUES ($1, $2, $3) RETURNING *'
  const values = [email, password, balance]

  const { rows } = await db.query(query, values)
  return rows[0]
}

// Get an account by ID
const getAccountById = async (accountId) => {
  const query = 'SELECT * FROM accounts WHERE account_id = $1'
  const values = [accountId]

  const { rows } = await db.query(query, values)
  return rows[0]
}

// Update an account by ID
const updateAccountById = async (accountId, email, password, balance) => {
  const query =
    'UPDATE accounts SET email = $2, password = $3, balance = $4 WHERE account_id = $1 RETURNING *'
  const values = [accountId, email, password, balance]

  const { rows } = await db.query(query, values)
  return rows[0]
}

// Delete an account by ID
const deleteAccountById = async (accountId) => {
  const query = 'DELETE FROM accounts WHERE account_id = $1 RETURNING *'
  const values = [accountId]

  const { rows } = await db.query(query, values)
  return rows[0]
}

module.exports = {
  createAccount,
  getAccountById,
  updateAccountById,
  deleteAccountById
}
