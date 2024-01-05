require('dotenv').config()
const path = require('path')

const apiEndpoint = (endpoint, extention, value='') => {

    const base = (process.env.NODE_ENV === 'development')
                ? process.env.BASE_URL_DEV
                : process.env.BASE_URL_PROD
    
    return path.join(base, endpoint, extention, value)

}

module.exports = {
    apiEndpoint
}