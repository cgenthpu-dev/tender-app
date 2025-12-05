const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// MongoDB Connection
const MONGO_URI = "mongodb+srv://projman:Projman%40123@cluster0.kzciazl.mongodb.net/project_management";

// Schemas (copied from server.js to avoid importing issues)
const CategorySchema = new mongoose.Schema({
    id: Number,
    name: { type: String, required: true },
    description: String,
});
const Category = mongoose.model("Category", CategorySchema);

const TermSchema = new mongoose.Schema({
    id: Number,
    categoryId: Number,
    title: { type: String, required: true },
    description: String,
});
const Term = mongoose.model("Term", TermSchema);

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing data
        await Category.deleteMany({});
        await Term.deleteMany({});
        console.log("🗑️  Cleared existing Categories and Terms");

        // Read extracted text
        const textPath = path.join(__dirname, "extracted_text.txt");
        if (!fs.existsSync(textPath)) {
            console.error("❌ extracted_text.txt not found. Run inspect_docx.js first.");
            process.exit(1);
        }
        const text = fs.readFileSync(textPath, "utf-8");
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

        let currentCategory = null;
        let currentTerm = null;
        let categoryCounter = 1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 1. Check for Category (e.g., "1. General Conditions")
            const catMatch = line.match(/^(\d+)\.\s+(.*)/);
            if (catMatch) {
                // Save previous term if exists
                if (currentTerm) {
                    await currentTerm.save();
                    currentTerm = null;
                }

                const catName = catMatch[2].trim();
                // Ignore "Himachal Pradesh University" or other headers if they accidentally match
                if (catName.length > 3) {
                    currentCategory = new Category({
                        id: Date.now() + i, // Unique ID
                        name: catName,
                        description: ""
                    });
                    await currentCategory.save();
                    console.log(`Tb  Created Category: ${currentCategory.name}`);
                    continue;
                }
            }

            if (!currentCategory) continue; // Skip text before first category

            // 2. Check for Numbered Term (e.g., "1.1. Scope of Work:")
            const termMatch = line.match(/^(\d+)\.(\d+)\.\s+(.*)/);
            if (termMatch) {
                if (currentTerm) await currentTerm.save();

                let title = termMatch[3].trim();
                let desc = "";

                // Split title and desc if separated by colon
                const colonIndex = title.indexOf(':');
                if (colonIndex > -1) {
                    desc = title.substring(colonIndex + 1).trim();
                    title = title.substring(0, colonIndex).trim();
                }

                currentTerm = new Term({
                    id: Date.now() + i,
                    categoryId: currentCategory.id,
                    title: title,
                    description: desc
                });
                continue;
            }

            // 3. Check for Named Term (Heuristic: Short line, ends with colon OR next line is long)
            // Only if we are not already inside a term description that spans multiple lines?
            // Actually, simpler: If line ends with ":", treat as Title.
            // Or if it matches specific headers like "Bidder Status"
            const isHeaderLike = line.length < 60 && !line.endsWith('.') && !line.includes("Himachal");

            if (isHeaderLike && !line.match(/^\d/)) {
                // It might be a sub-header term like "Bidder Status"
                if (currentTerm) await currentTerm.save();

                let title = line;
                let desc = "";
                if (title.endsWith(':')) {
                    title = title.slice(0, -1);
                }

                currentTerm = new Term({
                    id: Date.now() + i,
                    categoryId: currentCategory.id,
                    title: title,
                    description: ""
                });
                continue;
            }

            // 4. Append to Description
            if (currentTerm) {
                currentTerm.description = currentTerm.description
                    ? currentTerm.description + " " + line
                    : line;
            }
        }

        // Save last term
        if (currentTerm) await currentTerm.save();

        console.log("✅ Seeding completed successfully!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Error seeding database:", err);
        process.exit(1);
    }
};

seed();
