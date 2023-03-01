const User = require('../models/user');
const bigPromise = require('../middlewares/bigPromise')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

exports.isLoggedIn = bigPromise(async(req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.status(400).send('Please login to get access')
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decodedToken.id)
    next()
})

exports.customRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(400).send('Not allowed for this')
        }
        next();
    }

};