const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(__dirname).filter(f => f.startsWith("verified_tender_") && f.endsWith(".docx"));
if (files.length === 0) {
    console.log("No verified tender docx found");
    process.exit(1);
}
// Get the most recently modified file
const latestFile = files.map(f => ({ name: f, time: fs.statSync(path.join(__dirname, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time)[0].name;

console.log("Checking file:", latestFile);

const content = fs.readFileSync(path.join(__dirname, latestFile), "binary");
const zip = new PizZip(content);
const docXml = zip.file("word/document.xml").asText();

if (docXml.includes("w:pgBorders")) {
    console.log("✅ Border XML found in document.xml");
} else {
    console.log("❌ Border XML NOT found in document.xml");
    console.log("Snippet of end of xml:", docXml.slice(-1000));
}
