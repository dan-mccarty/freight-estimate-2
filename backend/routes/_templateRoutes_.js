require('dotenv').config()

const axios = require('axios')
const express = require('express')
const router = express.Router();


// GET - get all
router.get('/PATH', (req, res) => {
    // ...
})

// GET - get one
router.get('/PATH/:__', (req, res) => {
    // const { __ } = req.params
    // ...
})

// POST - create one
router.post('/PATH', (req, res) => {
    // const { __ } = req.body
    
    // ...
    try {
        // ...
        res.status(200).json()
    } catch (error) {
        // ...
        res.status(400).json({error: error.message})
    }
})

// PATCH - update one
router.patch('/PATH', (req, res) => {
    // const { __ } = req.body

    // ...
    try {
        // ...
        res.status(200).json()
    } catch (error) {
        // ...
        res.status(400).json({error: error.message})
    }
    
})

// PUT - replace one
router.put('/', (req, res) => {
    // const { __ } = req.body

    // ...
    try {
        // ...
        res.status(200).json()
    } catch (error) {
        // ...
        res.status(400).json({error: error.message})
    }})


// DELETE - delete one
router.put('/', (req, res) => {
    // const { __ } = req.body

    // ...
    try {
        // ...
        res.status(200).json()
    } catch (error) {
        // ...
        res.status(400).json({error: error.message})
    }})



module.exports = router;