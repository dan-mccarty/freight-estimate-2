require('dotenv').config()

const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const { getAccessToken } = require('../helpers/tokenHelpers')




function authenticateToken(req, res, next) {

    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ error: 'Authentication failed - No token' });

    
    jwt.verify(token, ACCESS_SECRET, (err, user) => {
        // if we cannot verify access token
        if (err) {
            
            // console.log('invalid access token, trying refresh')
            // const { refresh } = req.user
            // // check if we have a refresh token
            // if (refresh) {
            //     console.log('refresh token found')
            //     // verify refresh token
            //     jwt.verify(refresh, REFRESH_SECRET, (err, user) => {
            //         // return if theres an error
            //         if (err) {
            //             console.log('invalid refresh token')
            //             return res.status(403).json({ error: 'Refresh Token is not valid' });
            //         }
            //         // else update token && continue
            //         const newToken = getAccessToken(user)
            //         req.user.token = newToken
            //         console.log('access token updated')
            //         next();
            //     })
            // }
            // console.log('No refresh token - request rejected')

            // return invalid token if we have not already done so ... this is probably irrelivant
            return res.status(403).json({ error: 'Token is not valid' });
        }


        console.log('Valid access token')

        // valid access token, lets continue.
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;