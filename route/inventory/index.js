const express = require('express')
const router = express.Router()

router.use('/inventory', require('./inventory'))
router.use('/inventorydetailcategory', require('./inventorydetailcategory'))

module.exports = router