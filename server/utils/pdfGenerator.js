const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

// Find a usable Chrome or Edge executable on the host system
const getExecutablePath = () => {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const potentialPaths = [
    // Windows Chrome
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    // Windows Edge
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];

  for (const p of potentialPaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error('No Chrome or Edge installation found on this system. Please install Google Chrome or Microsoft Edge.');
};

/**
 * Generates a native vector PDF with real selectable and editable text.
 * @param {object} params
 * @param {string} params.html - Full HTML string or inner snippet
 * @param {string} [params.styles] - Additional CSS style rules to inject
 * @param {string} [params.orientation='portrait'] - 'portrait' or 'landscape'
 * @param {string} [params.format='A4'] - Page format (e.g. 'A4')
 * @param {object} [params.margin] - Margins e.g. { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' }
 * @returns {Promise<Buffer>} PDF Buffer
 */
const generateVectorPdf = async ({
  html,
  styles = '',
  orientation = 'portrait',
  format = 'A4',
  margin = { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
}) => {
  const executablePath = getExecutablePath();

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=medium',
    ],
  });

  try {
    const page = await browser.newPage();

    // Wrap in full HTML document if not already wrapped
    let fullHtml = html;
    if (!html.includes('<html') && !html.includes('<!DOCTYPE html>')) {
      fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Salary Maker Export</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap');
    
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* Print hygiene */
    .no-print, .preview-template-toolbar, .logo-size-pill, .logo-resize-drag-handle, 
    .logo-move-pin, .btn-remove-earning, .btn-remove-deduction, .btn-add-line, 
    .btn-toggle-expand, .mobile-scroll-hint {
      display: none !important;
    }

    ${styles}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
    }

    await page.setContent(fullHtml, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000,
    });

    const isLandscape = orientation === 'landscape';

    const pdfBuffer = await page.pdf({
      format: format || 'A4',
      landscape: isLandscape,
      printBackground: true,
      margin: margin || { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
      preferCSSPageSize: false,
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

module.exports = {
  getExecutablePath,
  generateVectorPdf,
};
