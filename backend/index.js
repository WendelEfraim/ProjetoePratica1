const express = require('express')
const cors = require('cors')
const app = express()

//conectando com o banco
const conn = require('./db/conn')
const User = require('./model/User')

// Config JSON response
app.use(express.json())

// Salve CORS
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}))

// Routes
const userRoutes = require('./routes/UserRoutes')

app.use('/users',userRoutes)

app.listen('5000')

