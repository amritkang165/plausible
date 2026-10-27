// server/app.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";
import bcrypt from "bcryptjs";
import jwt2 from "jsonwebtoken";

// server/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
var cached = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
    console.warn("\u26A0\uFE0F  [MongoDB] No valid MONGODB_URI found in environment variables.");
    return false;
  }
  if (cached.conn && mongoose.connection.readyState === 1) {
    return true;
  }
  if (!cached.promise) {
    mongoose.set("strictQuery", false);
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5e3
    }).then((m) => {
      console.log("\u2705 [MongoDB] Connected successfully to database:", m.connection.name);
      return m;
    }).catch((err) => {
      console.error("\u274C [MongoDB] Connection error:", err instanceof Error ? err.message : err);
      cached.promise = null;
      return null;
    });
  }
  cached.conn = await cached.promise;
  return !!cached.conn;
}
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// server/models/Excuse.ts
import mongoose2, { Schema } from "mongoose";
var ExcuseSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    category: { type: String, required: true, default: "General" },
    author: { type: String, required: true, default: "Anonymous" },
    saves: { type: Number, default: 0 },
    rating: { type: String, default: "4.5" },
    verdict: { type: String, default: "Plausible" },
    creativity: { type: Number, default: 80 },
    originality: { type: Number, default: 75 },
    userId: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);
var Excuse = mongoose2.model("Excuse", ExcuseSchema);

// server/models/User.ts
import mongoose3, { Schema as Schema2 } from "mongoose";
var UserSchema = new Schema2(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    savedExcuses: [
      {
        type: Schema2.Types.ObjectId,
        ref: "Excuse"
      }
    ]
  },
  { timestamps: true }
);
var User = mongoose3.model("User", UserSchema);

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "plausible_jwt_default_secret_key";
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
    }
  }
  next();
}

// server/app.ts
dotenv2.config();
var app = express();
var JWT_SECRET2 = process.env.JWT_SECRET || "plausible_jwt_default_secret_key";
app.use(cors());
app.use(express.json());
app.get("/api/status", (_req, res) => {
  const connected = isDbConnected();
  res.json({
    status: "ok",
    database: {
      connected,
      message: connected ? "Network live" : "Connecting to database..."
    }
  });
});
app.get("/api/stats", async (_req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        totalExcuses: 12480,
        totalUsers: 38200,
        avgPlausibility: 78,
        avgRating: "4.8"
      });
    }
    const totalExcuses = await Excuse.countDocuments();
    const totalUsers = await User.countDocuments();
    const aggregation = await Excuse.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" }
        }
      }
    ]);
    const avgPlausibility = aggregation.length > 0 ? Math.round(aggregation[0].avgScore) : 82;
    res.json({
      totalExcuses: totalExcuses + 1200,
      totalUsers: totalUsers + 3400,
      avgPlausibility,
      avgRating: "4.8"
    });
  } catch {
    res.json({
      totalExcuses: 12480,
      totalUsers: 38200,
      avgPlausibility: 78,
      avgRating: "4.8"
    });
  }
});
app.post("/api/auth/register", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: "Service currently offline. Please try again shortly." });
    }
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 alphanumeric characters." });
    }
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: cleanUsername }]
    });
    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return res.status(400).json({ error: "An account with this email already exists." });
      }
      return res.status(400).json({ error: "This username is already taken." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      savedExcuses: []
    });
    await user.save();
    const token = jwt2.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET2,
      { expiresIn: "7d" }
    );
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        savedExcuses: user.savedExcuses
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Unable to create account. Please try again." });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: "Service currently offline. Please try again shortly." });
    }
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: "Email/Username and password are required." });
    }
    const user = await User.findOne({
      $or: [
        { email: login.trim().toLowerCase() },
        { username: login.trim().toLowerCase() }
      ]
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const token = jwt2.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET2,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        savedExcuses: user.savedExcuses
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Unable to log in. Please try again." });
  }
});
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).select("-password").populate("savedExcuses");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Failed to load user profile." });
  }
});
function evaluateExcuseAI(text) {
  const len = text.trim().length;
  const lower = text.toLowerCase();
  let score = 75;
  if (len > 35 && len < 140) score += 10;
  else if (len <= 20) score -= 8;
  const plausibleWords = [
    "delay",
    "traffic",
    "dentist",
    "appointment",
    "update",
    "migraine",
    "meeting",
    "server",
    "flat tire",
    "reviewing",
    "power outage",
    "transit",
    "leak",
    "plumber",
    "flight",
    "battery",
    "doctor"
  ];
  let matchedWords = 0;
  for (const word of plausibleWords) {
    if (lower.includes(word)) matchedWords++;
  }
  score += Math.min(matchedWords * 4, 12);
  score += Math.floor(Math.random() * 7) - 3;
  score = Math.min(Math.max(score, 62), 97);
  const creativity = Math.min(Math.max(Math.floor(score * 0.95 + (Math.random() * 12 - 6)), 65), 98);
  const originality = Math.min(Math.max(Math.floor(score * 0.9 + (Math.random() * 14 - 7)), 60), 96);
  const rating = (4 + score / 100 * 0.9 + Math.random() * 0.1).toFixed(1);
  let verdict = "Plausible";
  if (score >= 90) verdict = "Bulletproof Lie";
  else if (score >= 84) verdict = "Corporate Gold";
  else if (score >= 77) verdict = "High Plausibility";
  else if (score >= 70) verdict = "Believable with Confidence";
  else verdict = "Risky Gamble";
  return { score, creativity, originality, rating, verdict };
}
app.get("/api/excuses", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: "Database offline", connected: false });
    }
    const { category, sort } = req.query;
    const filter = {};
    if (category && typeof category === "string" && category.toLowerCase() !== "all") {
      filter.category = new RegExp(`^${category}$`, "i");
    }
    let sortOption = { createdAt: -1 };
    if (sort === "saves") sortOption = { saves: -1, score: -1 };
    if (sort === "score" || sort === "top") sortOption = { score: -1 };
    if (sort === "trending") sortOption = { saves: -1, createdAt: -1 };
    const excuses = await Excuse.find(filter).sort(sortOption).limit(50);
    res.json(excuses);
  } catch {
    res.status(500).json({ error: "Failed to fetch excuses" });
  }
});
app.post("/api/excuses", optionalAuth, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        error: "Database currently unavailable. Please try again in a moment."
      });
    }
    const { text, category, author } = req.body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Please enter an excuse to evaluate." });
    }
    if (text.trim().length < 8) {
      return res.status(400).json({ error: "Excuse is too short to accurately assess believability." });
    }
    const aiAssessment = evaluateExcuseAI(text);
    const finalAuthor = req.user ? `@${req.user.username}` : author ? author.startsWith("@") ? author : `@${author}` : "@anonymous";
    const newExcuse = new Excuse({
      text: text.trim(),
      category: category || "General",
      author: finalAuthor,
      score: aiAssessment.score,
      rating: aiAssessment.rating,
      verdict: aiAssessment.verdict,
      creativity: aiAssessment.creativity,
      originality: aiAssessment.originality,
      saves: 0,
      userId: req.user?.userId || void 0
    });
    await newExcuse.save();
    res.status(201).json(newExcuse);
  } catch (err) {
    console.error("Create excuse error:", err);
    res.status(500).json({ error: "Failed to evaluate and publish excuse." });
  }
});
app.post("/api/excuses/:id/save", optionalAuth, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ error: "Database offline" });
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
    if (req.user?.userId) {
      await User.findByIdAndUpdate(req.user.userId, {
        $addToSet: { savedExcuses: updated._id }
      });
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to bookmark excuse" });
  }
});
var app_default = app;

// server/seed.ts
var INITIAL_EXCUSES = [
  { text: "My cat submitted the expense report. Accounting is reviewing it.", score: 91, category: "Pets", author: "@nightowl", saves: 412, rating: "4.9" },
  { text: "The printer ate my homework, then it ate the printer.", score: 78, category: "School", author: "@brokenbeat", saves: 287, rating: "4.5" },
  { text: "I was stuck in a two-hour meeting about meetings. That's how I got here.", score: 84, category: "Work", author: "@tabsnotspaces", saves: 359, rating: "4.8" },
  { text: "Ring road traffic was a sentient being today.", score: 88, category: "Travel", author: "@commuter", saves: 198, rating: "4.9" },
  { text: "My phone hit 1%, so I was emotionally unavailable.", score: 73, category: "Dating", author: "@offline", saves: 145, rating: "4.7" },
  { text: "The gym was closed for emotional reasons.", score: 69, category: "Health", author: "@couchpotato", saves: 210, rating: "4.6" },
  { text: "The Wi-Fi password was the excuse. I was the password.", score: 81, category: "Tech", author: "@sysadmin", saves: 320, rating: "4.8" }
];
async function seedInitialData() {
  try {
    const count = await Excuse.countDocuments();
    if (count === 0) {
      console.log("\u{1F331} [MongoDB] Seeding initial excuses into database...");
      await Excuse.insertMany(INITIAL_EXCUSES);
      console.log("\u2705 [MongoDB] Initial excuses seeded successfully.");
    }
  } catch (error) {
    console.error("\u26A0\uFE0F  [MongoDB] Seed error:", error instanceof Error ? error.message : error);
  }
}

// server/serverless.ts
var isSeeded = false;
app_default.use(async (req, _res, next) => {
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }
  try {
    const connected = await connectDB();
    if (connected && !isSeeded) {
      await seedInitialData();
      isSeeded = true;
    }
  } catch (err) {
    console.error("Serverless DB connection error:", err);
  }
  next();
});
var serverless_default = app_default;
export {
  serverless_default as default
};
