#!/usr/bin/env node
/**
 * Script to create a proper DOCX template for tender documents
 * Creates a minimal but valid DOCX with unsplit template tags
 * Run with: node create-template.js
 */

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

// Ensure templates directory exists
const templatesDir = path.join(__dirname, "templates");
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Create the DOCX with proper XML structure (avoiding split tags)
async function createTemplate() {
  try {
    const zip = new JSZip();

    // 1. Create [Content_Types].xml
    zip.file(
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
    );

    // 2. Create _rels/.rels
    zip.file(
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    );

    // 3. Create word/document.xml with template variables (all tags in single text runs to avoid splitting)
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>
<w:p><w:r><w:t>TENDER DOCUMENT</w:t></w:r></w:p>
<w:p><w:r><w:t>Department Name: {{name_of_department}}</w:t></w:r></w:p>
<w:p><w:r><w:t>Department Email: {{email_of_department}}</w:t></w:r></w:p>
<w:p><w:r><w:t>PROCUREMENT DETAILS</w:t></w:r></w:p>
<w:p><w:r><w:t>Procurement Title: {{procurement_title}}</w:t></w:r></w:p>
<w:p><w:r><w:t>Tender Title: {{tender_title}}</w:t></w:r></w:p>
<w:p><w:r><w:t>Quantity: {{quantity}}</w:t></w:r></w:p>
<w:p><w:r><w:t>FINANCIAL DETAILS</w:t></w:r></w:p>
<w:p><w:r><w:t>EMD Value: {{emd_value}}</w:t></w:r></w:p>
<w:p><w:r><w:t>PBG Value: {{pbg_value}}</w:t></w:r></w:p>
<w:p><w:r><w:t>EMD Pledge Officer: {{EMD_officer}}</w:t></w:r></w:p>
<w:p><w:r><w:t>BID DETAILS</w:t></w:r></w:p>
<w:p><w:r><w:t>Bid Validity (Days): {{bid_validity}}</w:t></w:r></w:p>
</w:body>
</w:document>`;

    zip.file("word/document.xml", documentXml);

    // 4. Create word/_rels/document.xml.rels
    zip.file(
      "word/_rels/document.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
    );

    // Write the DOCX file
    const templatePath = path.join(templatesDir, "template1.docx");
    const tempPath = path.join(templatesDir, "template1_temp.docx");

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync(tempPath, buffer);

    // Try to replace the old file
    try {
      if (fs.existsSync(templatePath)) {
        fs.unlinkSync(templatePath);
      }
    } catch (e) {
      // File might be locked, skip deletion
    }

    // Rename temp to final
    try {
      fs.renameSync(tempPath, templatePath);
    } catch (e) {
      console.log(
        "Could not rename, file might be in use. Temp file at:",
        tempPath
      );
    }
    console.log(`✅ Template created successfully at: ${templatePath}`);
    console.log("Template contains the following variables:");
    console.log("  - {{name_of_department}}");
    console.log("  - {{email_of_department}}");
    console.log("  - {{procurement_title}}");
    console.log("  - {{tender_title}}");
    console.log("  - {{quantity}}");
    console.log("  - {{emd_value}}");
    console.log("  - {{pbg_value}}");
    console.log("  - {{EMD_officer}}");
    console.log("  - {{bid_validity}}");
  } catch (error) {
    console.error("❌ Error creating template:", error);
    process.exit(1);
  }
}

createTemplate();
