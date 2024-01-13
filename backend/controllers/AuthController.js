require('dotenv').config()

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

const { getAccessToken, getRefreshToken } = require('../helpers/tokenHelpers')


async function loginUser(req, res) {
    
    try {

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Authentication failed - User does not exist' });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Authentication failed - Invalid password' });
        }

        const accessToken = getAccessToken(user)
        const refreshToken = getRefreshToken(user)

        res.status(200).json({ 
            token: accessToken,
            refresh: refreshToken
        });

    } catch (error) {
        console.log({error})
        res.status(500).json({ error: 'loginUser: Server error' });

    }
}


async function refreshUser(req, res) {
    
    try {

        const { refresh, username } = req.body;

        if (refresh && username) {
            
            const user = await User.findOne({ username });
            
            if (!user) {
                return res.status(401).json({ error: 'Authentication failed - User does not exist' });
            }
    
            jwt.verify(refresh, REFRESH_SECRET, (err, user) => {

                if(err) return res.status(403).json({ error: 'Refresh Token is not valid' });

                const accessToken = getAccessToken(user)
                
                res.status(200).json({ 
                    token: accessToken,
                });
            })

        }

    } catch (error) {
        console.log({error})
        res.status(500).json({ error: 'refreshUser: Server error' });

    }
}

module.exports = { loginUser, refreshUser };