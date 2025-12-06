const mongoose = require("mongoose");
const fs = require("fs");

// MongoDB Connection
const MONGO_URI =
    "mongodb+srv://projman:Projman%40123@cluster0.kzciazl.mongodb.net/project_management";

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- SCHEMAS ---
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

const seedDatabase = async () => {
    try {
        // 1. Read the file
        const content = fs.readFileSync("tcseeder.txt", "utf-8");
        const lines = content.split("\n");

        // 2. Clear existing data
        console.log("🗑️ Clearing existing data...");
        await Category.deleteMany({});
        await Term.deleteMany({});

        // 3. Parse and Insert
        console.log("🌱 Seeding data...");

        let currentCategoryId = 0;
        let currentTermId = 0;
        let categoryCount = 0;
        let termCount = 0;

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // Check for Category
            if (line.startsWith("Category:")) {
                const categoryName = line.replace("Category:", "").trim();
                currentCategoryId++;

                await Category.create({
                    id: currentCategoryId,
                    name: categoryName,
                    description: ""
                });
                categoryCount++;
                console.log(`   Created Category: ${categoryName}`);
            }
            // Check for Term (e.g., "1.1 Scope of Work: ...")
            else if (line.match(/^\d+\.\d+/)) {
                // Extract parts: "1.1 Title: Description"
                // Regex: (Number) (Title): (Description)
                const match = line.match(/^\d+\.\d+\s+(.*?):\s+(.*)/);
                if (match) {
                    const title = match[1].trim();
                    const description = match[2].trim();
                    currentTermId++;

                    await Term.create({
                        id: currentTermId,
                        categoryId: currentCategoryId,
                        title: title,
                        description: description
                    });
                    termCount++;
                    // console.log(`      Added Term: ${title}`);
                }
            }
        }

        console.log(`✅ Seeding Complete!`);
        console.log(`   Categories: ${categoryCount}`);
        console.log(`   Terms: ${termCount}`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedDatabase();
