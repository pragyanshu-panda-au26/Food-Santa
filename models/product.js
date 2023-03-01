const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide product name'],
        trim: true,
        maxlength: [120, 'Product name should not be more than 120 char']
    },
    price: {
        type: Number,
        required: [true, 'please provide product price'],
        maxlength: [6, 'Product price should not be more than 6 digit']
    },
    description: {
        type: String,
        required: true
    },
    photos: [{
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    }],
    category: {
        type: String,
        required: [true, 'Please select category'],
        enum: {
            values: [
                'NorthIndian',
                'SouthIndian',
                'FastFood',
                'Diet',

            ],
            message: 'Plase select Category from NorthIndian, SouthIndian, FastFood,Diet'
        },
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    }],
    brand: {
        type: String,
        required: [true, 'Please add a brand']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema)