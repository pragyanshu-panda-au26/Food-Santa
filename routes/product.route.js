const express = require('express')
const router = express.Router()
const { testProduct, addProduct, getAllProduct, adminGetallProduct, getOneProduct, adminUpdateOneProduct, adminDeleteOneProduct, addReview, deleteReview, getOnlyReviewsForOneProduct } = require('../controllers/product.controller')
const { isLoggedIn, customRole } = require('../middlewares/user')
router.route('/productdummy').get(testProduct)

// user route
router.route('/products').get(getAllProduct);
router.route('/product/:id').get(getOneProduct);

router.route('/review').put(isLoggedIn, addReview);
router.route('/review').delete(isLoggedIn, deleteReview);
router.route('/reviews').get(getOnlyReviewsForOneProduct);


// admin route
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);

router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetallProduct);

router.route('/admin/product/:id').put(isLoggedIn, customRole('admin'), adminUpdateOneProduct)

router.route('/admin/product/:id').delete(isLoggedIn, customRole('admin'), adminDeleteOneProduct)

module.exports = router