import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, isDbConnected } from "./db";
import { Excuse } from "./models/Excuse";
import { seedInitialData } from "./seed";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API health and DB connection status
app.get("/api/status", (_req, res) => {
  const connected = isDbConnected();
  res.json({
    status: "ok",
    database: {
      connected,
      message: connected
        ? "Connected to MongoDB"
        : "Not connected to MongoDB. Set a valid MONGODB_URI in your .env file.",
    },
  });
});

// Fetch all excuses
app.get("/api/excuses", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: "Database not connected",
        connected: false,
      });
    }

    const { category, sort } = req.query;
    const filter: Record<string, any> = {};
    if (category && typeof category === "string") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    let sortOption: Record<string, any> = { createdAt: -1 };
    if (sort === "saves") sortOption = { saves: -1 };
    if (sort === "score") sortOption = { score: -1 };

    const excuses = await Excuse.find(filter).sort(sortOption).limit(50);
    res.json(excuses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch excuses" });
  }
});

// Submit a new excuse
app.post("/api/excuses", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: "Database not connected. Please connect MongoDB to submit excuses.",
      });
    }

    const { text, category, author } = req.body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Excuse text is required." });
    }

    // Generate plausibility score (65 - 98) with weighted believability
    const generatedScore = Math.floor(Math.random() * 34) + 65;
    const rating = (4.0 + Math.random() * 1.0).toFixed(1);

    const newExcuse = new Excuse({
      text: text.trim(),
      category: category || "General",
      author: author ? (author.startsWith("@") ? author : `@${author}`) : "@anonymous",
      score: generatedScore,
      rating,
      saves: 0,
    });

    await newExcuse.save();
    res.status(201).json(newExcuse);
  } catch (err) {
    res.status(500).json({ error: "Failed to create excuse" });
  }
});

// Save / upvote an excuse
app.post("/api/excuses/:id/save", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: "Database not connected" });
    }

    const { id } = req.params;
    const updated = await Excuse.findByIdAndUpdate(
      id,
      { $inc: { saves: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Excuse not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to save excuse" });
  }
});

async function startServer() {
  const connected = await connectDB();
  if (connected) {
    await seedInitialData();
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
