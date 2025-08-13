"use client";
import React, { useEffect, useMemo, useState } from "react";
import { fetchResultByUser } from "@/utils/api";
import CommonLoader from "@/commonLoader";

/* ================== helpers ================== */
const round = (n, d = 0) => Number(Number(n || 0).toFixed(d));
const pct = (num, den) => (den > 0 ? (num / den) * 100 : 0);
const parseJSON = (maybeJSON) => {
  if (!maybeJSON) return {};
  if (typeof maybeJSON === "object") return maybeJSON;
  try {
    return JSON.parse(maybeJSON);
  } catch {
    return {};
  }
};

// Parse "11th Physics" | "12th Biology" -> { grade: '11th' | '12th', subject: 'Physics'|'Chemistry'|'Biology' }
const parseSubjectName = (s = "") => {
  const t = String(s).toLowerCase();
  const grade =
    t.includes("11th") || /\b11\b/.test(t)
      ? "11th"
      : t.includes("12th") || /\b12\b/.test(t)
      ? "12th"
      : null;

  let subject = null;
  if (t.includes("physics")) subject = "Physics";
  else if (t.includes("chemistry")) subject = "Chemistry";
  else if (t.includes("biology")) subject = "Biology";

  return { grade, subject };
};

const SUBJECTS = ["Physics", "Chemistry", "Biology"];
const SUBJECT_COLORS = {
  Physics: {
    main: "#7C3AED",
    bg: "from-violet-500/20 to-violet-500/10",
    ring: "#7C3AED",
  },
  Chemistry: {
    main: "#F59E0B",
    bg: "from-amber-500/20 to-amber-500/10",
    ring: "#F59E0B",
  },
  Biology: {
    main: "#10B981",
    bg: "from-emerald-500/20 to-emerald-500/10",
    ring: "#10B981",
  },
};
const FACTOR = { Physics: 1.8, Chemistry: 1.8, Biology: 3.6 };

/* ================== UI bits ================== */
const Donut = ({ value = 0, size = 92, stroke = 10, color = "#7C3AED" }) => {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - v / 100);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="subject accuracy"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#ECEAF6"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 450ms ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-[#1F1147]"
        style={{ fontWeight: 800, fontSize: 14 }}
      >
        {round(v)}%
      </text>
    </svg>
  );
};

const StatPill = ({ label, value }) => (
  <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/70 border border-white/60 shadow-sm text-[#2A175C]">
    {label}: <b className="ml-1">{value}</b>
  </div>
);

const SubjectCard = ({ subject, acc11, acc12, avgAcc, score }) => {
  const c = SUBJECT_COLORS[subject];
  return (
    <div className="group relative">
      <div
        className={`absolute inset-0 blur-xl opacity-60 bg-gradient-to-br ${c.bg} rounded-3xl scale-95 group-hover:scale-100 transition-transform`}
      />
      <div className="relative bg-white rounded-3xl border border-[#E8E3FF] p-5 shadow-[0_8px_30px_rgb(2,0,80,0.06)] transition-transform group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-[#2A175C]">{subject}</h3>
          {/* <span className="text-xs px-2 py-1 rounded-lg bg-[#F5F3FF] text-[#6D28D9] border border-[#E8E3FF]">
            factor × {FACTOR[subject]}
          </span> */}
        </div>

        <div className="flex items-center gap-5">
          <Donut value={avgAcc} color={c.ring} />
          <div className="flex-1">
            <p className="text-md text-gray-500">Estimated {subject} Score</p>
            <div className="mt-3 inline-flex items-center gap-2">
              <span className="text-2xl font-extrabold text-[#2A175C] leading-none">
                {round(score)}
              </span>
              <span className="text-[14px] text-gray-500">
                / {subject === "Biology" ? 360 : 180}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">11th Accuracy</span>
                <b className="text-black/55">{round(acc11, 2)}%</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">12th Accuracy</span>
                <b className="text-black/55">{round(acc12, 2)}%</b>
              </div>
            </div>

            <div
              className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden"
              aria-hidden
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(6, Math.min(100, avgAcc))}%`,
                  background: c.main,
                  boxShadow: "0 0 0 3px rgba(0,0,0,0.04) inset",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================== page ================== */
export default function NeetScorePredictorPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const id =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!id) {
      setLoading(false);
      setError("User not found. Please sign in again.");
      return;
    }
    let alive = true;
    (async () => {
      try {
        setError("");
        const res = await fetchResultByUser(parseInt(id, 10));
        const data = Array.isArray(res?.data) ? res.data : [];
        if (alive) setTests(data);
      } catch (e) {
        if (alive)
          setError("Could not fetch your test results. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const view = useMemo(() => {
    // Tallies by subject & grade
    const T = {
      Physics: { "11th": { a: 0, c: 0 }, "12th": { a: 0, c: 0 } },
      Chemistry: { "11th": { a: 0, c: 0 }, "12th": { a: 0, c: 0 } },
      Biology: { "11th": { a: 0, c: 0 }, "12th": { a: 0, c: 0 } },
    };
    let subjectRows = 0;

    for (const t of tests) {
      const bySubject = parseJSON(t?.resultsBySubject);
      for (const item of Object.values(bySubject || {})) {
        const { grade, subject } = parseSubjectName(item?.subjectName);
        if (!subject || !grade) continue;

        const attempted =
          Number(item?.attempted) ||
          (Number(item?.correct) || 0) + (Number(item?.wrong) || 0);
        const correct = Number(item?.correct) || 0;

        T[subject][grade].a += attempted;
        T[subject][grade].c += correct;
        subjectRows++;
      }
    }

    // Per-grade accuracies (only from that grade)
    const acc11 = {
      Physics: pct(T.Physics["11th"].c, T.Physics["11th"].a),
      Chemistry: pct(T.Chemistry["11th"].c, T.Chemistry["11th"].a),
      Biology: pct(T.Biology["11th"].c, T.Biology["11th"].a),
    };
    const acc12 = {
      Physics: pct(T.Physics["12th"].c, T.Physics["12th"].a),
      Chemistry: pct(T.Chemistry["12th"].c, T.Chemistry["12th"].a),
      Biology: pct(T.Biology["12th"].c, T.Biology["12th"].a),
    };

    // Subject accuracy = average of available grades (if one grade is missing, use the available one)
    const avgAcc = (s) => {
      const vals = [acc11[s], acc12[s]].filter((v) => v > 0);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };
    const avg = {
      Physics: avgAcc("Physics"),
      Chemistry: avgAcc("Chemistry"),
      Biology: avgAcc("Biology"),
    };

    // Estimated scores (bounded to each subject’s max)
    const sPhysics = Math.min(180, avg.Physics * FACTOR.Physics);
    const sChem = Math.min(180, avg.Chemistry * FACTOR.Chemistry);
    const sBio = Math.min(360, avg.Biology * FACTOR.Biology);

    const total = Math.min(720, sPhysics + sChem + sBio);
    const meanAcc = (avg.Physics + avg.Chemistry + avg.Biology) / 3 || 0;

    return {
      counts: { testsLoaded: tests.length, subjectRows },
      acc11,
      acc12,
      avg,
      scores: {
        Physics: round(sPhysics),
        Chemistry: round(sChem),
        Biology: round(sBio),
      },
      total: round(total),
      meanAcc: round(meanAcc, 1),
    };
  }, [tests]);

  /* ================== states ================== */
  if (loading) {
    return (
      <div className="container pt-6">
        <CommonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-6 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="text-red-500"
            >
              <path
                fill="currentColor"
                d="M12 9v4m0 4h.01M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <h2 className="font-semibold text-[#2A175C] mb-1">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600">{error}</p>
          <a
            href="/user/dashboard"
            className="inline-flex mt-4 px-4 py-2 rounded-lg bg-[#2A175C] text-white hover:bg-[#2A175C]/90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (view.counts.testsLoaded === 0 || view.counts.subjectRows === 0) {
    return (
      <div className="relative w-full h-[420px] overflow-hidden">
        <img
          src="/images/progress.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-70"
        />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-2xl font-bold text-gray-800">No data yet</h2>
          <p className="text-gray-600 mt-2">
            Take a test to see your personalized NEET score prediction.
          </p>
          <a
            href="/user/dashboard"
            className="mt-6 px-6 py-2 bg-[#2A175C] text-white font-medium rounded-lg hover:bg-[#2A175C]/90"
          >
            Practice Now
          </a>
        </div>
      </div>
    );
  }

  /* ================== UI ================== */
  return (
    <div className=" ">
      {/* Hero */}
      <header className="bg-gradient-to-br from-[#EBDDFF] to-[#F4F0FF] border-b border-[#E8E3FF]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#2A175C]">
                NEET Score Predictor
              </h1>
              <p className="text-sm text-[#2A175C]/70 mt-1">
                Based on your 11th & 12th accuracy per subject from test
                history.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatPill label="Tests" value={view.counts.testsLoaded} />
              <StatPill label="Subject rows" value={view.counts.subjectRows} />
              <StatPill label="Avg accuracy" value={`${view.meanAcc}%`} />
            </div>
          </div>

          {/* Summary Card */}
          <div className="mt-5 bg-white border border-[#E8E3FF] rounded-3xl p-5 shadow-[0_8px_30px_rgb(2,0,80,0.06)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2A175C] text-white flex items-center justify-center shadow-md">
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path
                      d="M4 12h16M4 6h10M4 18h7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Predicted Total</p>
                  <div className="text-2xl font-extrabold text-[#2A175C] leading-none">
                    {view.total}{" "}
                    <span className="text-sm font-bold text-gray-500">
                      / 720
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {SUBJECTS.map((s) => (
                  <div
                    key={s}
                    className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm flex items-center justify-between gap-3"
                  >
                    <span className="text-gray-600">{s}</span>
                    <b className="text-[#2A175C]">{view.scores[s]}</b>
                  </div>
                ))}
              </div>

              <a
                href="/user/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#2A175C] text-white hover:bg-[#2A175C]/90 shadow-sm"
              >
                Improve Score
                <svg
                  className="ml-2"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Subject Cards */}
      <main className=" mx-auto pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBJECTS.map((s) => (
            <SubjectCard
              key={s}
              subject={s}
              acc11={view.acc11[s]}
              acc12={view.acc12[s]}
              avgAcc={view.avg[s]}
              score={view.scores[s]}
            />
          ))}
        </div>

        {/* Formula + Notes */}
        <section className="mt-8">
          <div className="bg-white border border-[#E8E3FF] rounded-3xl p-5">
            <h3 className="font-semibold text-[#2A175C]">How we calculate</h3>
            <ul className="list-disc ml-5 mt-2 text-sm text-gray-700 space-y-1">
              <li>
                <b>11th Accuracy</b> and <b>12th Accuracy</b> are computed per
                subject from your attempted questions only (
                <i>correct ÷ attempted × 100</i>).
              </li>
              <li>
                <b>Subject accuracy</b> = average of available grades:
                <br />• both available → <code>(11th% + 12th%) / 2</code>
                <br />• only one available → that grade’s %.
              </li>
              <li>
                Estimated scores: Physics = <code>accuracy × 1.8</code>,
                Chemistry = <code>accuracy × 1.8</code>, Biology ={" "}
                <code>accuracy × 3.6</code>.
              </li>
              <li>
                Totals are capped at each subject’s max (180/180/360) and
                overall 720.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
