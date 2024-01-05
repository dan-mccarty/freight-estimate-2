require('dotenv').config()

const axios = require('axios')
const express = require('express')
const router = express.Router();


// GET - get all
router.get('/all', (req, res) => {
    // ...
    try {
        res.status(200).json({msg: 'SUCCESS'})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

// GET - get one
router.get('/one/:id', (req, res) => {
    const { id } = req.params

    try {
        res.status(200).json({ id })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

// POST - create one
router.post('/create', (req, res) => {
    const { username, password } = req.body

    try {
        res.status(200).json({username, password})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

// PATCH - update one
router.patch('/update/:username', (req, res) => {
    // const { password } = req.body

    try {
        res.status(200).json({newPassword: password})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

})



module.exports = router;