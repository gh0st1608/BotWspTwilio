const express = require('express');
const router = express.Router();
const CronjobController = require('../controllers/cronjob.controller');

router.get('/cronjob', CronjobController.handleCron);

module.exports = router;
