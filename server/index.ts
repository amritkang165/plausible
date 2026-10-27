import app from "./app";
import { connectDB } from "./db";
import { seedInitialData } from "./seed";

const PORT = process.env.PORT || 5001;

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
