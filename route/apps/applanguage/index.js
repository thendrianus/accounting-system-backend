const express = require('express')
const router = express.Router()
const controller = require('./controller')

  //NOT USED YET
  router.get('/', controller.language_get) //// Not in used by frontend

module.exports = router

// apps/applanguage