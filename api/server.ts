import app from "../server/app";
import { connectDB } from "../server/db";
import { seedInitialData } from "../server/seed";

let isSeeded = false;

// Normalize URL path and connect DB before handling request
app.use(async (req, _res, next) => {
  // If Vercel rewrites stripped /api prefix, restore it
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

export default app;
