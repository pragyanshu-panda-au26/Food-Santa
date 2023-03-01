const express = require('express')
const router = express.Router()
const { sendStripeKey, captureStripePayment, sendRazorpayKey, captureRazorpayPayment } = require('../controllers/payment.controller')
const { isLoggedIn, customRole } = require('../middlewares/user')

router.route('/stripekey').get(isLoggedIn, sendStripeKey);
router.route('/razopaykey').get(isLoggedIn, sendRazorpayKey);

// payment process

router.route('/capturestripe').post(isLoggedIn, captureStripePayment)
router.route('/capturerazorpay').post(isLoggedIn, captureRazorpayPayment)





module.exports = router