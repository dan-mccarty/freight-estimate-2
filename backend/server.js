require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const { logger } = require('./middleware/logger')
const { errorHandler } = require('./middleware/errorHandler')

const corsOptions = require('./config/corsOptions')
const PORT = process.env.PORT || 4444
const MONGO_URI = process.env.MONGO_URI


// create express app
const app = express()


// === MIDDLEWARE ===

app.use(logger) // include logger
app.use(express.json()) // include body 
app.use(cors(corsOptions)) // INCLUDE cors 


// === ROUTES ===

// app.use('/', require('./routes/testRoutes.js'))
app.use('/api/unleashed', require('./routes/unleashedRoutes.js'))
app.use('/api/freightmate', require('./routes/freightmateRoutes.js'))
// app.use('/PATH/__', require('./routes/__Routes.js'))
// app.use('/PATH/__', require('./routes/__Routes.js'))

// serve build bundle in production
if (process.env.NODE_ENV !== 'development') {
    const __dirname = path.resolve()
    app.use(express.static(path.join(__dirname, 'frontend/dist')))
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html')))
}


// === FINAL MIDDLEWARE ===

// error handling middleware
app.use(errorHandler)


// === LISTENER ===

app.listen(PORT, () => {
    console.log(`...Listening on port ${PORT}.`)
})


// === DATABASE ===

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('...Connected to db.')
        })
        .catch((error) => {
            console.log({ error })
        })
} else {
    // ...
}
