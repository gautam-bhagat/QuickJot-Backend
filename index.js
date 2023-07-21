const connectToMongo = require('./database-connection/connection')
connectToMongo();
const express = require('express');

const app = express()

const port = 5000

app.use(express.json())

// Available Routes
app.use('/home',require('./routes/home'))

app.use('/api/auth/createuser',require('./routes/createuser'))

app.use('/api/v1/notes',require('./routes/notes-route'))


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})