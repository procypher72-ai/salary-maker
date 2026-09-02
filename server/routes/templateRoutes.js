const express = require('express');
const router = express.Router();
const { getTemplates, getTemplateByKey, updateTemplate } = require('../controllers/templateController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getTemplates);
router.get('/:templateKey', protect, getTemplateByKey);
router.put('/:templateKey', protect, updateTemplate);

module.exports = router;
