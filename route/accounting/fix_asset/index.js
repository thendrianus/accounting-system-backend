const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.fix_asset_post)
router.get('/search2', controller.fix_assetSearch2_get)
router.get('/search', controller.fix_assetSearch_get)
router.get('/options', controller.getFix_assetOptions_get)

module.exports = router

// accounting/fix_asset/options