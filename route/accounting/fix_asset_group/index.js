const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.fix_asset_group_post)
router.put('/', controller.fix_asset_group_put)
router.get('/search', controller.fix_asset_groupSearch_get)

module.exports = router

// accounting/fix_asset_group/search