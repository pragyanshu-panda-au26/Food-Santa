const { home } = require('../controllers/home.controller')
const express = require('express')
const router = express.Router()

router.route('/').get(home)



module.exports = router;