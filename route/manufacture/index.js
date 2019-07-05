const express = require('express')
const router = express.Router()

router.use('/bom', require('./bom'))
router.use('/conversion_cost', require('./conversion_cost'))
router.use('/material_release', require('./material_release'))
router.use('/product_result', require('./product_result'))
router.use('/standard_cost', require('./standard_cost'))
router.use('/standard_inventory', require('./standard_inventory'))
router.use('/work_order', require('./work_order'))

module.exports = router