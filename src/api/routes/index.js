const express = require('express');
const router = express.Router();

const WhatsappRoute = require('./whatsapp.routes');
const CronjobRoute = require('./cronjob.routes');


router.use('/whatsapp', WhatsappRoute);
router.use('/cronjob', CronjobRoute);

module.exports = router;