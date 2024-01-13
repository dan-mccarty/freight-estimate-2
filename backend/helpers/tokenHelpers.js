require('dotenv').config()

const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY // '1m'
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY // '8h'

const createSignableUser = (user) => {
    return {
        id: user._id || user.id, 
        username: user.username,
        role: user.role 
    } 
}

const getAccessToken = (user) => jwt.sign(createSignableUser(user), ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
const getRefreshToken = (user) => jwt.sign(createSignableUser(user), REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });


module.exports = {
    getAccessToken,
    getRefreshToken
}