const express = require('express');
const app = express()
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

//  middleware for handling req
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/"
}));

// ejs
app.set('view engine', 'ejs')


// morgan middleware
app.use(morgan("tiny"));



// importing routes
const homeRoute = require('./routes/home.route')

const userRoute = require('./routes/user.route')

// productRoute 
const productRoute = require('./routes/product.route');

// paymentRoute
const payment = require('./routes/payment.route');
// order route
const order = require('./routes/order.route')


// router middleware
app.use('/home', homeRoute)

app.use('/api/v1', userRoute)

app.use('/api/v1', productRoute)


app.use('/api/v1', payment)

app.use('/api/v1', order)



// export app
module.exports = app