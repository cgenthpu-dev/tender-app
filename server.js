const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
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

// Routes
app.use("/api", require("./routes/dashboard"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/terms", require("./routes/terms"));
app.use("/api/tenders", require("./routes/tenders"));
app.use("/api/documents", require("./routes/documents"));

// Document Routes (for fetching docs by tender ID)
// This was in server.js as app.get("/api/tenders/:id/documents", ...)
// I should move this to tenders.js or documents.js
// Let's add it to documents.js but with a different path or keep it here if it's specific.
// Actually, let's put it in documents.js as `GET /api/documents/tender/:tenderId`
// I need to update the frontend to match if I change the URL.
// The original was `/api/tenders/:id/documents`.
// I can add this to `routes/tenders.js` as a sub-resource.

const SavedDocument = require("./models/SavedDocument");
app.get("/api/tenders/:id/documents", async (req, res) => {
  try {
    const docs = await SavedDocument.find({ tenderId: parseInt(req.params.id) }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/", (req, res) => {
  res.send("Welcome to the Tender App API! The frontend is served separately.");
});

// 404 Handler
app.use((req, res) => {
  console.log(`[404] Unhandled request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
