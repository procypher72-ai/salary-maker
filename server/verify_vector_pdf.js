const fs = require('fs');
const path = require('path');

const run = async () => {
  try {
    console.log('Testing live API endpoint: POST http://localhost:5000/api/pdf/render ...');

    const sampleHtml = `
      <div style="font-family: Arial, sans-serif; padding: 24px; border: 2px solid #333;">
        <h1 style="color: #1e3a8a;">AIIMS NEW DELHI - SALARY SLIP</h1>
        <p><strong>Employee Name:</strong> Rajesh Kumar</p>
        <p><strong>Designation:</strong> Senior Nursing Officer</p>
        <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; margin-top: 16px;">
          <tr style="background: #f1f5f9;">
            <th>Earning Head</th>
            <th>Amount (INR)</th>
          </tr>
          <tr>
            <td>Basic Pay</td>
            <td>56,100.00</td>
          </tr>
          <tr>
            <td>Dearness Allowance (DA)</td>
            <td>28,050.00</td>
          </tr>
          <tr style="font-weight: bold; background: #e2e8f0;">
            <td>Total Gross Pay</td>
            <td>84,150.00</td>
          </tr>
        </table>
      </div>
    `;

    const res = await fetch('http://localhost:5000/api/pdf/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: sampleHtml,
        orientation: 'portrait',
        format: 'A4',
        filename: 'LiveVerifySlip.pdf',
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    console.log('✅ Received PDF stream from server. Buffer size:', buffer.length, 'bytes');

    const outputPath = path.join(__dirname, 'verified_vector_sample.pdf');
    fs.writeFileSync(outputPath, buffer);
    console.log('✅ Successfully wrote verified PDF to:', outputPath);
    console.log('✅ Content-Type header:', res.headers.get('content-type'));
    console.log('✅ Content-Disposition header:', res.headers.get('content-disposition'));
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
};

run();
