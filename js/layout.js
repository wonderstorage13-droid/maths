/* ============================================================
   Shared layout: sidebar + topbar, injected at runtime.
   ============================================================ */

const NAV_ITEMS = [
  { page: 'dashboard.html', label: 'Home', icon: '🏠' },
  { page: 'practice.html', label: 'Practice', icon: '🎯' },
  { page: 'topics.html', label: 'Topics', icon: '📚' },
  { page: 'mocktest.html', label: 'Mock Tests', icon: '📝' },
  { page: 'ai-practice.html', label: 'AI Practice', icon: '✨' },
  { page: 'progress.html', label: 'Progress', icon: '📈' },
  { page: 'bookmarks.html', label: 'Bookmarks', icon: '🔖' },
  { page: 'notes-redirect', label: 'Notes', icon: '🗒️' },
  { page: 'leaderboard.html', label: 'Leaderboard', icon: '🏆' },
  { page: 'settings.html', label: 'Settings', icon: '⚙️' }
];

function renderLayout(activePage) {
  const user = MP.getUser();
  if (!user) { window.location.href = 'index.html'; return; }

  const navHtml = NAV_ITEMS.map(item => {
    const isNotes = item.page === 'notes-redirect';
    const href = isNotes ? 'https://thunderstudy.indevs.in' : item.page;
    const target = isNotes ? 'target="_blank" rel="noopener"' : '';
    const active = item.page === activePage ? 'nav-active' : '';
    return `<a href="${href}" ${target} class="nav-link ${active}">
              <span class="nav-icon">${item.icon}</span><span>${item.label}</span>
            </a>`;
  }).join('');

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="brand">
        <div class="brand-badge">√x</div>
        <div>
          <div class="brand-title">Maths Practice</div>
          <div class="brand-sub">Practice. Learn. Master.</div>
        </div>
      </div>
      <nav class="nav">${navHtml}</nav>
      <div class="upgrade-card">
        <div class="upgrade-emoji">👑</div>
        <div class="upgrade-title">${user.name}</div>
        <div class="upgrade-sub">ID: ${user.id}</div>
      </div>
    `;
  }

  const topbar = document.getElementById('topbar');
  if (topbar) {
    const stats = MP.getStats();
    topbar.innerHTML = `
      <div class="search-box">
        <span>🔍</span>
        <input type="text" placeholder="Search topics, skills or questions..." id="globalSearch" />
      </div>
      <div class="topbar-right">
        <div class="streak-pill">🔥 <b>${stats.streak}</b> Day Streak</div>
        <div class="avatar-pill">${user.name.charAt(0).toUpperCase()}</div>
      </div>
    `;
    const search = document.getElementById('globalSearch');
    if (search) {
      search.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && search.value.trim()) {
          window.location.href = 'topics.html?q=' + encodeURIComponent(search.value.trim());
        }
      });
    }
  }
}
