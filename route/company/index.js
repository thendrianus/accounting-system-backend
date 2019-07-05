const express = require('express')
const router = express.Router()

router.use('/businesspartner', require('./businesspartner'))
router.use('/company', require('./company'))
router.use('/department', require('./department'))
router.use('/employee_account', require('./employee_account'))

module.exports = router