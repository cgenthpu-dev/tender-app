const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI =
  "mongodb+srv://projman:Projman%40123@cluster0.kzciazl.mongodb.net/project_management";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- SCHEMAS & MODELS ---

// 1. Category Schema
const CategorySchema = new mongoose.Schema({
  id: Number,
  name: { type: String, required: true },
  description: String,
});
const Category = mongoose.model("Category", CategorySchema);

// 2. Term Schema
const TermSchema = new mongoose.Schema({
  id: Number,
  categoryId: Number,
  title: { type: String, required: true },
  description: String,
});
const Term = mongoose.model("Term", TermSchema);

// 3. Tender Schema
const TenderSchema = new mongoose.Schema({
  id: Number,
  departmentName: String,
  departmentEmail: String,
  tenderInvitingAuthority: String,
  tenderCategory: String,
  tenderType: String,
  tenderName: String,
  tenderNo: String,
  estimatedCost: Number,
  itemQuantity: String,
  bidValidity: Number,
  emdRequired: String,
  pbgRequired: String,
  emdPledgeOfficer: String,
  bidStartDate: Date,
  bidEndDate: Date,
  publishDate: Date,
  offlineSubmissionDate: Date,
  techEvalDate: Date,
  isPreBidRequired: String,
  preBidDate: Date,
  selectedTermIds: [Number],
  createdAt: { type: Date, default: Date.now },
});
const Tender = mongoose.model("Tender", TenderSchema);

// --- ROUTES ---

// Get All Data (Dashboard Load)
app.get("/api/dashboard-data", async (req, res) => {
  try {
    const categories = await Category.find();
    const terms = await Term.find();
    const tenders = await Tender.find().sort({ createdAt: -1 });
    res.json({ categories, terms, tenders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- Categories --
app.post("/api/categories", async (req, res) => {
  try {
    const newCat = new Category({ ...req.body, id: Date.now() });
    await newCat.save();
    res.json(newCat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/categories/:id", async (req, res) => {
  try {
    await Category.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- Terms --
app.post("/api/terms", async (req, res) => {
  try {
    const newTerm = new Term({ ...req.body, id: Date.now() });
    await newTerm.save();
    res.json(newTerm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/terms/:id", async (req, res) => {
  try {
    await Term.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- Tenders --
app.post("/api/tenders", async (req, res) => {
  try {
    const newTender = new Tender({ ...req.body, id: Date.now() });
    await newTender.save();
    res.json(newTender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GENERATE DOCUMENT ENDPOINT ---
app.post("/api/generate-document/:id", async (req, res) => {
  try {
    console.log("Generating document for tender ID:", req.params.id);
    const tender = await Tender.findOne({ id: parseInt(req.params.id) });
    if (!tender) {
      return res
        .status(404)
        .json({ error: `Tender with id ${req.params.id} not found` });
    }

    // Use Puppeteer to render HTML and generate PDF with all styling
    const puppeteer = require("puppeteer");

    // Create the complete HTML
    const htmlContent = generateTenderHTML(tender);

    // Launch browser
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      printBackground: true,
    });

    await browser.close();

    // Send PDF with all styling preserved
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tender_${req.params.id}.pdf"`
    );
    res.send(pdfBuffer);
    console.log(
      "✅ Document generated successfully for tender:",
      req.params.id
    );
  } catch (error) {
    console.error("Document Generation Error:", error.message);
    console.error("Full error:", error);
    res
      .status(500)
      .json({ error: `Failed to generate document: ${error.message}` });
  }
});

// Helper function to generate HTML from tender data
function generateTenderHTML(tender) {
  const escapeHTML = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Montserrat', sans-serif; background: white; }
        
        @page { size: A4; margin: 10mm; }
        @media print { body { margin: 0; padding: 0; } }
        
        .page { 
            width: 210mm; 
            height: 297mm; 
            background: white;
            page-break-after: always;
            padding: 10mm;
            box-sizing: border-box;
            position: relative;
        }
        .page:last-child { page-break-after: avoid; }
        
        .border-outer { border: 1px solid #006400; padding: 1px; height: 100%; }
        .border-middle { border: 3px solid #006400; padding: 1px; height: 100%; }
        .border-inner { 
            border: 1px solid #006400; 
            padding: 32px;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .page-content { flex-grow: 1; }
        .page-footer {
            text-align: right;
            font-size: 10pt;
            font-weight: 600;
            padding-top: 10px;
            margin-top: auto;
        }
        
        .page-1-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            height: 100%;
        }
        
        h1 { font-size: 24pt; font-weight: 700; margin: 20px 0; color: #000; }
        h2 { font-size: 16pt; font-weight: 700; margin: 10px 0; color: #000; }
        h3 { font-size: 14pt; font-weight: 700; margin: 8px 0; color: #000; }
        
        .contact-info { margin-top: 40px; font-size: 11pt; }
        .contact-info p { margin: 5px 0; }
        
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
        th { background-color: #f0f0f0; font-weight: 700; }
        
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
        
        .instruction-text strong { font-weight: 700; }
        
        .note-box {
            border: 1px solid #ccc;
            padding: 10px;
            background-color: #f9f9f9;
            margin: 15px 0;
            font-size: 9pt;
            font-weight: 700;
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
                            <h3>"${escapeHTML(tender.departmentName)}"</h3>
                            
                            <div style="margin: 40px 0;">
                                <div style="width: 100px; height: 100px; background: #006400; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 36pt;">HPU</div>
                            </div>
                            
                            <h1>Bid Document for<br/>${escapeHTML(
                              tender.tenderName
                            )}<br/>for<br/>${escapeHTML(
    tender.departmentName
  )}</h1>
                            
                            <div class="contact-info">
                                <p><strong>Website:</strong> https://www.hpuniv.ac.in</p>
                                <p><strong>E-mail:</strong> ${escapeHTML(
                                  tender.departmentEmail
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
                                    <td>${escapeHTML(tender.tenderName)}</td>
                                </tr>
                                <tr>
                                    <td>2.</td>
                                    <td>Quantity</td>
                                    <td>${escapeHTML(tender.itemQuantity)}</td>
                                </tr>
                                <tr>
                                    <td>3.</td>
                                    <td>Department</td>
                                    <td>${escapeHTML(
                                      tender.departmentName
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
                                    <td>₹ ${escapeHTML(tender.emdRequired)}</td>
                                </tr>
                                <tr>
                                    <td>8.</td>
                                    <td>Performance Security</td>
                                    <td>₹ ${escapeHTML(tender.pbgRequired)}</td>
                                </tr>
                                <tr>
                                    <td>9.</td>
                                    <td>Pledge of EMD / PBG</td>
                                    <td>EMD and Performance Bank Guarantee (PBG) must be pledged only in the name of: <strong>${escapeHTML(
                                      tender.emdPledgeOfficer
                                    )}</strong></td>
                                </tr>
                                <tr>
                                    <td>10.</td>
                                    <td>Bid Validity</td>
                                    <td>${escapeHTML(
                                      String(tender.bidValidity)
                                    )} days from the date of publication of bid.</td>
                                </tr>
                            </tbody>
                        </table>

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
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
