const mongoose = require('mongoose')

const __ = new mongoose.Schema({
    field1: {
        type: String,
        required: true
    },
    field2: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('TEMPLATE_NAME', __)