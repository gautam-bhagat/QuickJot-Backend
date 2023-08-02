const connectToMongo = require('./database-connection/connection')
connectToMongo();
const express = require('express');
const cors = require('cors')
const app = express()
app.use(cors())

const port = 5000

app.use(express.json())

// Available Routes
app.use('/home',require('./routes/home'))

// ALL AUTHENTICATION ENDPOINTS
app.use('/api/auth',require('./routes/auth'))

// ALL NOTES REQUEST
app.use('/api/notes',require('./routes/notes'))


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})