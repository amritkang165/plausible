import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB, isDbConnected } from "./db";
import { Excuse } from "./models/Excuse";
import { User } from "./models/User";
import { seedInitialData } from "./seed";
import { requireAuth, optionalAuth, AuthenticatedRequest } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "plausible_jwt_default_secret_key";

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

// ================= AUTHENTICATION ROUTES =================

// Register a new user
app.post("/api/auth/register", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: "Database not connected" });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    // Check if user already exists
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return res.status(400).json({ error: "An account with this email already exists." });
      }
      return res.status(400).json({ error: "This username is already taken." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      savedExcuses: [],
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        savedExcuses: user.savedExcuses,
      },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Failed to register account." });
  }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: "Database not connected" });
    }

    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: "Email/Username and password are required." });
    }

    // Find by email or username
    const user = await User.findOne({
      $or: [
        { email: login.trim().toLowerCase() },
        { username: login.trim() },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        savedExcuses: user.savedExcuses,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to log in." });
  }
});

// Get currently logged-in user profile
app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await User.findById(req.user?.userId)
      .select("-password")
      .populate("savedExcuses");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve user profile." });
  }
});

// ================= EXCUSES ROUTES =================

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

// Submit a new excuse (supports anonymous or logged-in user)
app.post("/api/excuses", optionalAuth, async (req: AuthenticatedRequest, res) => {
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

    // If user is authenticated via JWT, attribute to their username
    const finalAuthor = req.user
      ? `@${req.user.username}`
      : author
      ? author.startsWith("@")
        ? author
        : `@${author}`
      : "@anonymous";

    const newExcuse = new Excuse({
      text: text.trim(),
      category: category || "General",
      author: finalAuthor,
      score: generatedScore,
      rating,
      saves: 0,
      userId: req.user?.userId || undefined,
    });

    await newExcuse.save();
    res.status(201).json(newExcuse);
  } catch (err) {
    res.status(500).json({ error: "Failed to create excuse" });
  }
});

// Save / upvote an excuse (supports anonymous or user bookmark sync)
app.post("/api/excuses/:id/save", optionalAuth, async (req: AuthenticatedRequest, res) => {
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

    // If user is logged in, also add to user's saved bookmarks
    if (req.user?.userId) {
      await User.findByIdAndUpdate(req.user.userId, {
        $addToSet: { savedExcuses: updated._id },
      });
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
