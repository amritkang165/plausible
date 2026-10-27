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
  verdict?: string;
};

type UserProfile = {
  id: string;
  username: string;
  email: string;
};

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
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("trending");

  // Stats
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

  // Hydrate user from token
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
        // silent fallback
      }
    };
    fetchMe();
  }, [token]);

  // Load live excuses and stats
  const loadData = async (cat = selectedCategory, srt = selectedSort) => {
    try {
      const statusRes = await fetch("/api/status");
      if (statusRes.ok) {
        const data = await statusRes.json();
        setNetworkOnline(data.database?.connected ?? true);
      } else {
        setNetworkOnline(false);
      }
    } catch {
      setNetworkOnline(false);
    }

    try {
      const queryParams = new URLSearchParams();
      if (cat && cat !== "All") queryParams.append("category", cat);
      if (srt) queryParams.append("sort", srt);

      const excusesRes = await fetch(`/api/excuses?${queryParams.toString()}`);
      if (excusesRes.ok) {
        const items = await excusesRes.json();
        if (Array.isArray(items) && items.length > 0) {
          setExcuses(items);
        } else if (cat === "All") {
          setExcuses(DEFAULT_TRENDING);
        } else {
          setExcuses([]);
        }
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

  useEffect(() => {
    loadData(selectedCategory, selectedSort);
  }, [selectedCategory, selectedSort]);

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

  const activeExcuses = excuses.length > 0 ? excuses : DEFAULT_TRENDING;

  return (
    <>
      <div ref={glow} className="cursor-glow" />

      {/* Navigation */}
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "nav-on" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="#" className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-2xl">🎭</span>
              <span>Plausible</span>
            </a>
            {/* Live Platform Status Pill */}
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

          <div className="hidden gap-8 text-sm text-slate-300 md:flex">
            <a href="#trending" className="transition hover:text-white">Explore</a>
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
                href="#trending"
                className="btn-glow rounded-full bg-gradient-to-r from-violet to-hotpink px-7 py-3.5 font-semibold text-white hover:-translate-y-0.5"
              >
                Find an Excuse
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

        {/* Dynamic Platform Stats */}
        <section className="mx-auto max-w-6xl px-6 py-16">
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

        {/* Explore & Category Filter Section */}
        <section id="trending" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-4xl font-bold text-white">Community Excuses</h2>
                <p className="mt-2 text-slate-400">Browse live excuses stress-tested by members and rated by AI.</p>
              </div>

              {/* Sort pills */}
              <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 p-1 text-xs">
                <button
                  onClick={() => setSelectedSort("trending")}
                  className={`rounded-full px-3 py-1.5 transition ${
                    selectedSort === "trending" ? "bg-white/20 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Trending
                </button>
                <button
                  onClick={() => setSelectedSort("top")}
                  className={`rounded-full px-3 py-1.5 transition ${
                    selectedSort === "top" ? "bg-white/20 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Top Believability
                </button>
                <button
                  onClick={() => setSelectedSort("saves")}
                  className={`rounded-full px-3 py-1.5 transition ${
                    selectedSort === "saves" ? "bg-white/20 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Most Saved
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-8 flex flex-wrap gap-2 pb-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  selectedCategory === "All"
                    ? "bg-gradient-to-r from-violet to-hotpink text-white font-semibold shadow-[0_0_15px_rgba(236,72,153,.4)]"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.n}
                  onClick={() => setSelectedCategory(cat.n)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition flex items-center gap-1.5 ${
                    selectedCategory === cat.n
                      ? "bg-gradient-to-r from-violet to-hotpink text-white font-semibold shadow-[0_0_15px_rgba(236,72,153,.4)]"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{cat.e}</span>
                  <span>{cat.n}</span>
                </button>
              ))}
            </div>
          </Reveal>

          {/* Cards Grid */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {activeExcuses.map((e, i) => {
              const text = e.text || e.t || "";
              const score = e.score ?? e.s ?? 82;
              const category = e.category || e.cat || "General";
              const author = e.author || e.by || "@anonymous";
              const verdict = e.verdict || (score >= 88 ? "Bulletproof Lie" : score >= 80 ? "Corporate Gold" : "High Plausibility");

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
                      <span>
                        {author} · {e.saves} saves
                      </span>
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

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <h2 className="font-display text-4xl font-bold text-white">Why Plausible Works</h2>
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

        {/* Leaderboard */}
        <section id="rated" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <h2 className="font-display text-4xl font-bold text-white">All-Time Hall of Fame</h2>
            <p className="mt-2 text-slate-400">Excuses with the highest verified believability ratios.</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEFAULT_RATED.map((e, i) => (
              <Reveal key={e.t || i} d={i * 80}>
                <Card className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-electric font-medium">{e.cat}</span>
                      <span className="text-amber-300 font-semibold">★ {e.r}</span>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-snug text-white">“{e.t}”</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
                    <span>{e.s}% Believable</span>
                    <CopyButton text={e.t || ""} />
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <h2 className="font-display text-4xl font-bold text-white">Browse by Scenario</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.n} d={i * 80}>
                <button
                  onClick={() => {
                    setSelectedCategory(c.n);
                    const el = document.getElementById("trending");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`w-full text-left group block rounded-2xl bg-gradient-to-br ${c.g} p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_-5px_rgba(139,92,246,.6)]`}
                >
                  <div className="text-4xl transition duration-300 group-hover:scale-110">{c.e}</div>
                  <div className="mt-6 font-display text-lg font-semibold text-white">{c.n}</div>
                </button>
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
                Submit your excuse, let our AI rate its believability, and see how it ranks against the community.
              </p>
              <div className="relative mt-10 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-glow rounded-full bg-white px-7 py-3.5 font-semibold text-slate-900 hover:-translate-y-0.5"
                >
                  Score an Excuse
                </button>
                <a
                  href="#trending"
                  className="btn-glow glass rounded-full px-7 py-3.5 font-semibold text-white hover:bg-white/10"
                >
                  Browse Top Excuses
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

      {/* Realistic Submit Excuse Modal */}
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
