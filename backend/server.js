require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

// authorization / authentication
// const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken')


const { logger } = require('./middleware/logger')
const { errorHandler } = require('./middleware/errorHandler')
const authenticateToken = require('./middleware/authenticateToken.js')
// const { authenticateToken } = require('./middleware/auth.js') 

const corsOptions = require('./config/corsOptions')

// create express app
const app = express()


// === MIDDLEWARE ===
app.use(logger) // include logger
app.use(express.json()) // include body 
app.use(cors(corsOptions)) // INCLUDE cors 


// === ROUTES ===
// Apply the authentication middleware to protect routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/unleashed', require('./routes/unleashedRoutes.js'))
app.use('/api/freightmate', require('./routes/freightmateRoutes.js'))


const posts = [
    { 
        username: 'daniel',
        title: 'Post 1',
        role: 'sales'
    },{ 
        username: 'eric',
        title: 'Post 2',
        role: 'warehouse'
    },{ 
        username: 'eric',
        title: 'Post 3',
        role: 'sales'
    },{ 
        username: 'daniel',
        title: 'Post 4',
        role: 'warehouse'
    }
]

app.get('/posts/all', authenticateToken, (req, res) => {
    console.log('GET /posts/all')
    res.status(200).json(posts)
})

app.get('/posts', authenticateToken, (req, res) => {
    console.log('GET /posts')
    
    const user = req.user
    console.log({user})
    
    const {username} = req.user
    console.log({username})

    res.status(200).json(posts.filter(post => post.username === username))
})

app.get('/posts/role', authenticateToken, (req, res) => {
    console.log('GET /posts')
    
    const user = req.user
    console.log({user})
    
    const {role} = req.user
    console.log({role})

    res.status(200).json(posts.filter(post => post.role === role))
})

// serve build bundle in production ... DONT THINK THIS IS REQUIRED AS NGINX DOES THIS
// if (process.env.NODE_ENV !== 'development') {
//     const __dirname = path.resolve()
//     app.use(express.static(path.join(__dirname, 'frontend/dist')))
//     app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html')))
// }



// === FINAL MIDDLEWARE ===
// error handling middleware
app.use(errorHandler)



// === DATABASE ===
const PORT = process.env.PORT || 4444
const MONGO_URI = process.env.MONGO_URI


if (MONGO_URI) {
    console.log('...Trying to connect to db.')

    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('...Connected to db.')
            app.listen(PORT, console.log(`...Listening on port ${PORT}.`))
        })
        .catch((error) => console.log({ error }))
} else {
    app.listen(PORT, console.log(`...Listening on port ${PORT}.`))
}
