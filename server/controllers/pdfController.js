const { generateVectorPdf } = require('../utils/pdfGenerator');

/**
 * Controller to render vector PDF from HTML & CSS
 * POST /api/pdf/render
 */
const renderVectorPdf = async (req, res, next) => {
  try {
    const {
      html,
      styles,
      orientation = 'portrait',
      format = 'A4',
      margin,
      filename = 'Document.pdf',
    } = req.body;

    if (!html || typeof html !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'HTML content is required to render PDF',
      });
    }

    const pdfBuffer = await generateVectorPdf({
      html,
      styles,
      orientation,
      format,
      margin,
    });

    const safeFilename = encodeURIComponent(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (err) {
    console.error('Vector PDF rendering error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate vector PDF: ' + err.message,
    });
  }
};

module.exports = {
  renderVectorPdf,
};
