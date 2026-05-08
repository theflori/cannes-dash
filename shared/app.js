// deploy-marker 1778246024
// Shared utilities — all wrapped in IIFE to prevent global pollution.
// Only `window.ChateauApp` is exposed.

(function() {
  async function injectSidebar(activePage) {
    try {
      const res = await fetch('/shared/sidebar.html');
      if (!res.ok) throw new Error('Sidebar fetch failed');
      const html = await res.text();
      document.body.insertAdjacentHTML('afterbegin', html);
      document.querySelectorAll('.sidebar-link').forEach(link => {
        if (link.dataset.page === activePage) link.classList.add('active');
      });
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          try { await fetch('/api/logout', { method: 'POST' }); } catch {}
          window.location.href = '/login';
        });
      }
      const mobileBtn = document.getElementById('mobileMenuBtn');
      if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
          document.getElementById('sidebar').classList.toggle('open');
        });
      }
      document.addEventListener('click', e => {
        const sidebar = document.getElementById('sidebar');
        const btn = document.getElementById('mobileMenuBtn');
        if (sidebar && sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) && !(btn && btn.contains(e.target))) {
          sidebar.classList.remove('open');
        }
      });
    } catch (err) {
      console.error('Sidebar inject failed', err);
    }
  }

  function showToast(msg, type) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  }

  async function authFetch(url, opts) {
    const res = await fetch(url, opts || {});
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    return res;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escapeAttr(str) { return escapeHtml(str); }

  function formatNumber(n) {
    if (n === null || n === undefined) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = now - d;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return days + 'd ago';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return ''; }
  }

  window.ChateauApp = {
    injectSidebar: injectSidebar,
    showToast: showToast,
    authFetch: authFetch,
    escapeHtml: escapeHtml,
    escapeAttr: escapeAttr,
    formatNumber: formatNumber,
    formatDate: formatDate
  };
})();
