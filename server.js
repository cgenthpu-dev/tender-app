const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
// FIXED: Removed deprecated options (useNewUrlParser, useUnifiedTopology)
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
  selectedTermIds: [Number], // Storing IDs of selected terms
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

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
