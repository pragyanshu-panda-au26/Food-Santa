const mongoose = require('mongoose');
require('dotenv').config();

const connectWithDb = () => {
    mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(console.log('db connected'))
        .catch(error => {
            console.log('error in connecting db');
            console.log(error)
            process.exit(1)
        })

}

module.exports = connectWithDb