const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.businesspartner_post)
router.put('/', controller.businesspartner_put)
router.post('/address', controller.businesspartneraddress_post)
router.put('/address', controller.businesspartneraddress_put)
router.post('/addresslist', controller.businesspartneraddresslist_post)
router.post('/contact', controller.businesspartnercontact_post)
router.put('/contact', controller.businesspartnercontact_put)
router.post('/contactlist', controller.businesspartnercontactlist_post)
router.post('/select', controller.businesspartnerselect_post)

module.exports = router

// company/businesspartner