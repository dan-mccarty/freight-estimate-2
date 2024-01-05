const User = require('../models/User')
const mongoose = require('mongoose')

// get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ username: -1 })
        res.status(200).json(users)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// read user password
const getUser = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: 'Invalid id.' })
    }

    const user = await User.findById(id)

    if (!user) {
        return res.status(404).json({ error: 'No such user.' })
    }

    res.status(200).json(user)
}

// create new user
const createUser = async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await User.create({ username, password })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// update user password
const updateUser = async (req, res) => {
    const { id } = req.params
    // const {username, password} = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: 'Invalid id.' })
    }

    const user = await User.findByIdAndUpdate({ _id: id }, { ...req.body })

    if (!user) {
        return res.status(400).json({ error: 'No such user.' })
    }

    res.status(200).json(user)
}


// delete user
const deleteUser = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: 'Invalid id.' })
    }

    const user = await User.findByIdAndDelete({ _id: id })

    if (!user) {
        return res.status(404).json({ error: 'No such user.' })
    }

    res.status(200).json(user)
}



module.exports = {
    getAllUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
}