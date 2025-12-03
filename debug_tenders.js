const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://projman:Projman%40123@cluster0.kzciazl.mongodb.net/project_management";

const TenderSchema = new mongoose.Schema({
    id: Number,
    tenderName: String,
});
const Tender = mongoose.model("Tender", TenderSchema);

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const tenders = await Tender.find({});
        console.log(`Found ${tenders.length} tenders:`);
        tenders.forEach(t => {
            console.log(`- ID: ${t.id}, Name: ${t.tenderName}`);
        });
        mongoose.disconnect();
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
