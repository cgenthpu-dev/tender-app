const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
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

app.get("/api/tenders/:id", async (req, res) => {
  try {
    console.log(`[API] Fetching tender with ID: ${req.params.id}`);
    const tender = await Tender.findOne({ id: parseInt(req.params.id) });
    if (!tender) {
      console.log(`[API] Tender not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: "Tender not found" });
    }
    console.log(`[API] Found tender: ${tender.tenderName}`);
    res.json(tender);
  } catch (err) {
    console.error(`[API] Error fetching tender: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tenders", async (req, res) => {
  try {
    const newTender = new Tender({ ...req.body, id: Date.now() });
    await newTender.save();
    res.json(newTender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tenders/:id", async (req, res) => {
  try {
    const updatedTender = await Tender.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!updatedTender) return res.status(404).json({ error: "Tender not found" });
    res.json(updatedTender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tenders/:id", async (req, res) => {
  try {
    const result = await Tender.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!result) return res.status(404).json({ error: "Tender not found" });
    res.json({ message: "Tender deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SAVED DOCUMENTS SCHEMA & ROUTES ---
const SavedDocumentSchema = new mongoose.Schema({
  id: Number,
  tenderId: Number,
  name: String,
  pages: Object, // Map of pageNumber -> htmlString
  extraPages: Array, // Array of extra page objects
  createdAt: { type: Date, default: Date.now },
});
const SavedDocument = mongoose.model("SavedDocument", SavedDocumentSchema);

// Save a new document version
app.post("/api/documents", async (req, res) => {
  try {
    const newDoc = new SavedDocument({ ...req.body, id: Date.now() });
    await newDoc.save();
    res.json(newDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all saved documents for a specific tender
app.get("/api/tenders/:id/documents", async (req, res) => {
  try {
    const docs = await SavedDocument.find({ tenderId: parseInt(req.params.id) }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific saved document
app.get("/api/documents/:id", async (req, res) => {
  try {
    const doc = await SavedDocument.findOne({ id: parseInt(req.params.id) });
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a saved document
app.delete("/api/documents/:id", async (req, res) => {
  try {
    const result = await SavedDocument.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!result) return res.status(404).json({ error: "Document not found" });
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GENERATE DOCX DOCUMENT (Using docxtemplater) ---
app.post("/api/generate-document/:id", async (req, res) => {
  try {
    console.log("Generating DOCX document for tender ID:", req.params.id);
    const tender = await Tender.findOne({ id: parseInt(req.params.id) });
    if (!tender) {
      return res
        .status(404)
        .json({ error: `Tender with id ${req.params.id} not found` });
    }

    // Load the template
    const templatePath = path.join(__dirname, "templates", "gem.docx");
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: "Template file not found at " + templatePath });
    }
  } catch (error) {
    console.error("Document Generation Error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ error: `Failed to generate document: ${error.message}` });
  }
});

// ... existing code ...
// ... existing code ...
app.use((req, res) => {
  console.log(`[404] Unhandled request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("!!! SERVER RELOADED - VERSION DEBUG !!!");
  console.log("Routes registered:");
  console.log("- GET /api/tenders/:id");
});
