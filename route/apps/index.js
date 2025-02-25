const express = require('express')
const router = express.Router()

router.use('/applanguage', require('./applanguage'))
router.use('/branch', require('./branch'))
router.use('/brand', require('./brand'))
router.use('/businesspartnergroup', require('./businesspartnergroup'))
router.use('/componentgenerate', require('./componentgenerate'))
router.use('/currency', require('./currency'))
router.use('/employeebyjob', require('./employeebyjob'))
router.use('/employeejob', require('./employeejob'))
router.use('/inventory_group', require('./inventory_group'))
router.use('/inventorylabel', require('./inventorylabel'))
router.use('/isusechange', require('./isusechange'))
router.use('/language', require('./language'))
router.use('/login', require('./login'))
router.use('/permission', require('./permission'))
router.use('/report_template', require('./report_template'))
router.use('/tax', require('./tax'))
router.use('/uom', require('./uom'))
router.use('/warehouse', require('./warehouse'))

module.exports = router