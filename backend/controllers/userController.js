const User = require('../models/User');



async function registerUser(req, res) {

    try {

        const { username, password, role } = req.body;
        const user = new User({ username, password, role });

        await user.save();

        res.status(201).json({ user, message: 'User registered successfully' });

    } catch (error) {
        console.log('registerUser:', error)
        res.status(500).json({ error: 'Registration failed' });

    }
}


module.exports = { registerUser };