const bigPromise = require("../middlewares/bigPromise");
const fileUpload = require('express-fileupload')
const Product = require('../models/product');
const WhereClause = require("../utils/whereClause");
const cloudinary = require('cloudinary').v2
exports.testProduct = bigPromise(async(req, res) => {
    res.status(200).json({
        success: true,
        status: "success"
    })
})

exports.addProduct = bigPromise(async(req, res, next) => {
    let imageArray = []
    if (!req.files) {
        return req.status(401).send('Image is required')
    }
    if (req.files) {
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products"
            })
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }

    }
    req.body.photos = imageArray;
    req.body.user = req.user.id
    const product = await Product.create(req.body);
    res.status(200).json({
        success: true,
        product
    })

})

exports.getAllProduct = bigPromise(async(req, res, next) => {
    const resultperPage = 6;
    const totalCountProduct = await Product.countDocuments();


    const productsObj = new WhereClause(Product.find(), req.query).search().filter();

    let products = await productsObj.base

    const filterProductNumber = products.length

    productsObj.pager(resultperPage)
    products = await productsObj.base.clone()


    res.status(200).json({
        success: true,
        products,
        filterProductNumber,
        totalCountProduct
    })
})

exports.getOneProduct = bigPromise(async(req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return res.status(401).send('No product found with this id')
    }
    res.status(200).json({
        success: true,
        product
    })
})

exports.addReview = bigPromise(async(req, res, next) => {
    const { rating, comment, productId } = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    const product = await Product.findById(productId)

    const alreadyReview = await product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )
    if (alreadyReview) {
        product.reviews.forEach((review) => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment,
                    review.rating = rating
            }
        });
    } else {
        product.reviews.push(review)
        product.numberOfReviews = product.rev.length
    }

    // adjust rating
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    // save
    await product.save({
        validateBeforeSave: false
    })

    res.status(200).json({
        success: true
    })

})

exports.deleteReview = bigPromise(async(req, res, next) => {
    const { productId } = req.query;

    const product = await Product.findById(productId);

    const reviews = product.reviews.filter(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    const numberOfReviews = reviews.length


    // adjust rating
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length


    // update review
    await Product.findByIdAndUpdate(productId, {
        reviews,
        ratings,
        numberOfReviews
    }, {
        new: true,
        runValidators: true
    });

})

exports.getOnlyReviewsForOneProduct = bigPromise(async(req, res, next) => {
    const product = Product.findById(req.query.id)
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})



// admin
exports.adminGetallProduct = bigPromise(async(req, res, next) => {
    const products = await Product.find()
    if (!products) {
        res.status(400).send('No product found')
    }
    res.status(200).json({
        success: true,
        products
    })
})

exports.adminUpdateOneProduct = bigPromise(async(req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(401).send('Product not found')
    }
    let imageArray = []
    if (req.files) {
        // destroy image
        for (let index = 0; index < product.photos.length; index++) {
            const res = await cloudinary.uploader.destroy(product.photos[index].id)
        }
        for (let index = 0; index < product.length; index++) {
            const result = await cloudinary.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: 'products'
            });
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });
        }
    }
    req.body.photos = imageArray

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        product
    });

})

exports.adminDeleteOneProduct = bigPromise(async(req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(401).send('Product not found')
    }
    // rdestroy images
    for (let index = 0; index < product.photos.length; index++) {
        const res = await cloudinary.uploader.destroy(product.photos[index].id)
    }
    await product.remove()

    res.status(200).json({
        success: true,
        message: 'Product deleted'
    })
})