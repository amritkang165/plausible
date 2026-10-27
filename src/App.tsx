import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

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
};

type UserProfile = {
  id: string;
  username: string;
  email: string;
};

const DEFAULT_TRENDING: Excuse[] = [
  { t: "My cat submitted the expense report. Accounting is reviewing it.", s: 91, cat: "Pets", by: "@nightowl", saves: 412 },
  { t: "The printer ate my homework, then it ate the printer.", s: 78, cat: "School", by: "@brokenbeat", saves: 287 },
  { t: "I was stuck in a two-hour meeting about meetings. That's how I got here.", s: 84, cat: "Work", by: "@tabsnotspaces", saves: 359 },
];

const DEFAULT_RATED: Excuse[] = [
  { t: "Ring road traffic was a sentient being today.", s: 88, cat: "Travel", r: "4.9", saves: 198 },
  { t: "My phone hit 1%, so I was emotionally unavailable.", s: 73, cat: "Dating", r: "4.7", saves: 145 },
  { t: "The gym was closed for emotional reasons.", s: 69, cat: "Health", r: "4.6", saves: 210 },
  { t: "The Wi-Fi password was the excuse. I was the password.", s: 81, cat: "Tech", r: "4.8", saves: 320 },
];

const CATEGORIES = [
  { e: "💼", n: "Work", g: "from-violet-600 to-indigo-700" },
  { e: "🎒", n: "School", g: "from-pink-600 to-rose-700" },
  { e: "💘", n: "Dating", g: "from-fuchsia-600 to-pink-700" },
  { e: "🐾", n: "Pets", g: "from-amber-500 to-orange-600" },
  { e: "✈️", n: "Travel", g: "from-cyan-600 to-blue-700" },
  { e: "🩺", n: "Health", g: "from-emerald-500 to-teal-700" },
  { e: "💻", n: "Tech", g: "from-indigo-500 to-cyan-600" },
  { e: "🏠", n: "Family", g: "from-rose-500 to-violet-700" },
];

const STATS = [
  { n: 12480, s: "", l: "Excuses analyzed", d: 0 },
  { n: 38200, s: "", l: "Members", d: 0 },
  { n: 74, s: "%", l: "Average plausibility", d: 0 },
  { n: 4.8, s: "/5", l: "Community rating", d: 1 },
];

const FEATURES = [
  { i: "🧠", h: "AI scoring", p: "Every excuse gets a believability, creativity and originality score, so you know exactly where it stands." },
  { i: "🗳️", h: "Community voting", p: "Members upvote, remix and retire. Good lies get sharper, weak ones quietly disappear." },
  { i: "🔗", h: "Built to share", p: "Each excuse becomes a card you can save, send or pin to the group chat." },
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
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  
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

  const glow = useRef<HTMLDivElement>(null);

  // Fetch logged in user when token changes
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
          // Token invalid or expired
          localStorage.removeItem("plausible_token");
          setToken(null);
          setCurrentUser(null);
        }
      } catch {
        // network issue, keep token
      }
    };
    fetchMe();
  }, [token]);

  // Check database connection and fetch initial data
  const loadData = async () => {
    try {
      const statusRes = await fetch("/api/status");
      if (statusRes.ok) {
        const data = await statusRes.json();
        setDbConnected(data.database?.connected ?? false);
      } else {
        setDbConnected(false);
      }
    } catch {
      setDbConnected(false);
    }

    try {
      const excusesRes = await fetch("/api/excuses");
      if (excusesRes.ok) {
        const items = await excusesRes.json();
        if (Array.isArray(items) && items.length > 0) {
          setExcuses(items);
          return;
        }
      }
    } catch {
      // fallback
    }
    setExcuses(DEFAULT_TRENDING);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

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
    const body = authMode === "login"
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
      setAuthError("Failed to reach server.");
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
        setExcuses((prev) => [newExcuse, ...prev]);
        setFormText("");
        setFormAuthor("");
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit excuse");
      }
    } catch (err) {
      alert("Error submitting to server. Make sure the backend and MongoDB are running.");
    } finally {
      setSubmitting(false);
    }
  };

  const trendingList = excuses.length > 0 ? excuses.slice(0, 6) : DEFAULT_TRENDING;
  const ratedList = DEFAULT_RATED;

  return (
    <>
      <div ref={glow} className="cursor-glow" />

      {/* Navigation */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "nav-on" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="#" className="font-display text-xl font-bold text-white">Plausible</a>
            {/* MongoDB Connection Status Pill */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  dbConnected === true
                    ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                    : dbConnected === false
                    ? "bg-amber-400"
                    : "bg-slate-400 animate-pulse"
                }`}
              />
              <span className="text-slate-300">
                {dbConnected === true
                  ? "MongoDB Connected"
                  : dbConnected === false
                  ? "MongoDB Offline"
                  : "Checking DB..."}
              </span>
            </div>
          </div>

          <div className="hidden gap-8 text-sm text-slate-300 md:flex">
            <a href="#trending" className="transition hover:text-white">Trending</a>
            <a href="#categories" className="transition hover:text-white">Categories</a>
            <a href="#rated" className="transition hover:text-white">Leaderboard</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
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

      <div className="relative z-10">
        {/* Hero */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24">
          <div className="grid-bg absolute inset-0" />
          <div className="orb -left-24 top-20 h-96 w-96 bg-violet" />
          <div className="orb right-0 top-1/3 h-80 w-80 bg-electric" style={{ animationDelay: "-5s" }} />
          <div className="orb bottom-0 left-1/3 h-72 w-72 bg-hotpink" style={{ animationDelay: "-9s" }} />
          <div className="relative max-w-4xl text-center">
            <h1 className="grad-text font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl">
              Got an excuse? Make it plausible.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
              Trade, test and score excuses with a community that takes creativity seriously. Our AI rates each one for
              believability, creativity and originality, so the best lies rise to the top.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#trending"
                className="btn-glow rounded-full bg-gradient-to-r from-violet to-hotpink px-7 py-3.5 font-semibold text-white hover:-translate-y-0.5"
              >
                Find an Excuse
              </a>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-glow glass rounded-full px-7 py-3.5 font-semibold text-white hover:bg-white/10"
              >
                Submit Your Own
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.l} d={i * 80}>
                <div className="glass p-6 text-center">
                  <div className="font-display text-4xl font-extrabold text-white">
                    <Counter to={s.n} suffix={s.s} dec={s.d} />
                  </div>
                  <div className="mt-2 text-sm text-slate-400">{s.l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section id="trending" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-4xl font-bold text-white">Trending now</h2>
                <p className="mt-2 text-slate-400">The excuses everyone is quoting this week.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                + New Excuse
              </button>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {trendingList.map((e, i) => {
              const text = e.text || e.t || "";
              const score = e.score ?? e.s ?? 80;
              const category = e.category || e.cat || "General";
              const author = e.author || e.by || "@anonymous";
              return (
                <Reveal key={e._id || `${text}-${i}`} d={i * 80}>
                  <Card className="flex h-full flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-electric">{category}</span>
                        <Ring s={score} />
                      </div>
                      <p className="mt-5 text-lg font-medium leading-snug text-white">{text}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
                      <span>
                        {author} · {e.saves} saves
                      </span>
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
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <h2 className="font-display text-4xl font-bold text-white">Why Plausible?</h2>
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

        {/* Highest rated */}
        <section id="rated" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <h2 className="font-display text-4xl font-bold text-white">Highest rated</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ratedList.map((e, i) => (
              <Reveal key={e.t || i} d={i * 80}>
                <Card className="p-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-electric">{e.cat}</span>
                    <span className="text-amber-300">★ {e.r}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-snug text-white">{e.t}</p>
                  <div className="mt-4 text-xs text-slate-400">Plausibility {e.s}%</div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <h2 className="font-display text-4xl font-bold text-white">Browse categories</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.n} d={i * 80}>
                <a
                  href="#trending"
                  className={`group block rounded-2xl bg-gradient-to-br ${c.g} p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_-5px_rgba(139,92,246,.6)]`}
                >
                  <div className="text-4xl transition duration-300 group-hover:scale-110">{c.e}</div>
                  <div className="mt-6 font-display text-lg font-semibold text-white">{c.n}</div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="submit" className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet/40 via-[#16112e] to-hotpink/30 px-8 py-20 text-center">
              <div className="orb -right-20 -top-20 h-72 w-72 bg-hotpink" />
              <div className="orb -bottom-24 left-0 h-72 w-72 bg-electric" style={{ animationDelay: "-6s" }} />
              <h2 className="relative font-display text-4xl font-extrabold text-white sm:text-6xl">
                Your next excuse deserves an audience.
              </h2>
              <p className="relative mx-auto mt-5 max-w-lg text-slate-300">
                Submit it, get scored by the AI, and let the community decide how far it goes.
              </p>
              <div className="relative mt-10 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-glow rounded-full bg-white px-7 py-3.5 font-semibold text-slate-900 hover:-translate-y-0.5"
                >
                  Start submitting
                </button>
                <a
                  href="#rated"
                  className="btn-glow glass rounded-full px-7 py-3.5 font-semibold text-white hover:bg-white/10"
                >
                  Browse the leaderboard
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-slate-500">
          Plausible. Excuses, scored with a straight face.
        </footer>
      </div>

      {/* Auth Modal (Sign In / Sign Up) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="glass card relative w-full max-w-md rounded-3xl border border-white/20 p-8 shadow-2xl">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute right-5 top-5 text-2xl text-slate-400 hover:text-white"
            >
              ✕
            </button>

            {/* Tabs */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="glass card relative w-full max-w-lg rounded-3xl border border-white/20 p-8 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-2xl text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="font-display text-2xl font-bold text-white">Submit an Excuse</h3>
            <p className="mt-1 text-sm text-slate-400">
              {currentUser
                ? `Posting as @${currentUser.username} and saving to your MongoDB profile.`
                : "This will be stored in your MongoDB Atlas database and AI-scored."}
            </p>

            <form onSubmit={handleSubmitExcuse} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Excuse</label>
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Category</label>
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Author</label>
                  <input
                    type="text"
                    disabled={!!currentUser}
                    value={currentUser ? `@${currentUser.username}` : formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="@username"
                    className={`mt-1 w-full rounded-xl border border-white/10 p-3 text-sm text-white placeholder-slate-500 focus:outline-none ${
                      currentUser ? "bg-white/10 cursor-not-allowed text-pink-300" : "bg-white/5 focus:border-pink-500"
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
                  className="btn-glow rounded-full bg-gradient-to-r from-violet to-hotpink px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Scoring..." : "Submit to MongoDB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
