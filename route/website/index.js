const express = require('express')
const router = express.Router()

router.use('/article', require('./article'))
router.use('/navigation', require('./navigation'))
router.use('/page', require('./page'))
router.use('/template', require('./template'))
router.use('/widget', require('./widget'))

module.exports = router