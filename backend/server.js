const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')

const morgan = require('morgan')
const config = require('./config')
const routes = require('./routes')

app.use(cookieParser())
app.use(express.json())
app.use(cors())

// Define a port

app.use(morgan('dev'))

// A simple middleware that logs the request method and URL
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next() // Pass the request to the next middleware/function
})

// const accountRoutes = require("./routes/accounts.js");

// Use routes
// app.use("/accounts", accountRoutes);
app.use(routes)

// Define a simple route
app.get('/', (req, res) => {
  // res.cookie('test')
  res.send('Hello, World!')
})

app.get('/version', (req, res) => {
  // res.cookie('test')
  res.send('1.0.0')
})

// Start the server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} link : http://localhost:5001`)
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send(parseStackTrace(err.stack))
})

// function parseStackTrace (stackTrace) {
//   // Split the input string into lines
//   const lines = stackTrace.split(/\s+at\s+/)

//   // Format each line for better readability
//   const formattedLines = lines.map((line, index) => {
//     if (index === 0) {
//       // Format the actual error message to make it stand out
//       return '!!! ERROR: ' + line.toUpperCase() + ' !!!\n'
//     } else {
//       // Format the stack trace
//       return '  at ' + line.trim() + '\n'
//     }
//   })

//   // Join the formatted lines back into a single string, with an extra line between each entry
//   return formattedLines.join('\n')
// }

function parseStackTrace (stackTrace) {
  const lines = stackTrace.split(/\s+at\s+/)
  let firstUserCodeLine = ''
  let lastUserCodeLine = ''
  let foundUserCode = false

  const userCodeLines = lines.filter(line => {
    if (!line.includes('node_modules')) {
      lastUserCodeLine = line
      if (!foundUserCode) {
        firstUserCodeLine = line
        foundUserCode = true
      }
      return true
    }
    return false
  })

  const formattedLines = lines.map((line, index) => {
    if (index === 0) {
      return '!!! ERROR: ' + line.toUpperCase() + ' !!!\n'
    } else {
      return '  at ' + line.trim() + '\n'
    }
  })

  return 'First Point of Error in Your Code:\n' + firstUserCodeLine + '\n\n' +
         'Last Point of Error in Your Code:\n' + lastUserCodeLine + '\n\n' +
         'Full Stack Trace:\n' + formattedLines.join('\n')
}
