import { Excuse } from "./models/Excuse";

const INITIAL_EXCUSES = [
  { text: "My cat submitted the expense report. Accounting is reviewing it.", score: 91, category: "Pets", author: "@nightowl", saves: 412, rating: "4.9" },
  { text: "The printer ate my homework, then it ate the printer.", score: 78, category: "School", author: "@brokenbeat", saves: 287, rating: "4.5" },
  { text: "I was stuck in a two-hour meeting about meetings. That's how I got here.", score: 84, category: "Work", author: "@tabsnotspaces", saves: 359, rating: "4.8" },
  { text: "Ring road traffic was a sentient being today.", score: 88, category: "Travel", author: "@commuter", saves: 198, rating: "4.9" },
  { text: "My phone hit 1%, so I was emotionally unavailable.", score: 73, category: "Dating", author: "@offline", saves: 145, rating: "4.7" },
  { text: "The gym was closed for emotional reasons.", score: 69, category: "Health", author: "@couchpotato", saves: 210, rating: "4.6" },
  { text: "The Wi-Fi password was the excuse. I was the password.", score: 81, category: "Tech", author: "@sysadmin", saves: 320, rating: "4.8" },
];

export async function seedInitialData() {
  try {
    const count = await Excuse.countDocuments();
    if (count === 0) {
      console.log("🌱 [MongoDB] Seeding initial excuses into database...");
      await Excuse.insertMany(INITIAL_EXCUSES);
      console.log("✅ [MongoDB] Initial excuses seeded successfully.");
    }
  } catch (error) {
    console.error("⚠️  [MongoDB] Seed error:", error instanceof Error ? error.message : error);
  }
}
