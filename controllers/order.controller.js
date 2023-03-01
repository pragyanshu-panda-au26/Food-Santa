const Order = require('../models/order');
const Product = require('../models/product');
const bigPromise = require("../middlewares/bigPromise");

exports.createOrder = bigPromise(async(req, res, next) => {
    const { shippingInfo, orderItems, paymentInfo, taxAmount, shippingAmount, totalAmount } = req.body
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })

})

exports.getOneOrder = bigPromise(async(req, res, next) => {
    const order = await Order.findById(req.params.id) //.populate({ path: 'user', select: 'name' })
    if (!order) {
        return res.status(400).send('incorrect Order Id')
    }
    res.status(200).json({
        success: true,
        order
    })
})

exports.getLoggedInOrders = bigPromise(async(req, res, next) => {
    const order = await Order.find({ user: req.user._id })
    if (!order) {
        return res.status(401).send('Please check Order Id')
    }
    res.status(200).json({
        success: true,
        order
    });
})


// admmin
exports.adminGetAllOrders = bigPromise(async(req, res, next) => {
    const orders = await Order.find();

    res.status(200).json({
        success: true,
        orders
    });
});

exports.adminUpdateOrder = bigPromise(async(req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (order.orderStatus === 'Delivered') {
        return res.status(401).send('Already delivered')
    }
    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async prod => {
        await updateProductStock(prod.product, prod.quantity);
    });

    await order.save();

    res.status(200).json({
        success: true,
        order
    });

})

async function updateProductStock(productId, quantity) {
    const product = await Product.findById(productId)
    product.stock = product.stock - quantity
    await product.save({ validateBeforeSave: false })
}

exports.adminDeleteOrder = bigPromise(async(req, res, next) => {
    const order = await Order.findById(req.params.id);

    await order.remove();

    res.status(200).json({
        success: true,
    })
})