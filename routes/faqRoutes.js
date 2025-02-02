const express = require('express');
const faqController = require('../controllers/faqController');
const router = express.Router();

router.post('/faqs', faqController.createFAQ);
router.get('/faqs', faqController.getFAQs);

module.exports = router;