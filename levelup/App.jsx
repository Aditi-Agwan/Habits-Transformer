import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------------------------------------------------------------- data --- */

const CATS = [
  { id: "wakeup", emoji: "🌅", name: "Wakeup", base: 10, color: "#3987e5", hint: "On time · no snooze · no phone-first" },
  { id: "workout", emoji: "💪", name: "Workout", base: 25, color: "#d95926", hint: "Any movement counts — even a 15-min walk" },
  { id: "work", emoji: "💼", name: "Work", base: 25, color: "#199e70", hint: "Focus · discipline · extra learning" },
  { id: "personal", emoji: "🌱", name: "Personal", base: 25, color: "#c98500", hint: "Reading · phone · water · food · hobby" },
  { id: "sleep", emoji: "😴", name: "Sleep", base: 15, color: "#d55181", hint: "In bed on time · enough sleep · phone away" },
];

const LEVELS = [
  { min: 0, emoji: "🌱", name: "Getting Started" },
  { min: 501, emoji: "🌿", name: "Building" },
  { min: 1001, emoji: "💪", name: "Consistent" },
  { min: 1501, emoji: "🔥", name: "Strong" },
  { min: 2001, emoji: "🏆", name: "Disciplined" },
  { min: 2501, emoji: "👑", name: "LEVEL UP" },
];

const DAYS = 30;
const STORE_KEY = "levelup30.v1";

/* --------------------------------------------------------------- dates --- */

const toKey = (d) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const fromKey = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (k, n) => {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
};
const diffDays = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);
const prettyDate = (k) =>
  fromKey(k).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

/* --------------------------------------------------------------- store --- */

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupted storage falls through to a fresh start */
  }
  return { name: "", startDate: null, days: {}, weights: {} };
};

/* ------------------------------------------------------------- helpers --- */

const baseWeights = () => Object.fromEntries(CATS.map((c) => [c.id, c.base]));

const levelFor = (pts) => {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (pts >= l.min) cur = l;
  return cur;
};
const nextLevel = (pts) => LEVELS.find((l) => l.min > pts) || null;

// Heat ramp for the 30-day grid: sequential blue, lighter = higher score on
// the dark surface. Zero/unlogged days stay as outlined empty cells.
const heatColor = (t) => {
  if (t >= 90) return "#9ec5f4";
  if (t >= 75) return "#6da7ec";
  if (t >= 55) return "#3987e5";
  if (t >= 30) return "#256abf";
  return "#184f95";
};

/* ----------------------------------------------------------------- app --- */

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState("today");
  const [selKey, setSelKey] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state]);

  const todayKey = toKey(new Date());

  const derived = useMemo(() => {
    if (!state.startDate) return null;
    const start = state.startDate;
    const end = addDays(start, DAYS - 1);
    const todayIdx = diffDays(start, todayKey); // 0-based; may be <0 or >29
    const weightsFor = (week) => ({ ...baseWeights(), ...(state.weights[week] || {}) });
    const weekOf = (idx) => Math.floor(idx / 7) + 1; // weeks 1..5 (week 5 = days 29-30
    const dayScore = (idx) => {
      const key = addDays(start, idx);
      const entry = state.days[key];
      if (!entry) return null;
      const w = weightsFor(weekOf(idx));
      let total = 0;
      for (const c of CATS) total += Math.min(entry[c.id] || 0, w[c.id]);
      return total;
    };
    const totals = Array.from({ length: DAYS }, (_, i) => dayScore(i));
    const grand = totals.reduce((s, t) => s + (t || 0), 0);
    const loggedCount = totals.filter((t) => t != null).length;

    // Streak: consecutive logged days (>0 pts) ending at today or yesterday.
    let streak = 0;
    let cursor = Math.min(todayIdx, DAYS - 1);
    if (cursor >= 0 && totals[cursor] == null) cursor -= 1; // today not logged yet is fine
    while (cursor >= 0 && totals[cursor] != null && totals[cursor] > 0) {
      streak += 1;
      cursor -= 1;
    }

    return { start, end, todayIdx, weightsFor, weekOf, totals, grand, loggedCount, streak };
  }, [state, todayKey]);

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast.t);
    showToast.t = window.setTimeout(() => setToast(""), 2200);
  };

  if (!state.startDate) {
    return (
      <Shell toast={toast}>
        <Onboarding
          onStart={(name, startDate) => {
            setState((s) => ({ ...s, name, startDate }));
            setSelKey(null);
          }}
        />
      </Shell>
    );
  }

  const { start, todayIdx } = derived;
  const clampIdx = (i) => Math.max(0, Math.min(i, DAYS - 1, Math.max(todayIdx, 0)));
  const selectedKey = selKey ?? addDays(start, clampIdx(todayIdx));
  const selIdx = diffDays(start, selectedKey);

  const setScore = (dayKey, catId, value) =>
    setState((s) => ({
      ...s,
      days: { ...s.days, [dayKey]: { ...(s.days[dayKey] || {}), [catId]: value } },
    }));

  const setWeekWeights = (week, weights) =>
    setState((s) => ({ ...s, weights: { ...s.weights, [week]: weights } }));

  const reset = () => {
    if (window.confirm("Reset the whole challenge? All logged points on this device will be erased.")) {
      localStorage.removeItem(STORE_KEY);
      setState({ name: "", startDate: null, days: {}, weights: {} });
      setSelKey(null);
      setTab("today");
    }
  };

  return (
    <Shell toast={toast}>
      <header className="top">
        <div>
          <h1>Level-Up 30</h1>
          <p className="sub">
            {state.name ? `${state.name} · ` : ""}Day {Math.min(Math.max(todayIdx + 1, 1), DAYS)} of {DAYS}
          </p>
        </div>
        <div className="level-chip" title="Your current level">
          <span className="level-emoji">{levelFor(derived.grand).emoji}</span>
          <span>{levelFor(derived.grand).name}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <a href="alternate/index.html" className="ghost" style={{textDecoration: 'none', padding: '6px 10px'}}>Two-player</a>
        </div>
      </header>

      <nav className="tabs" role="tablist">
        {[
          ["today", "Today"],
          ["journey", "Journey"],
          ["weeks", "Weeks"],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "tab active" : "tab"}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "today" && (
        <TodayView
          state={state}
          derived={derived}
          selIdx={selIdx}
          selectedKey={selectedKey}
          onNav={(dir) => setSelKey(addDays(start, clampIdx(selIdx + dir)))}
          onScore={setScore}
        />
      )}
      {tab === "journey" && (
        <JourneyView
          derived={derived}
          onPickDay={(idx) => {
            if (idx <= todayIdx) {
              setSelKey(addDays(start, idx));
              setTab("today");
            }
          }}
        />
      )}
      {tab === "weeks" && (
        <WeeksView state={state} derived={derived} onWeights={setWeekWeights} onToast={showToast} />
      )}

      <footer className="foot">
        <BackupControls state={state} setState={setState} onToast={showToast} />
        <button className="ghost danger" onClick={reset}>Reset challenge</button>
        <p className="fine">All data lives only in this browser — nothing is uploaded anywhere.</p>
      </footer>
    </Shell>
  );
}

/* --------------------------------------------------------------- shell --- */

function Shell({ children, toast }) {
  return (
    <div className="wrap">
      {children}
      <div className={toast ? "toast show" : "toast"} role="status">{toast}</div>
    </div>
  );
}

/* ---------------------------------------------------------- onboarding --- */

function Onboarding({ onStart }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(toKey(new Date()));

  return (
    <div className="onboard">
      <div className="hero">🚀</div>
      <h1>The 30-Day Level-Up Challenge</h1>
      <p className="tagline">30 days. 100 points a day. One goal: become better than yesterday.</p>

      <div className="rules card">
        {CATS.map((c) => (
          <div className="rule-row" key={c.id}>
            <span className="rule-dot" style={{ background: c.color }} aria-hidden="true" />
            <span className="rule-name">{c.emoji} {c.name}</span>
            <span className="rule-pts">{c.base} pts</span>
          </div>
        ))}
        <div className="rule-row total">
          <span className="rule-name">⭐ Every day</span>
          <span className="rule-pts">100 pts</span>
        </div>
      </div>

      <label className="field">
        Your name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shubhankar" maxLength={24} />
      </label>
      <label className="field">
        Start date
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>

      <button className="primary big" onClick={() => onStart(name.trim(), startDate)} disabled={!startDate}>
        Start the challenge
      </button>
      <p className="fine">
        Score yourself honestly — a real 32 beats a fake 72. 😉<br />
        Everything is saved in this browser only. No accounts, no servers.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- today --- */

const QUOTES = [
  "Don't quit because you had a bad day.",
  "73 today → 80 tomorrow → 85 next week.",
  "You're competing against your previous version.",
  "Never let one bad day become a bad week.",
  "Just earn today's 100 points.",
  "Show up. Earn points. Improve. Repeat.",
];

function TodayView({ state, derived, selIdx, selectedKey, onNav, onScore }) {
  const { todayIdx, weightsFor, weekOf } = derived;

  if (todayIdx < 0) {
    const wait = -todayIdx;
    return (
      <div className="card center-card">
        <div className="hero">⏳</div>
        <h2>Starts {prettyDate(state.startDate)}</h2>
        <p className="sub">{wait} day{wait === 1 ? "" : "s"} to go. Rest up — day 1 is coming.</p>
      </div>
    );
  }

  const weights = weightsFor(weekOf(selIdx));
  const entry = state.days[selectedKey] || {};
  const scores = CATS.map((c) => Math.min(entry[c.id] || 0, weights[c.id]));
  const total = scores.reduce((a, b) => a + b, 0);
  const done = todayIdx >= DAYS;

  return (
    <>
      {done && (
        <div className="card center-card banner">
          🎉 The 30 days are complete — check <strong>Journey</strong> for the final score. You can still edit past days below.
        </div>
      )}

      <div className="daynav">
        <button className="ghost" onClick={() => onNav(-1)} disabled={selIdx <= 0} aria-label="Previous day">‹</button>
        <div className="daynav-label">
          <strong>Day {selIdx + 1}</strong>
          <span>{prettyDate(selectedKey)}{selIdx === todayIdx ? " · today" : ""}</span>
        </div>
        <button className="ghost" onClick={() => onNav(1)} disabled={selIdx >= Math.min(todayIdx, DAYS - 1)} aria-label="Next day">›</button>
      </div>

      <div className="card score-card">
        <div className="score-head">
          <span className="score-big">{total}</span>
          <span className="score-max">/ 100</span>
        </div>
        <div className="stack" aria-hidden="true">
          {CATS.map((c, i) =>
            scores[i] > 0 ? (
              <div key={c.id} className="stack-seg" style={{ width: `${scores[i]}%`, background: c.color }} />
            ) : null
          )}
        </div>
        <p className="quote">“{QUOTES[selIdx % QUOTES.length]}”</p>
      </div>

      {CATS.map((c, i) => (
        <div className="card cat" key={c.id}>
          <div className="cat-head">
            <span className="cat-name">
              <span className="rule-dot" style={{ background: c.color }} aria-hidden="true" />
              {c.emoji} {c.name}
            </span>
            <span className="cat-pts" style={{ color: c.color }}>
              {scores[i]} <span className="cat-max">/ {weights[c.id]}</span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={weights[c.id]}
            value={scores[i]}
            style={{ accentColor: c.color }}
            aria-label={`${c.name} points`}
            onChange={(e) => onScore(selectedKey, c.id, Number(e.target.value))}
          />
          <p className="hint">{c.hint}</p>
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------- journey --- */

function JourneyView({ derived, onPickDay }) {
  const { totals, grand, loggedCount, streak, todayIdx, start } = derived;
  const lvl = levelFor(grand);
  const next = nextLevel(grand);
  const avg = loggedCount ? Math.round((grand / loggedCount) * 10) / 10 : 0;
  const best = Math.max(0, ...totals.filter((t) => t != null));

  return (
    <>
      <div className="card center-card">
        <div className="hero">{lvl.emoji}</div>
        <h2>{lvl.name}</h2>
        <p className="score-big">{grand}<span className="score-max"> pts</span></p>
        {next ? (
          <>
            <div className="bar">
              <div
                className="bar-fill"
                style={{ width: `${Math.min(100, Math.round((grand / next.min) * 100))}%` }}
              />
            </div>
            <p className="sub">{next.min - grand} pts to {next.emoji} {next.name}</p>
          </>
        ) : (
          <p className="sub">Maximum level reached. 👑</p>
        )}
      </div>

      <div className="stats">
        <StatTile label="Streak" value={`${streak}`} unit={streak === 1 ? "day" : "days"} icon="🔥" />
        <StatTile label="Average" value={`${avg}`} unit="/ 100" icon="📊" />
        <StatTile label="Best day" value={`${best}`} unit="/ 100" icon="⭐" />
        <StatTile label="Logged" value={`${loggedCount}`} unit={`/ ${DAYS}`} icon="✅" />
      </div>

      <div className="card">
        <h3>The 30 days</h3>
        <div className="grid30">
          {totals.map((t, i) => {
            const future = i > todayIdx;
            const cls = future ? "cell future" : t == null ? "cell empty" : "cell";
            return (
              <button
                key={i}
                className={cls}
                disabled={future}
                onClick={() => onPickDay(i)}
                style={t != null && t > 0 ? { background: heatColor(t), borderColor: "transparent" } : undefined}
                title={`Day ${i + 1} · ${prettyDate(addDays(start, i))}${t != null ? ` · ${t}/100` : " · not logged"}`}
                aria-label={`Day ${i + 1}, ${t != null ? `${t} points` : future ? "upcoming" : "not logged"}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="legend">
          <span>Less</span>
          {[20, 45, 65, 80, 95].map((t) => (
            <span key={t} className="legend-swatch" style={{ background: heatColor(t) }} />
          ))}
          <span>More</span>
        </div>
        <p className="fine">Tap a day to edit its points.</p>
      </div>
    </>
  );
}

function StatTile({ label, value, unit, icon }) {
  return (
    <div className="card stat">
      <span className="stat-icon" aria-hidden="true">{icon}</span>
      <span className="stat-value">
        {value} <span className="stat-unit">{unit}</span>
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* --------------------------------------------------------------- weeks --- */

function WeeksView({ state, derived, onWeights, onToast }) {
  const { totals, todayIdx, weightsFor, start } = derived;
  const currentWeek = Math.floor(Math.min(Math.max(todayIdx, 0), DAYS - 1) / 7) + 1;
  const weeks = [1, 2, 3, 4, 5];

  return (
    <>
      {weeks.map((w) => {
        const from = (w - 1) * 7;
        const to = Math.min(w * 7, DAYS) - 1; // week 5 is days 29-30
        const days = totals.slice(from, to + 1);
        const logged = days.filter((t) => t != null);
        const sum = logged.reduce((a, b) => a + b, 0);
        const maxPts = (to - from + 1) * 100;
        const avg = logged.length ? Math.round((sum / logged.length) * 10) / 10 : 0;
        const best = logged.length ? Math.max(...logged) : 0;

        const weights = weightsFor(w);
        const catTotals = CATS.map((c) => {
          let got = 0, max = 0;
          for (let i = from; i <= Math.min(to, todayIdx); i++) {
            const e = state.days[addDays(start, i)];
            if (e) {
              got += Math.min(e[c.id] || 0, weights[c.id]);
              max += weights[c.id];
            }
          }
          return { cat: c, got, max, pct: max ? got / max : null };
        });
        const scored = catTotals.filter((x) => x.pct != null);
        const weakest = scored.length >= 2 ? scored.reduce((a, b) => (b.pct < a.pct ? b : a)) : null;

        const workoutDays = countDays(state, start, from, Math.min(to, todayIdx), "workout", (v) => v > 0);
        const sleepDays = countDays(state, start, from, Math.min(to, todayIdx), "sleep", (v, max) => v >= 0.7 * max, weights);

        const status = w < currentWeek ? "past" : w === currentWeek ? "current" : "upcoming";

        return (
          <div className={`card week ${status}`} key={w}>
            <div className="week-head">
              <h3>
                Week {w}
                {status === "current" && <span className="pill">now</span>}
              </h3>
              <span className="week-total">
                {sum} <span className="cat-max">/ {maxPts}</span>
              </span>
            </div>

            {logged.length > 0 ? (
              <div className="week-stats">
                <span>📊 avg {avg}</span>
                <span>⭐ best {best}</span>
                <span>💪 workout {workoutDays}/{to - from + 1}</span>
                <span>😴 sleep {sleepDays}/{to - from + 1}</span>
              </div>
            ) : (
              <p className="sub">{status === "upcoming" ? "Not started yet." : "Nothing logged this week."}</p>
            )}

            {weakest && status !== "upcoming" && (
              <p className="weakest">
                🔴 Weakest area: <strong>{weakest.cat.emoji} {weakest.cat.name}</strong> ({Math.round(weakest.pct * 100)}%)
                {w < 5 && " — make it worth more next week ↓"}
              </p>
            )}

            {status !== "upcoming" && logged.length > 0 && (
              <button
                className="ghost"
                onClick={() => shareWeek(w, sum, maxPts, avg, best, workoutDays, sleepDays, to - from + 1, onToast)}
              >
                📋 Copy score to share
              </button>
            )}

            {status !== "past" && (
              <Rebalance week={w} weights={weights} onSave={(ws) => { onWeights(w, ws); onToast(`Week ${w} rebalanced ✔`); }} />
            )}
          </div>
        );
      })}
      <p className="fine">
        Every Sunday: find your weakest category, then make it worth more points for the coming week. Totals must still add up to 100.
      </p>
    </>
  );
}

function countDays(state, start, from, to, catId, pred, weights) {
  let n = 0;
  for (let i = from; i <= to; i++) {
    const e = state.days[addDays(start, i)];
    if (e && pred(e[catId] || 0, weights ? weights[catId] : 0)) n++;
  }
  return n;
}

function shareWeek(w, sum, maxPts, avg, best, workoutDays, sleepDays, len, onToast) {
  const text = [
    `Week ${w} — ${sum}/${maxPts} 🔥`,
    ``,
    `Workout: ${workoutDays}/${len}`,
    `Good sleep: ${sleepDays}/${len}`,
    `Best day: ${best}/100`,
    `Average: ${avg}`,
    ``,
    `Okay. Beat it. 😎`,
  ].join("\n");
  const fallback = () => window.prompt("Copy your score:", text);
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => onToast("Score copied — paste it in the group chat 😎"), fallback);
  } else {
    fallback();
  }
}

function Rebalance({ week, weights, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(weights);
  useEffect(() => setDraft(weights), [weights, open]);

  const sum = CATS.reduce((a, c) => a + draft[c.id], 0);
  const bump = (id, d) =>
    setDraft((x) => ({ ...x, [id]: Math.max(0, Math.min(60, x[id] + d)) }));

  if (!open) {
    return (
      <button className="ghost" onClick={() => setOpen(true)}>⚖️ Rebalance week {week}</button>
    );
  }
  return (
    <div className="rebalance">
      {CATS.map((c) => (
        <div className="reb-row" key={c.id}>
          <span className="rule-name">{c.emoji} {c.name}</span>
          <div className="stepper">
            <button className="ghost" onClick={() => bump(c.id, -5)} aria-label={`Decrease ${c.name}`}>−</button>
            <span className="reb-val">{draft[c.id]}</span>
            <button className="ghost" onClick={() => bump(c.id, 5)} aria-label={`Increase ${c.name}`}>+</button>
          </div>
        </div>
      ))}
      <div className={sum === 100 ? "reb-sum ok" : "reb-sum bad"}>Total: {sum} / 100</div>
      <div className="reb-actions">
        <button className="ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button className="primary" disabled={sum !== 100} onClick={() => { onSave(draft); setOpen(false); }}>
          Save
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- backup --- */

function BackupControls({ state, setState, onToast }) {
  const fileRef = useRef(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `levelup30-backup-${toKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== "object" || !("days" in data)) throw new Error("bad");
        setState({ name: data.name || "", startDate: data.startDate || null, days: data.days || {}, weights: data.weights || {} });
        onToast("Backup imported ✔");
      } catch {
        onToast("That file doesn't look like a Level-Up 30 backup.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="backup">
      <button className="ghost" onClick={exportJson}>⬇️ Export backup</button>
      <button className="ghost" onClick={() => fileRef.current?.click()}>⬆️ Import backup</button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJson(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
