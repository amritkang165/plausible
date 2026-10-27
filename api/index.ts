import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server/app";
import { connectDB } from "../server/db";
import { seedInitialData } from "../server/seed";

let isSeeded = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const connected = await connectDB();
  if (connected && !isSeeded) {
    await seedInitialData();
    isSeeded = true;
  }
  return app(req, res);
}
