// deploy-marker 1778406072
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


  // ============== FIT INDICATOR ==============
  // 4-dot bar showing how good a fit a guest is for the event.
  // Start: 4 dots. Penalties:
  //   - Followers < 6K: -1
  //   - Followers < 1K: extra -1
  //   - Private IG account: -1
  //   - No IG handle: -2
  // Colors: 4/4 + 3/4 = green, 2/4 = orange, 1/4 or lower = yellow.
  function computeFitScore(guest) {
    let score = 4;
    const reasons = [];
    const followers = (guest.igFollowers !== null && guest.igFollowers !== undefined) ? guest.igFollowers : null;
    const isPrivate = guest.igIsPrivate === true;
    const hasHandle = !!(guest.instagram && guest.instagram.trim());

    if (!hasHandle) {
      score -= 2;
      reasons.push('No IG handle');
    } else {
      if (followers === null) {
        score -= 1;
        reasons.push('Followers unknown');
      } else {
        if (followers < 6000) {
          score -= 1;
          reasons.push('Followers < 6K');
        }
        if (followers < 1000) {
          score -= 1;
          reasons.push('Followers < 1K');
        }
      }
      if (isPrivate) {
        score -= 1;
        reasons.push('Private account');
      }
    }
    if (score < 0) score = 0;
    return { score, reasons };
  }

  function fitTier(score) {
    if (score >= 3) return 'good';   // 4/4 or 3/4
    if (score === 2) return 'medium';
    return 'weak';                    // 1/4 or 0/4
  }

  function fitLabel(score) {
    if (score === 4) return 'Top fit';
    if (score === 3) return 'Good fit';
    if (score === 2) return 'Mid';
    if (score === 1) return 'Weak';
    return 'Poor';
  }

  function renderFitIndicator(guest) {
    const { score, reasons } = computeFitScore(guest);
    const tier = fitTier(score);
    let tip = 'Fit: ' + fitLabel(score) + ' (' + score + '/4)';
    if (reasons.length) tip += ' — ' + reasons.join(', ');

    const dots = [];
    for (let i = 0; i < 4; i++) {
      const active = i < score;
      dots.push('<span class="fit-dot ' + (active ? 'active tier-' + tier : '') + '"></span>');
    }
    return '<span class="fit-indicator" title="' + tip.replace(/"/g, '&quot;') + '" data-fit-tier="' + tier + '">' + dots.join('') + '</span>';
  }

  window.ChateauApp = {
    injectSidebar: injectSidebar,
    showToast: showToast,
    authFetch: authFetch,
    escapeHtml: escapeHtml,
    escapeAttr: escapeAttr,
    formatNumber: formatNumber,
    formatDate: formatDate,
    computeFitScore: computeFitScore,
    renderFitIndicator: renderFitIndicator,
    fitLabel: fitLabel,
    fitTier: fitTier
  };
})();

// ============== REJECT CONFIRMATION MODAL ==============
// Promise-based modal for confirming destructive reject action.
// Usage: const ok = await showRejectModal({ name, status });
function showRejectModal({ name, status }) {
  return new Promise((resolve) => {
    // Build modal if not present
    let modal = document.getElementById('rejectConfirmModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'rejectConfirmModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,12,9,0.65);z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;animation:fadeIn 0.15s ease';
    modal.innerHTML = `
      <div style="background:#fff;width:100%;max-width:480px;border-radius:8px;box-shadow:0 24px 64px rgba(0,0,0,0.4);overflow:hidden;animation:slideUp 0.2s ease">
        <div style="padding:24px 28px 20px;border-bottom:1px solid #eaeae0;display:flex;align-items:flex-start;gap:14px">
          <div style="flex-shrink:0;width:38px;height:38px;border-radius:50%;background:rgba(196,84,74,0.12);display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c4544a" stroke-width="2" style="width:20px;height:20px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <h2 style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:17px;font-weight:600;color:#1a1814">Reject ${escapeHtmlSafe(name)}?</h2>
            <p style="margin:0;font-size:13px;color:#6b6b66;line-height:1.5">Currently: <strong style="color:#1a1814">${escapeHtmlSafe(status || 'unknown')}</strong></p>
          </div>
        </div>

        <div style="padding:20px 28px 8px;font-size:13px;line-height:1.6;color:#1a1814">
          <p style="margin:0 0 12px">This action will:</p>
          <ul style="margin:0 0 16px;padding-left:18px;color:#4a4843">
            <li style="margin-bottom:4px">Send an <strong>apology email</strong> (capacity-based wording)</li>
            <li style="margin-bottom:4px">Send an <strong>apology SMS</strong> (DE numbers only)</li>
            <li>Set their status to <strong>Declined</strong></li>
          </ul>
          <div style="padding:10px 12px;background:rgba(196,84,74,0.08);border-left:3px solid #c4544a;font-size:12px;color:#8a3f33;line-height:1.5;margin-bottom:8px">
            <strong>This cannot be auto-reversed.</strong> They will receive a message immediately.
          </div>
        </div>

        <div style="padding:16px 28px 22px;display:flex;align-items:center;justify-content:flex-end;gap:8px;background:#fafaf7;border-top:1px solid #eaeae0">
          <button id="rejectCancelBtn" style="padding:9px 18px;border:1px solid #1a1814;background:#fff;color:#1a1814;font-size:13px;border-radius:4px;cursor:pointer;font-family:Inter,sans-serif">Cancel</button>
          <button id="rejectConfirmBtn" style="padding:9px 18px;border:1px solid #c4544a;background:#c4544a;color:#fff;font-size:13px;border-radius:4px;cursor:pointer;font-family:Inter,sans-serif;font-weight:500">Yes, reject ${escapeHtmlSafe((name || '').split(' ')[0] || 'guest')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Make sure animations exist
    if (!document.getElementById('rejectModalKeyframes')) {
      const style = document.createElement('style');
      style.id = 'rejectModalKeyframes';
      style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(style);
    }

    function close(result) {
      modal.remove();
      resolve(result);
    }

    document.getElementById('rejectCancelBtn').addEventListener('click', () => close(false));
    document.getElementById('rejectConfirmBtn').addEventListener('click', () => close(true));
    modal.addEventListener('click', (e) => { if (e.target === modal) close(false); });

    // Esc closes
    function onKey(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', onKey);
        close(false);
      }
    }
    document.addEventListener('keydown', onKey);
  });
}

// Safe escape used by the modal — falls back if escapeHtml isn't loaded
function escapeHtmlSafe(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ============== A-LIST ALLOWANCE CHIP ==============
// Renders a small chip (+1 / +2 / +3 / OPEN) next to name for A-List guests with allowance > 0.
function renderAllowanceChip(guest) {
  if (!guest || !guest.plusOneAllowance) return '';
  const val = String(guest.plusOneAllowance).toLowerCase();
  if (val === '0' || val === '') return '';
  if (val === 'unlimited') {
    return '<span class="alist-allowance-chip open" title="Open invite — anyone they bring is in">OPEN</span>';
  }
  return '<span class="alist-allowance-chip" title="May bring up to ' + val + ' plus-one' + (val !== '1' ? 's' : '') + '">+' + escapeHtmlSafe(val) + '</span>';
}
