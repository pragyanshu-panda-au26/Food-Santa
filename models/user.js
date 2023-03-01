const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config()
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [40, 'Name should be under 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        validate: [validator.isEmail, 'Please enter correct email'],
        unique: true
    },
    phoneNo: {
        type: Number,
        default: null
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password should be atleast 6 char'],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String,

        },
        secure_url: {
            type: String,

        }

    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})



// encrypting the password if it changes
userSchema.pre('save', async function(next) {
    // if it is not modified don't encrypt password
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// validadate the password with passed on user password
userSchema.methods.IsValidatedPassword = async function(userPassword) {
    return await bcrypt.compare(userPassword, this.password)

};

// create and return jwt token
userSchema.methods.getJwtToken = async function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY })
}



// generate forget password token string
userSchema.methods.getForgetPasswordToken = function() {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString('hex');

    // getting a hash
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex')

    //time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;
    return forgotToken;
}


module.exports = mongoose.model('user', userSchema)