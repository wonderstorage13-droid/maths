/* ============================================================
   Maths Practice — core app utilities
   All state lives in localStorage. No backend required.
   ============================================================ */

const MP_KEYS = {
  user: 'mp_user',
  scores: 'mp_scores',        // { topicId: { solved, correct, best, timeSec, last } }
  bookmarks: 'mp_bookmarks',  // [topicId, ...]
  stats: 'mp_stats',          // { totalSolved, totalCorrect, studySeconds, streak, lastActiveDate }
  leaderboard: 'mp_leaderboard', // [{name, id, score, date}]
  groqKey: 'mp_groq_key',
  sheetUrl: 'mp_sheet_url',
  aiLast: 'mp_ai_last_date',
  notesUrl: 'mp_notes_url',
  daily: 'mp_daily'
};

const DAILY_GOAL = 20; // questions/day

const MP = {
  // ---------- generic ----------
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  },

  // ---------- user ----------
  getUser() { return MP.get(MP_KEYS.user, null); },
  createUser(name) {
    const id = 'MP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const user = { name: name.trim(), id, createdAt: new Date().toISOString() };
    MP.set(MP_KEYS.user, user);
    return user;
  },
  requireUserOrRedirect() {
    const u = MP.getUser();
    if (!u) { window.location.href = 'index.html'; return null; }
    return u;
  },

  // ---------- stats ----------
  getStats() {
    return MP.get(MP_KEYS.stats, { totalSolved: 0, totalCorrect: 0, studySeconds: 0, streak: 0, lastActiveDate: null });
  },
  touchStreak() {
    const stats = MP.getStats();
    const today = new Date().toDateString();
    if (stats.lastActiveDate !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      stats.streak = (stats.lastActiveDate === y.toDateString()) ? stats.streak + 1 : 1;
      stats.lastActiveDate = today;
      MP.set(MP_KEYS.stats, stats);
    }
    return stats;
  },
  recordSession(topicId, solved, correct, seconds) {
    MP.touchStreak();
    const stats = MP.getStats();
    stats.totalSolved += solved;
    stats.totalCorrect += correct;
    stats.studySeconds += seconds;
    MP.set(MP_KEYS.stats, stats);

    const today = new Date().toDateString();
    const daily = MP.get(MP_KEYS.daily, { date: today, solved: 0 });
    if (daily.date !== today) { daily.date = today; daily.solved = 0; }
    daily.solved += solved;
    MP.set(MP_KEYS.daily, daily);

    const scores = MP.get(MP_KEYS.scores, {});
    const t = scores[topicId] || { solved: 0, correct: 0, best: 0, timeSec: 0, last: null };
    t.solved += solved;
    t.correct += correct;
    t.timeSec += seconds;
    const acc = solved ? Math.round((correct / solved) * 100) : 0;
    t.best = Math.max(t.best, acc);
    t.last = new Date().toISOString();
    scores[topicId] = t;
    MP.set(MP_KEYS.scores, scores);
  },
  getTopicScore(topicId) {
    const scores = MP.get(MP_KEYS.scores, {});
    return scores[topicId] || { solved: 0, correct: 0, best: 0, timeSec: 0, last: null };
  },
  getAllScores() { return MP.get(MP_KEYS.scores, {}); },
  getDaily() {
    const today = new Date().toDateString();
    const daily = MP.get(MP_KEYS.daily, { date: today, solved: 0 });
    if (daily.date !== today) return { date: today, solved: 0 };
    return daily;
  },

  // ---------- bookmarks ----------
  getBookmarks() { return MP.get(MP_KEYS.bookmarks, []); },
  toggleBookmark(topicId) {
    let b = MP.getBookmarks();
    if (b.includes(topicId)) b = b.filter(x => x !== topicId);
    else b.push(topicId);
    MP.set(MP_KEYS.bookmarks, b);
    return b;
  },
  isBookmarked(topicId) { return MP.getBookmarks().includes(topicId); },

  // ---------- leaderboard ----------
  submitScore(score, meta) {
    const user = MP.getUser();
    if (!user) return;
    const entry = { name: user.name, id: user.id, score, meta: meta || '', date: new Date().toISOString() };
    const board = MP.get(MP_KEYS.leaderboard, []);
    board.push(entry);
    MP.set(MP_KEYS.leaderboard, board);

    // Server-side proxy keeps the Google Sheet webhook URL out of browser code
    // and avoids CORS issues. Configure SHEET_URL in your Cloudflare Pages
    // project's Environment Variables — see functions/api/leaderboard.js.
    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(() => {});

    return entry;
  },
  getLeaderboard() {
    return MP.get(MP_KEYS.leaderboard, []).sort((a, b) => b.score - a.score);
  },

  // ---------- formatting ----------
  fmtTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    const s = Math.floor(totalSeconds % 60);
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  },
  fmtClock(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
};
