const express = require('express');
const router = express.Router();
const User = require('../models/User');


const authenticateToken = require('../middleware/authenticateToken');

const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');

// User registration
router.post('/register', UserController.registerUser);

// User login
router.post('/login', AuthController.loginUser);

// User refresh
router.post('/refresh', AuthController.refreshUser);


// Protected route example
router.get('/protected', authenticateToken, (req, res) => {
    // Your protected route logic here
    res.json({ message: 'This is a protected route' });
});


router.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).send(users)
    } catch (error) {
        console.log('/auth/users', { error })
        res.status(500).send({ error })
    }

})

router.get('/users/delete/all', authenticateToken, async (req, res) => {
    try {

        let users = await User.find({});

        users.forEach(async (user) => {
            let deletedUser = await User.findByIdAndDelete(user._id)
            console.log({ deletedUser })
        })

        users = await User.find({}); // users should now = []
        res.status(200).send(users)

    } catch (error) {
        console.log('/auth/users/delete/all', { error })
        res.status(500).send({ error })
    }

})


module.exports = router;