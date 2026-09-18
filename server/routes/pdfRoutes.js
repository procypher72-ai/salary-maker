const express = require('express');
const router = express.Router();
const { renderVectorPdf } = require('../controllers/pdfController');

router.post('/render', renderVectorPdf);

module.exports = router;
