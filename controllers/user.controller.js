const User = require('../models/user');
const bigPromise = require('../middlewares/bigPromise')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary').v2
const crypto = require('crypto');


// cookieToken
const cookieToken = require('../utils/cookieToken');

// email
const sendemail = require('../utils/sendemail')



exports.signup = bigPromise(async(req, res, next) => {
    if (!req.files) {
        return res.status(400).send('photo is required')
            // return next(new CustomError("photo is required", 400));
    }

    let result;
    if (req.files) {
        let file = req.files.photo
        result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "FOOD-SANTA",
            width: 150,
            crop: "scale"
        })
    }


    const { name, email, password } = req.body
    if (!(email || name || password)) {
        return next(new CustomError('Please send email', 400))
    }

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    })
    cookieToken(user, res)
})


exports.login = bigPromise(async(req, res) => {
    const { email, password } = req.body;
    // email and password prensence check
    if (!(email || password)) {
        return res.status(400).send('emailId and passsword is required')
            // return next(new CustomError("emailId and passsword is required", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(400).send('User not registered')
            // return next(new CustomError("user not registered", 400));
    }

    // matching the password
    const isPasswordCorrect = await user.IsValidatedPassword(password)

    if (!isPasswordCorrect) {
        res.status(400).send(' passsword does not matched🤨')
            // return next(new CustomError("Password does not matched🤨", 400))
    }

    cookieToken(user, res)
})


exports.logout = bigPromise(async(req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "logout success"
    })
})


exports.forgotPassword = bigPromise(async(req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).send('email is required!')
    }
    const user = await User.findOne({ email })
    const forgotToken = user.getForgetPasswordToken()

    // saving forgotToken into database  without validating all field
    await user.save({ validateBeforeSave: false })

    const forgotURL = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

    const message = `copy paste this link in the url and hit enter \n \n ${forgotURL}`
    try {
        await sendemail({
            email: email,
            subject: 'Password reset link ',
            message
        })
        res.status(200).json({
            status: "success",
            message: "email send successfully"
        })


    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        const forgotToken = user.getForgetPasswordToken()

        // saving into database  without validating all field
        await user.save({ validateBeforeSave: false })
        return res.status(500).send(error)
            // return next(new CustomError(error.message, 500))

    }
})


exports.passwordReset = bigPromise(async(req, res) => {
    const token = req.params.token
    const encryptToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ encryptToken, forgotPasswordExpiry: { $gt: Date.now() } })
    if (!user) {
        return res.status(400).send('token is invalid or expired')
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).send('password and confirm password doest match')
    }
    user.password = req.body.password;

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save()

    cookieToken(user, res)
});

exports.getLoggedInUserDetails = bigPromise(async(req, res) => {

    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})

exports.changePassword = bigPromise(async(req, res) => {
    password = req.body.password
    oldPassword = req.body.oldPassword
    const userId = req.user.id
    const user = await User.findById(userId).select("+password")
    if (!user) {
        res.status(400).send('user not found')
    }

    const isPasswordCorrect = await user.IsValidatedPassword(oldPassword);

    if (!isPasswordCorrect) {
        res.status(400).send('incorrect current password')
    }
    user.password = password
    await user.save()
    cookieToken(user, res)
})

exports.updateUserDetails = bigPromise(async(req, res) => {
    if (!(req.body.name || req.body.email)) {
        res.status(400).send('Please enter email and name')
    }
    const userId = req.user.id;
    const data = { name: req.body.name, email: req.body.email };
    if (req.files) {
        const user = User.findById(userId)
        const imageId = user.photo.id
        const respo = await cloudinary.uploader.destroy(imageId);
        const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
            folder: "FOOD-SANTA",
            width: 150,
            crop: "scale"
        })
        data.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(userId, data, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        success: true,
        user
    })
})

exports.adminAllUser = bigPromise(async(req, res) => {
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})

exports.adminGetSingleUser = bigPromise(async(req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(400).send('User not found')
    }
    res.status(200).json({
        success: true,
        user
    })

})

exports.adminUpdateOneUser = bigPromise(async(req, res) => {

    const data = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };
    const user = await User.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        success: true,
    });
})

exports.adminDeleteOneUser = bigPromise(async(req, res) => {

    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(401).send('No user found')
    }
    const imageId = user.photo.id
    await cloudinary.uploader.destroy(imageId);
    await user.remove()

    res.status(200).json({
        success: true
    })

})

// manager
exports.managerAllUser = bigPromise(async(req, res) => {
    const users = await User.find({ role: 'user' });
    res.status(200).json({
        success: true,
        users
    })
})