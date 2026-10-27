# Plausible 🎭

> *"Got an excuse? Make it plausible."*
>
##### video link - https://drive.google.com/file/d/1Hb6dlxfFy-ln4noNskqGxgLml9pWagWf/view?usp=sharing

Plausible is a full-stack platform where users can trade, test, and score excuses. Powered by an AI plausibility scoring engine, community members can submit excuses, browse trending categories, vote, and build a leaderboard of the most believable (or hilarious) excuses.

---

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript ([`tsx`](https://github.com/privatenumber/tsx))
- **Database:** MongoDB Atlas with Mongoose ODM
- **Development Tooling:** Concurrently, PostCSS, Autoprefixer

---

## ✨ Features

- **🧠 AI Scoring Engine:** Evaluates submitted excuses for believability, creativity, and plausibility.
- **🗳️ Live MongoDB Integration:** Stores excuses, user handles, categories, ratings, and save counts.
- **🌱 Automatic Seeding:** Populates the database with initial curated excuses upon first connection.
- **⚡ Status Indicator:** Live pill in the navigation header indicating real-time MongoDB connectivity.
- **✨ Glassmorphic UI:** Smooth animations, glow interactions, and modern dark-mode aesthetic with Tailwind CSS.
- **📦 Single-Command Dev:** Run both frontend and backend concurrently with hot reloading.

---

## 📁 Project Structure

```text
plausible/
├── server/
│   ├── db.ts               # MongoDB connection manager & event handlers
│   ├── index.ts            # Express server & REST API routes
│   ├── models/
│   │   └── Excuse.ts       # Mongoose Schema & Model for excuses
│   └── seed.ts             # Default data seeder
├── src/
│   ├── App.tsx             # Main React application & interactive UI
│   ├── main.tsx            # React application entrypoint
│   └── index.css           # Tailwind CSS directives and custom styling
├── .env.example            # Environment variables template
├── package.json            # Scripts & project dependencies
├── tailwind.config.js      # Tailwind CSS theme configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration with /api backend proxy
```

---

## 🛠️ Getting Started

### 1. Prerequisites

- **Node.js** (v18 or newer)
- **MongoDB Atlas** account (or local MongoDB instance)

---

### 2. Installation

Clone or open the repository directory, then install dependencies:

```bash
npm install
```

---

### 3. Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Open `.env` and set your MongoDB Atlas connection URI:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/plausible?retryWrites=true&w=majority
```

> **Note:** If `MONGODB_URI` is not provided or invalid, the app runs gracefully in mock mode using default local data.

---

### 4. Running the App

Start both the backend server and frontend development server concurrently:

```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5001](http://localhost:5001)

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both Express backend (`server`) and Vite frontend (`client`) concurrently |
| `npm run dev:client` | Starts only the Vite frontend development server |
| `npm run server` | Starts only the Express backend server with hot-reloading via `tsx watch` |
| `npm run build` | Type-checks with TypeScript and creates an optimized production bundle in `dist/` |
| `npm run preview` | Locally previews the production build |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Checks server health and MongoDB connection state |
| `GET` | `/api/excuses` | Retrieves excuses (supports query params: `?category=Work&sort=saves`) |
| `POST` | `/api/excuses` | Submits a new excuse (`{ text, category, author }`) with AI plausibility scoring |
| `POST` | `/api/excuses/:id/save` | Increments the save/upvote count for a given excuse |

---

## 📄 License

MIT
