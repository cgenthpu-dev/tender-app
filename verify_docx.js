const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        // 1. Create a dummy tender
        console.log("Creating dummy tender...");
        const tenderData = {
            departmentName: "Test Dept",
            departmentEmail: "test@example.com",
            tenderInvitingAuthority: "Test Authority",
            tenderCategory: "service",
            tenderType: "gem",
            tenderName: "Test Tender for DOCX Verification",
            tenderNo: "TEST-DOCX-001",
            estimatedCost: 50000,
            itemQuantity: "100 Units",
            bidValidity: 120,
            emdRequired: "5000",
            pbgRequired: "10000",
            emdPledgeOfficer: "Test Officer",
            bidStartDate: new Date().toISOString(),
            bidEndDate: new Date(Date.now() + 86400000).toISOString(),
            publishDate: new Date().toISOString(),
            isPreBidRequired: "no",
            selectedTermIds: []
        };

        const createRes = await axios.post(`${API_URL}/tenders`, tenderData);
        const tenderId = createRes.data.id;
        console.log(`Tender created with ID: ${tenderId}`);

        // 2. Generate DOCX
        console.log("Requesting DOCX generation...");
        const docRes = await axios.post(`${API_URL}/generate-document/${tenderId}`, {}, {
            responseType: 'arraybuffer'
        });

        if (docRes.status === 200) {
            const outputPath = path.join(__dirname, `verified_tender_${tenderId}.docx`);
            fs.writeFileSync(outputPath, docRes.data);
            console.log(`✅ DOCX generated and saved to: ${outputPath}`);
            console.log(`File size: ${docRes.data.length} bytes`);
        } else {
            console.error(`❌ Failed to generate DOCX. Status: ${docRes.status}`);
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error("❌ Connection refused. Server is likely not running.");
            process.exit(1);
        } else {
            console.error("❌ Error during verification:", error.message);
            if (error.response) {
                console.error("Response data:", error.response.data);
            }
        }
    }
}

verify();
