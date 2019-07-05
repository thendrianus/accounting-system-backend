const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/', controller.inventorydetailcategory_get)

module.exports = router

// hrd/inventorydetailcategory