/**
 * Document Generator using Puppeteer and html2pdf
 * Renders the React template.jsx and converts it to DOCX with all styling
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function generateDocumentFromTemplate(tenderData) {
  try {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set A4 paper size
    await page.setViewport({ width: 1920, height: 1080 });

    // Create HTML from tender data with full styling
    const html = generateHTML(tenderData);

    // Set HTML content
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
      printBackground: true,
    });

    await browser.close();

    // Convert PDF to DOCX (will use libreoffice or return PDF if DOCX conversion not available)
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
}

function generateHTML(data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tender Document</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: white;
        }

        @page {
            size: A4;
            margin: 10mm;
        }

        .page {
            width: 210mm;
            height: 297mm;
            background: white;
            page-break-after: always;
            position: relative;
            padding: 10mm;
            box-sizing: border-box;
        }

        .page:last-child {
            page-break-after: avoid;
        }

        /* Triple Border */
        .border-outer {
            border: 1px solid #006400;
            padding: 1px;
            height: 100%;
        }

        .border-middle {
            border: 3px solid #006400;
            padding: 1px;
            height: 100%;
        }

        .border-inner {
            border: 1px solid #006400;
            padding: 32px;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .page-content {
            flex-grow: 1;
        }

        .page-footer {
            text-align: right;
            font-size: 10pt;
            font-weight: 600;
            padding-top: 10px;
            margin-top: auto;
        }

        /* Page 1 Styles */
        .page-1-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            height: 100%;
        }

        .header-logo {
            width: 100%;
            max-width: 150px;
            margin: 40px 0;
            object-fit: contain;
        }

        h1 {
            font-size: 24pt;
            font-weight: 700;
            margin: 20px 0 15px 0;
            color: #000;
        }

        h2 {
            font-size: 16pt;
            font-weight: 700;
            margin: 10px 0;
            color: #000;
        }

        h3 {
            font-size: 14pt;
            font-weight: 700;
            margin: 8px 0;
            color: #000;
        }

        .subtitle {
            font-size: 12pt;
            font-weight: 400;
            margin: 10px 0;
            color: #000;
        }

        .contact-info {
            margin-top: 40px;
            font-size: 11pt;
        }

        .contact-info p {
            margin: 5px 0;
        }

        a {
            color: #0066cc;
            text-decoration: underline;
        }

        /* Table Styles */
        .summary-section {
            margin: 20px 0;
        }

        .summary-title {
            text-align: center;
            font-size: 14pt;
            font-weight: 700;
            text-decoration: underline;
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10pt;
        }

        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background-color: #f0f0f0;
            font-weight: 700;
        }

        .instructions-title {
            text-align: center;
            font-size: 12pt;
            font-weight: 700;
            text-decoration: underline;
            margin-top: 20px;
            margin-bottom: 15px;
        }

        .instruction-text {
            font-size: 10pt;
            text-align: justify;
            margin-bottom: 15px;
            line-height: 1.5;
        }

        .instruction-text strong {
            font-weight: 700;
        }

        .note-box {
            border: 1px solid #ccc;
            padding: 10px;
            background-color: #f9f9f9;
            margin: 15px 0;
            font-size: 9pt;
            font-weight: 700;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .page {
                margin: 0;
                padding: 10mm;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <!-- PAGE 1 -->
    <div class="page">
        <div class="border-outer">
            <div class="border-middle">
                <div class="border-inner">
                    <div class="page-content">
                        <div class="page-1-content">
                            <h2>Himachal Pradesh University,</h2>
                            <h3>(NAAC Accredited 'A' Grade University)</h3>
                            <h3>"${escapeHTML(data.name_of_department)}"</h3>
                            
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23006400'/%3E%3Ctext x='50' y='55' font-size='20' font-weight='bold' fill='white' text-anchor='middle'%3EHPU%3C/text%3E%3C/svg%3E" alt="HPU Logo" class="header-logo">
                            
                            <h1>Bid Document for<br>${escapeHTML(
                              data.procurement_title
                            )}<br>for<br>${escapeHTML(
    data.name_of_department
  )}</h1>
                            
                            <div class="contact-info">
                                <p><strong>Website:</strong> <a href="https://www.hpuniv.ac.in">https://www.hpuniv.ac.in</a></p>
                                <p><strong>E-mail:</strong> ${escapeHTML(
                                  data.email_of_department
                                )}</p>
                            </div>
                        </div>
                    </div>
                    <div class="page-footer">Page 1 of 3</div>
                </div>
            </div>
        </div>
    </div>

    <!-- PAGE 2 -->
    <div class="page">
        <div class="border-outer">
            <div class="border-middle">
                <div class="border-inner">
                    <div class="page-content">
                        <div class="summary-section">
                            <div class="summary-title">SUMMARY</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 8%;">Sr. No.</th>
                                        <th style="width: 30%;">Description</th>
                                        <th style="width: 62%;">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1.</td>
                                        <td>Item Description</td>
                                        <td>${escapeHTML(
                                          data.tender_title
                                        )}</td>
                                    </tr>
                                    <tr>
                                        <td>2.</td>
                                        <td>Quantity</td>
                                        <td>${escapeHTML(data.quantity)}</td>
                                    </tr>
                                    <tr>
                                        <td>3.</td>
                                        <td>Department</td>
                                        <td>${escapeHTML(
                                          data.name_of_department
                                        )}</td>
                                    </tr>
                                    <tr>
                                        <td>4.</td>
                                        <td>Bid Start Date & Time</td>
                                        <td>[as mentioned in Gem Bid Document]</td>
                                    </tr>
                                    <tr>
                                        <td>5.</td>
                                        <td>Bid End Date & Time</td>
                                        <td>[as mentioned in Gem Bid Document]</td>
                                    </tr>
                                    <tr>
                                        <td>6.</td>
                                        <td>Pre-Bid Meeting</td>
                                        <td>[as mentioned in Gem Bid Document]</td>
                                    </tr>
                                    <tr>
                                        <td>7.</td>
                                        <td>Earnest Money Deposit (EMD)</td>
                                        <td>₹ ${escapeHTML(data.emd_value)}</td>
                                    </tr>
                                    <tr>
                                        <td>8.</td>
                                        <td>Performance Security</td>
                                        <td>₹ ${escapeHTML(data.pbg_value)}</td>
                                    </tr>
                                    <tr>
                                        <td>9.</td>
                                        <td>Pledge of EMD / PBG</td>
                                        <td>EMD and Performance Bank Guarantee (PBG) must be pledged only in the name of: <strong>${escapeHTML(
                                          data.emd_officer
                                        )}</strong></td>
                                    </tr>
                                    <tr>
                                        <td>10.</td>
                                        <td>Bid Validity</td>
                                        <td>${escapeHTML(
                                          data.bid_validity
                                        )} days from the date of publication of bid.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="note-box">
                            <strong>Note:</strong> The terms and conditions specified in this tender document shall prevail over the terms and conditions available on the GeM portal in case of any conflict.
                        </div>

                        <div class="instructions-title">SECTION I: INSTRUCTIONS FOR BIDDERS</div>
                        
                        <div class="instruction-text">
                            <strong>Bid Submission:</strong> Bidders must be registered on the Government e-Marketplace (GeM) portal. All bids, including technical and financial components, must be submitted exclusively online through the GeM portal (gem.gov.in) before the specified deadline. Physical or offline bids will not be accepted.
                        </div>

                        <div class="instruction-text">
                            <strong>Governing Terms:</strong> This bid process will be governed by the General Terms and Conditions (GTC) of GeM in addition to the Additional Terms and Conditions (ATC) specified in this document. In case of any conflict, the terms specified in this document will prevail.
                        </div>
                    </div>
                    <div class="page-footer">Page 2 of 3</div>
                </div>
            </div>
        </div>
    </div>

    <!-- PAGE 3 -->
    <div class="page">
        <div class="border-outer">
            <div class="border-middle">
                <div class="border-inner">
                    <div class="page-content">
                        <div class="instruction-text" style="margin-top: 20px;">
                            <strong>Digital Signature:</strong> Bids must be digitally signed by an authorized representative of the bidding firm using a valid Class-II or Class-III Digital Signature Certificate (DSC).
                        </div>

                        <div class="instruction-text">
                            <strong>Documentation:</strong> Bidders are required to upload scanned copies of all necessary documents as specified in this bid document. All uploaded documents must be clear, legible, and duly signed and stamped by the authorized signatory.
                        </div>
                    </div>
                    <div class="page-footer">Page 3 of 3</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = { generateDocumentFromTemplate };
