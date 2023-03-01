const app = require('./app')
require('dotenv').config();
const connectWithDb = require('./config/db')
const cloudinary = require('cloudinary').v2;

connectWithDb()

// cloudinary config
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.Api_Key,
    api_secret: process.env.Api_Secret,
    secure: true
});


app.listen(process.env.PORT, () => console.log('sever up at port:', process.env.PORT))