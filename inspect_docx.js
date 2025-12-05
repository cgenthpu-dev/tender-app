const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "seeder", "Gem  ATC.docx");

mammoth.extractRawText({ path: filePath })
    .then(result => {
        const text = result.value;
        fs.writeFileSync("extracted_text.txt", text);
        console.log("Text extracted to extracted_text.txt");
    })
    .catch(err => {
        console.error("Error reading file:", err);
    });
