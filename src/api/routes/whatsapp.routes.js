const express = require('express');
const router = express.Router();
const WhatsappController = require('../controllers/whatsapp.controller');

router.get('/ping', (req, res) => {
  res.json({ success: true });
});

router.post('/webhook', WhatsappController.handleRequest);

module.exports = router;
