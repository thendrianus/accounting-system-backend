const express = require('express')
const router = express.Router()

router.use('/pos', require('./pos'))
router.use('/pos_session', require('./pos_session'))
router.use('/pos_stand', require('./pos_stand'))
router.use('/project', require('./project'))
router.use('/purchase', require('./purchase'))
router.use('/purchase_orders', require('./purchase_orders'))
router.use('/purchase_quotation', require('./purchase_quotation'))
router.use('/purchase_receive', require('./purchase_receive'))
router.use('/purchase_request', require('./purchase_request'))
router.use('/sale', require('./sale'))
router.use('/sale_delivery', require('./sale_delivery'))
router.use('/sale_delivery_order', require('./sale_delivery_order'))
router.use('/sale_orders', require('./sale_orders'))
router.use('/sale_quotation', require('./sale_quotation'))

module.exports = router