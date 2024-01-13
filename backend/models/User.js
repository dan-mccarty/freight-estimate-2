const mongoose = require('mongoose')
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String, //  'sales' || 'warehouse' 
        required: false,
        default: 'sales'
    },
    active: {
        type: Boolean,
        required: false,
        default: true
    }
})

// Hash the user's password before saving it
userSchema.pre('save', async function (next) {
    
    // "this" refers to the current user instance 
    const user = this; 

    if (!user.isModified('password')) return next();

    const rounds = 10
    const salt = await bcrypt.genSalt(rounds);
    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash;
    next();
});

// Compare user's entered password with the stored hash
userSchema.methods.comparePassword = async function (password) {
    // "this" refers to the current user instance 
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;