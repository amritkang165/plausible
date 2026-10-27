import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

type Page = "home" | "category" | "new" | "leaderboard";

type Excuse = {
  _id?: string;
  text?: string;
  t?: string;
  score?: number;
  s?: number;
  category?: string;
  cat?: string;
  author?: string;
  by?: string;
  saves: number;
  rating?: string;
  r?: string;
  verdict?: string;
  createdAt?: string;
};

type UserProfile = {
  id: string;
  username: string;
  email: string;
};

const CATEGORIES = [
  { e: "💼", n: "Work", g: "from-violet-600 to-indigo-700", desc: "Corporate-tested alibis for missed deadlines, meeting skips, and Friday afternoon disappearances." },
  { e: "🎒", n: "School", g: "from-pink-600 to-rose-700", desc: "Believable homework, late arrival, and exam deferral stories vetted for maximum plausibility." },
  { e: "💘", n: "Dating", g: "from-fuchsia-600 to-pink-700", desc: "Graceful rainchecks and low-friction exits when you just want to stay in your sweatpants." },
  { e: "🐾", n: "Pets", g: "from-amber-500 to-orange-600", desc: "Blame it on your furry companions with straight-faced, unassailable believability." },
  { e: "✈️", n: "Travel", g: "from-cyan-600 to-blue-700", desc: "Sentient traffic, transit reroutes, and flight anomaly narratives that no one questions." },
  { e: "🩺", n: "Health", g: "from-emerald-500 to-teal-700", desc: "Subtle wellness alibis and uncontested medical appointments." },
  { e: "💻", n: "Tech", g: "from-indigo-500 to-cyan-600", desc: "Rogue OS updates, Wi-Fi outages, and catastrophic cloud synching failures." },
  { e: "🏠", n: "Family", g: "from-rose-500 to-violet-700", desc: "Ironclad domestic obligations and sudden familial emergencies that shut down any debate." },
];

const DEFAULT_TRENDING: Excuse[] = [
  { t: "My cat submitted the expense report. Accounting is reviewing it.", s: 91, cat: "Pets", by: "@nightowl", saves: 412, verdict: "Corporate Gold" },
  { t: "The printer ate my homework, then it ate the printer.", s: 78, cat: "School", by: "@brokenbeat", saves: 287, verdict: "High Plausibility" },
  { t: "I was stuck in a two-hour meeting about meetings. That's how I got here.", s: 84, cat: "Work", by: "@tabsnotspaces", saves: 359, verdict: "Bulletproof Lie" },
];

const DEFAULT_RATED: Excuse[] = [
  { t: "Ring road traffic was a sentient being today.", s: 88, cat: "Travel", r: "4.9", saves: 198, verdict: "Corporate Gold" },
  { t: "My phone hit 1%, so I was emotionally unavailable.", s: 73, cat: "Dating", r: "4.7", saves: 145, verdict: "High Plausibility" },
  { t: "The gym was closed for emotional reasons.", s: 69, cat: "Health", r: "4.6", saves: 210, verdict: "Believable with Confidence" },
  { t: "The Wi-Fi password was the excuse. I was the password.", s: 81, cat: "Tech", r: "4.8", saves: 320, verdict: "Bulletproof Lie" },
];

const FEATURES = [
  { i: "🧠", h: "AI Believability Scoring", p: "Every excuse is parsed by our NLP model for contextual plausibility, tone consistency, and likelihood of success." },
  { i: "🗳️", h: "Community Stress-Testing", p: "Real users stress-test and upvote excuses that actually work. Unbelievable excuses quietly sink to the bottom." },
  { i: "📋", h: "One-Click Quick Copy", p: "Instantly copy formatted excuse cards straight to Slack, iMessage, or your clipboard when timing matters." },
];

function Reveal({ children, d = 0, className = "" }: { children: ReactNode; d?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ "--d": `${d}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

function Counter({ to, suffix, dec }: { to: number; suffix: string; dec: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1600, 1);
          setV(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {v.toLocaleString(undefined, { maximumFractionDigits: dec, minimumFractionDigits: dec })}
      {suffix}
    </span>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div onMouseMove={onMove} className={`glass card card-border p-6 ${className}`}>
      {children}
    </div>
  );
}

function Ring({ s }: { s: number }) {
  return (
    <div
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(#ec4899 ${s * 3.6}deg, rgba(255,255,255,.08) 0)` }}
    >
      <div className="grid h-11 w-11 place-items-center rounded-full bg-void text-xs font-bold text-white">{s}%</div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy excuse"
      className="rounded-full px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function SaveButton({ id, token, onSave }: { id?: string; token: string | null; onSave?: () => void }) {
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (saved) return;
    setSaved(true);
    if (id) {
      try {
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        await fetch(`/api/excuses/${id}/save`, { method: "POST", headers });
        if (onSave) onSave();
      } catch (err) {
        console.error("Save error:", err);
      }
    }
  };

  return (
    <button
      onClick={handleSave}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        saved ? "bg-pink-500/20 text-pink-300" : "bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [networkOnline, setNetworkOnline] = useState<boolean | null>(null);
  
  // Page Navigation State: "home" | "category" | "new" | "leaderboard"
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [activeCategory, setActiveCategory] = useState<string>("Work");

  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [categoryExcuses, setCategoryExcuses] = useState<Excuse[]>([]);
  const [newExcuses, setNewExcuses] = useState<Excuse[]>([]);

  // Platform stats
  const [platformStats, setPlatformStats] = useState({
    totalExcuses: 12480,
    totalUsers: 38200,
    avgPlausibility: 78,
    avgRating: "4.8",
  });

  // Auth state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("plausible_token"));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authLoginInput, setAuthLoginInput] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Submit excuse state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formText, setFormText] = useState("");
  const [formCategory, setFormCategory] = useState("Work");
  const [formAuthor, setFormAuthor] = useState("");
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const glow = useRef<HTMLDivElement>(null);

  // Check health and hydrate user
  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser({
            id: data.user._id,
            username: data.user.username,
            email: data.user.email,
          });
        } else {
          localStorage.removeItem("plausible_token");
          setToken(null);
          setCurrentUser(null);
        }
      } catch {
        // silent
      }
    };
    fetchMe();
  }, [token]);

  // Load status and home excuses
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const statusRes = await fetch("/api/status");
        if (statusRes.ok) {
          const data = await statusRes.json();
          setNetworkOnline(data.database?.connected ?? true);
        }
      } catch {
        setNetworkOnline(false);
      }

      try {
        const excusesRes = await fetch("/api/excuses?sort=trending");
        if (excusesRes.ok) {
          const items = await excusesRes.json();
          if (Array.isArray(items) && items.length > 0) setExcuses(items);
        }
      } catch {
        setExcuses(DEFAULT_TRENDING);
      }

      try {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const sData = await statsRes.json();
          setPlatformStats(sData);
        }
      } catch {
        // default
      }
    };
    fetchHomeData();
  }, []);

  // Fetch category-specific excuses when category page is active
  useEffect(() => {
    if (currentPage === "category") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const fetchCategoryData = async () => {
        try {
          const res = await fetch(`/api/excuses?category=${encodeURIComponent(activeCategory)}`);
          if (res.ok) {
            const data = await res.json();
            setCategoryExcuses(data);
          }
        } catch {
          setCategoryExcuses([]);
        }
      };
      fetchCategoryData();
    }
  }, [currentPage, activeCategory]);

  // Fetch newest excuses when "new" page is active
  useEffect(() => {
    if (currentPage === "new") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const fetchNewest = async () => {
        try {
          const res = await fetch("/api/excuses?sort=createdAt");
          if (res.ok) {
            const data = await res.json();
            setNewExcuses(data);
          }
        } catch {
          setNewExcuses([]);
        }
      };
      fetchNewest();
    }
  }, [currentPage]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onMove = (e: globalThis.MouseEvent) => {
      if (glow.current) glow.current.style.transform = `translate(${e.clientX - 230}px, ${e.clientY - 230}px)`;
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      authMode === "login"
        ? { login: authLoginInput, password: authPassword }
        : { username: authUsername, email: authEmail, password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
      } else {
        localStorage.setItem("plausible_token", data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setIsAuthModalOpen(false);
        setAuthPassword("");
        setAuthError("");
      }
    } catch {
      setAuthError("Unable to connect to service.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("plausible_token");
    setToken(null);
    setCurrentUser(null);
  };

  const handleSubmitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) return;

    setSubmitting(true);
    setSubmissionFeedback("Analyzing tone and believability heuristics...");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/excuses", {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: formText,
          category: formCategory,
          author: currentUser ? `@${currentUser.username}` : formAuthor || "@anonymous",
        }),
      });

      if (res.ok) {
        const newExcuse = await res.json();
        setSubmissionFeedback(`AI Assessment: ${newExcuse.score}% Plausible • "${newExcuse.verdict || "Bulletproof"}"`);
        setTimeout(() => {
          setExcuses((prev) => [newExcuse, ...prev]);
          if (newExcuse.category === activeCategory) {
            setCategoryExcuses((prev) => [newExcuse, ...prev]);
          }
          setNewExcuses((prev) => [newExcuse, ...prev]);
          setFormText("");
          setFormAuthor("");
          setSubmissionFeedback(null);
          setIsModalOpen(false);
        }, 1200);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to publish excuse");
        setSubmissionFeedback(null);
      }
    } catch {
      alert("Network error. Please try again.");
      setSubmissionFeedback(null);
    } finally {
      setSubmitting(false);
    }
  };

  const activeCategoryMeta = CATEGORIES.find((c) => c.n === activeCategory) || CATEGORIES[0];

  return (
    <>
      <div ref={glow} className="cursor-glow" />

      {/* Navigation */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "nav-on" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage("home")}
              className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition"
            >
              <span className="text-2xl">🎭</span>
              <span>Plausible</span>
            </button>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  networkOnline === true
                    ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                    : networkOnline === false
                    ? "bg-amber-400"
                    : "bg-slate-400 animate-pulse"
                }`}
              />
              <span className="text-slate-300 font-medium">
                {networkOnline === true ? "Network Live" : "Syncing..."}
              </span>
            </div>
          </div>

          {/* Page Switcher */}
          <div className="hidden gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs md:flex">
            <button
              onClick={() => setCurrentPage("home")}
              className={`rounded-full px-4 py-1.5 transition ${
                currentPage === "home" ? "bg-white/20 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setCurrentPage("new")}
              className={`rounded-full px-4 py-1.5 transition ${
                currentPage === "new" ? "bg-white/20 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              ✨ New Feed
            </button>
            <button
              onClick={() => {
                setActiveCategory("Work");
                setCurrentPage("category");
              }}
              className={`rounded-full px-4 py-1.5 transition ${
                currentPage === "category" ? "bg-white/20 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setCurrentPage("leaderboard")}
              className={`rounded-full px-4 py-1.5 transition ${
                currentPage === "leaderboard" ? "bg-white/20 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              Leaderboard
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFormCategory(currentPage === "category" ? activeCategory : "Work");
                setIsModalOpen(true);
              }}
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              + Submit Excuse
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-xs font-medium text-pink-300">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-pink-500/30 text-[10px] font-bold text-white uppercase">
                    {currentUser.username[0]}
                  </span>
                  @{currentUser.username}
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setIsAuthModalOpen(true);
                }}
                className="btn-glow glass rounded-full px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-20">

        {/* ================= VIEW 1: DEDICATED CATEGORY PAGE ================= */}
        {currentPage === "category" && (
          <main className="mx-auto max-w-6xl px-6 py-10 min-h-screen">
            {/* Header & Back Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage("home")}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                ← Back to Home
              </button>
              <button
                onClick={() => {
                  setFormCategory(activeCategory);
                  setIsModalOpen(true);
                }}
                className="rounded-full bg-gradient-to-r from-violet to-hotpink px-5 py-2 text-xs font-semibold text-white shadow-lg transition hover:opacity-90"
              >
                + Post {activeCategory} Excuse
              </button>
            </div>

            {/* Category Banner Hero */}
            <div className={`mt-8 rounded-3xl bg-gradient-to-r ${activeCategoryMeta.g} p-8 md:p-12 relative overflow-hidden shadow-2xl`}>
              <div className="relative z-10 max-w-2xl">
                <div className="text-6xl mb-4">{activeCategoryMeta.e}</div>
                <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white">
                  {activeCategoryMeta.n} Excuses
                </h1>
                <p className="mt-3 text-lg text-white/80 leading-relaxed">
                  {activeCategoryMeta.desc}
                </p>
                <div className="mt-6 flex items-center gap-4 text-xs font-semibold text-white/90">
                  <span className="rounded-full bg-black/20 px-3.5 py-1 backdrop-blur-md">
                    {categoryExcuses.length} Curated Stories
                  </span>
                  <span className="rounded-full bg-black/20 px-3.5 py-1 backdrop-blur-md">
                    AI Believability Tested
                  </span>
                </div>
              </div>
            </div>

            {/* Category Selector Pills */}
            <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.n}
                  onClick={() => setActiveCategory(cat.n)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition flex items-center gap-2 ${
                    activeCategory === cat.n
                      ? "bg-white text-slate-900 font-bold shadow-lg"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{cat.e}</span>
                  <span>{cat.n}</span>
                </button>
              ))}
            </div>

            {/* Category Excuses List */}
            <div className="mt-8">
              {categoryExcuses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-3">
                  {categoryExcuses.map((e, i) => {
                    const text = e.text || e.t || "";
                    const score = e.score ?? e.s ?? 85;
                    const author = e.author || e.by || "@anonymous";
                    const verdict = e.verdict || (score >= 88 ? "Bulletproof Lie" : "High Plausibility");

                    return (
                      <Card key={e._id || `${text}-${i}`} className="flex h-full flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-[10px] uppercase tracking-wider text-pink-300 font-bold bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20">
                              {verdict}
                            </span>
                            <Ring s={score} />
                          </div>
                          <p className="mt-4 text-base font-medium leading-relaxed text-slate-100">“{text}”</p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-400">
                          <span>{author} · {e.saves} saves</span>
                          <div className="flex items-center gap-2">
                            <CopyButton text={text} />
                            <SaveButton
                              id={e._id}
                              token={token}
                              onSave={() => {
                                setCategoryExcuses((prev) =>
                                  prev.map((item) =>
                                    item._id && item._id === e._id ? { ...item, saves: item.saves + 1 } : item
                                  )
                                );
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="glass p-16 text-center rounded-3xl mt-6">
                  <div className="text-4xl">💭</div>
                  <h3 className="mt-4 text-xl font-bold text-white">No {activeCategory} excuses posted yet</h3>
                  <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
                    Be the first to submit a plausible excuse for this category and let the AI score it.
                  </p>
                  <button
                    onClick={() => {
                      setFormCategory(activeCategory);
                      setIsModalOpen(true);
                    }}
                    className="mt-6 btn-glow rounded-full bg-gradient-to-r from-violet to-hotpink px-6 py-2.5 text-xs font-semibold text-white"
                  >
                    Post First {activeCategory} Excuse
                  </button>
                </div>
              )}
            </div>
          </main>
        )}

        {/* ================= VIEW 2: NEW / FRESH SUBMISSIONS PAGE ================= */}
        {currentPage === "new" && (
          <main className="mx-auto max-w-6xl px-6 py-10 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-electric font-semibold">Live Community Submissions</span>
                <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mt-1">
                  ✨ Fresh Excuses Feed
                </h1>
                <p className="mt-2 text-slate-400">
                  Real-time excuses submitted by members across the globe, scored on the fly by AI.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="self-start rounded-full bg-gradient-to-r from-violet to-hotpink px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90"
              >
                + Submit New Excuse
              </button>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {(newExcuses.length > 0 ? newExcuses : excuses).map((e, i) => {
                const text = e.text || e.t || "";
                const score = e.score ?? e.s ?? 80;
                const category = e.category || e.cat || "General";
                const author = e.author || e.by || "@anonymous";
                const verdict = e.verdict || (score >= 88 ? "Bulletproof Lie" : "High Plausibility");

                return (
                  <Card key={e._id || `${text}-${i}`} className="flex h-full flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="w-fit rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-electric">
                            {category}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-pink-300 font-bold">
                            {verdict}
                          </span>
                        </div>
                        <Ring s={score} />
                      </div>
                      <p className="mt-4 text-base font-medium leading-relaxed text-slate-100">“{text}”</p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-400">
                      <span>{author} · {e.saves} saves</span>
                      <div className="flex items-center gap-2">
                        <CopyButton text={text} />
                        <SaveButton
                          id={e._id}
                          token={token}
                          onSave={() => {
                            setNewExcuses((prev) =>
                              prev.map((item) =>
                                item._id && item._id === e._id ? { ...item, saves: item.saves + 1 } : item
                              )
                            );
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </main>
        )}

        {/* ================= VIEW 3: LEADERBOARD PAGE ================= */}
        {currentPage === "leaderboard" && (
          <main className="mx-auto max-w-6xl px-6 py-10 min-h-screen">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Hall of Fame</span>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mt-1">
                🏆 Top Rated Excuses
              </h1>
              <p className="mt-2 text-slate-400">
                The all-time greatest alibis, tested and upvoted by thousands of community members.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {DEFAULT_RATED.map((e, i) => (
                <Card key={e.t || i} className="p-6 flex flex-col justify-between border-amber-500/20 bg-gradient-to-b from-white/5 to-amber-500/5">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-electric font-semibold">{e.cat}</span>
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        ★ {e.r}
                      </span>
                    </div>
                    <p className="mt-4 text-base font-medium leading-snug text-white">“{e.t}”</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-4">
                    <span className="font-semibold text-emerald-400">{e.s}% Plausible</span>
                    <CopyButton text={e.t || ""} />
                  </div>
                </Card>
              ))}
            </div>
          </main>
        )}

        {/* ================= VIEW 4: HOME & TRENDING PAGE ================= */}
        {currentPage === "home" && (
          <>
            {/* Hero */}
            <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6">
              <div className="grid-bg absolute inset-0" />
              <div className="orb -left-24 top-20 h-96 w-96 bg-violet" />
              <div className="orb right-0 top-1/3 h-80 w-80 bg-electric" style={{ animationDelay: "-5s" }} />
              <div className="orb bottom-0 left-1/3 h-72 w-72 bg-hotpink" style={{ animationDelay: "-9s" }} />
              
              <div className="relative max-w-4xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold text-pink-300 mb-6 backdrop-blur-sm">
                  <span>✨ AI-Powered Excuse Scoring Engine</span>
                </div>
                <h1 className="grad-text font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl">
                  Got an excuse? Make it plausible.
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
                  Trade, stress-test, and benchmark excuses with a community that takes believability seriously.
                  Our model scores every story for plausibility, creativity, and tone.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <a
                    href="#trending-section"
                    className="btn-glow rounded-full bg-gradient-to-r from-violet to-hotpink px-7 py-3.5 font-semibold text-white hover:-translate-y-0.5"
                  >
                    Explore Trending
                  </a>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-glow glass rounded-full px-7 py-3.5 font-semibold text-white hover:bg-white/10"
                  >
                    Score Your Excuse
                  </button>
                </div>
              </div>
            </section>

            {/* Dynamic Stats */}
            <section className="mx-auto max-w-6xl px-6 py-12">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Reveal d={0}>
                  <div className="glass p-6 text-center">
                    <div className="font-display text-4xl font-extrabold text-white">
                      <Counter to={platformStats.totalExcuses} suffix="+" dec={0} />
                    </div>
                    <div className="mt-2 text-sm text-slate-400">Excuses analyzed</div>
                  </div>
                </Reveal>
                <Reveal d={80}>
                  <div className="glass p-6 text-center">
                    <div className="font-display text-4xl font-extrabold text-white">
                      <Counter to={platformStats.totalUsers} suffix="+" dec={0} />
                    </div>
                    <div className="mt-2 text-sm text-slate-400">Active members</div>
                  </div>
                </Reveal>
                <Reveal d={160}>
                  <div className="glass p-6 text-center">
                    <div className="font-display text-4xl font-extrabold text-white">
                      <Counter to={platformStats.avgPlausibility} suffix="%" dec={0} />
                    </div>
                    <div className="mt-2 text-sm text-slate-400">Average plausibility</div>
                  </div>
                </Reveal>
                <Reveal d={240}>
                  <div className="glass p-6 text-center">
                    <div className="font-display text-4xl font-extrabold text-white">
                      <Counter to={4.8} suffix="/5" dec={1} />
                    </div>
                    <div className="mt-2 text-sm text-slate-400">Community trust rating</div>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* Trending Section (ONLY ON HOME PAGE) */}
            <section id="trending-section" className="mx-auto max-w-6xl px-6 py-16">
              <Reveal>
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-display text-4xl font-bold text-white">Trending Now</h2>
                    <p className="mt-2 text-slate-400">The most believable and saved excuses this week.</p>
                  </div>
                  <button
                    onClick={() => setCurrentPage("new")}
                    className="text-xs text-electric hover:underline font-semibold"
                  >
                    View All New →
                  </button>
                </div>
              </Reveal>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {excuses.slice(0, 6).map((e, i) => {
                  const text = e.text || e.t || "";
                  const score = e.score ?? e.s ?? 82;
                  const category = e.category || e.cat || "General";
                  const author = e.author || e.by || "@anonymous";
                  const verdict = e.verdict || (score >= 88 ? "Bulletproof Lie" : "High Plausibility");

                  return (
                    <Reveal key={e._id || `${text}-${i}`} d={i * 60}>
                      <Card className="flex h-full flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="w-fit rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-electric">
                                {category}
                              </span>
                              <span className="text-[10px] uppercase tracking-wider text-pink-300 font-bold">
                                {verdict}
                              </span>
                            </div>
                            <Ring s={score} />
                          </div>
                          <p className="mt-4 text-base font-medium leading-relaxed text-slate-100">“{text}”</p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-400">
                          <span>{author} · {e.saves} saves</span>
                          <div className="flex items-center gap-2">
                            <CopyButton text={text} />
                            <SaveButton
                              id={e._id}
                              token={token}
                              onSave={() => {
                                setExcuses((prev) =>
                                  prev.map((item) =>
                                    item._id && item._id === e._id ? { ...item, saves: item.saves + 1 } : item
                                  )
                                );
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    </Reveal>
                  );
                })}
              </div>
            </section>

            {/* Browse Categories (Clicking navigates to dedicated Category Page) */}
            <section className="mx-auto max-w-6xl px-6 py-16">
              <Reveal>
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="font-display text-4xl font-bold text-white">Browse by Category</h2>
                  <p className="mt-2 text-slate-400">Select any scenario to view its dedicated excuse catalog.</p>
                </div>
              </Reveal>
              <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                {CATEGORIES.map((c, i) => (
                  <Reveal key={c.n} d={i * 60}>
                    <button
                      onClick={() => {
                        setActiveCategory(c.n);
                        setCurrentPage("category");
                      }}
                      className={`w-full text-left group block rounded-2xl bg-gradient-to-br ${c.g} p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_40px_-5px_rgba(139,92,246,.6)]`}
                    >
                      <div className="text-4xl transition duration-300 group-hover:scale-110">{c.e}</div>
                      <div className="mt-6 font-display text-lg font-semibold text-white">{c.n}</div>
                      <div className="mt-1 text-xs text-white/70">View collection →</div>
                    </button>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Features */}
            <section className="mx-auto max-w-6xl px-6 py-16">
              <Reveal>
                <h2 className="font-display text-4xl font-bold text-white text-center">Why Plausible Works</h2>
              </Reveal>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {FEATURES.map((f, i) => (
                  <Reveal key={f.h} d={i * 80} className="h-full">
                    <div className="card h-full rounded-2xl bg-gradient-to-br from-violet via-hotpink to-electric p-px">
                      <div className="h-full rounded-2xl bg-[#14112a] p-7">
                        <div className="text-3xl">{f.i}</div>
                        <h3 className="mt-4 font-display text-xl font-semibold text-white">{f.h}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.p}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          </>
        )}

        <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-slate-500 mt-16">
          Plausible. Excuses, scored with a straight face.
        </footer>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="glass card relative w-full max-w-md rounded-3xl border border-white/20 p-8 shadow-2xl">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute right-5 top-5 text-2xl text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex border-b border-white/10 pb-4 gap-4">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`font-display text-lg font-bold pb-1 transition ${
                  authMode === "login"
                    ? "text-white border-b-2 border-pink-500"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
                className={`font-display text-lg font-bold pb-1 transition ${
                  authMode === "register"
                    ? "text-white border-b-2 border-pink-500"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              {authMode === "register" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="e.g. nightowl"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    required
                    value={authLoginInput}
                    onChange={(e) => setAuthLoginInput(e.target.value)}
                    placeholder="you@example.com or username"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-glow w-full rounded-xl bg-gradient-to-r from-violet to-hotpink py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {authLoading
                    ? "Authenticating..."
                    : authMode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Excuse Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="glass card relative w-full max-w-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSubmissionFeedback(null);
              }}
              className="absolute right-5 top-5 text-2xl text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <span>🧠</span>
              <span>Score & Publish Excuse</span>
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {currentUser
                ? `Publishing to the community feed as @${currentUser.username}.`
                : "Our AI model will analyze your excuse for believability and tone."}
            </p>

            {submissionFeedback && (
              <div className="mt-4 rounded-xl border border-pink-500/40 bg-pink-500/10 p-3 text-xs font-medium text-pink-300 flex items-center gap-2 animate-pulse">
                <span>⚡</span>
                <span>{submissionFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSubmitExcuse} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Excuse Story / Scenario
                </label>
                <textarea
                  required
                  rows={3}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. My alarm clock was converted to daylight savings prematurely."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Category Context
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-white focus:border-pink-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.n} value={cat.n}>
                        {cat.e} {cat.n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Author Credit
                  </label>
                  <input
                    type="text"
                    disabled={!!currentUser}
                    value={currentUser ? `@${currentUser.username}` : formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="@yourhandle"
                    className={`mt-1 w-full rounded-xl border border-white/10 p-3 text-sm text-white placeholder-slate-500 focus:outline-none ${
                      currentUser ? "bg-white/10 cursor-not-allowed text-pink-300 font-semibold" : "bg-white/5 focus:border-pink-500"
                    }`}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full px-5 py-2.5 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-glow rounded-full bg-gradient-to-r from-violet to-hotpink px-7 py-2.5 text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Evaluating..." : "Analyze & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
