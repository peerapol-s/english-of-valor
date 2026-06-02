// ============================================================
// core.js — Database, Session, Screen routing, Utilities
// English of Valor — By KruMEEN
// ============================================================

// ── Local Storage (session + admin creds only) ────────────────
var DB = {
  get: function(k, def) {
    try { var v = localStorage.getItem('eov_' + k); return v ? JSON.parse(v) : def; }
    catch(e) { return def; }
  },
  set: function(k, v) {
    try { localStorage.setItem('eov_' + k, JSON.stringify(v)); }
    catch(e) {}
  }
};

function getAdminCreds() { return DB.get('admin', { user: 'admin', pass: 'admin123' }); }

// ── Legacy sync wrappers (used by admin.js internals) ─────────
// These are thin wrappers — actual data comes from Firebase async calls
function getStudents()   { return DB.get('students_cache', []); }
function saveStudents(s) { DB.set('students_cache', s); }
function getScores()     { return DB.get('scores_cache', []); }
function saveScores(s)   { DB.set('scores_cache', s); }

// ── Session ───────────────────────────────────────────────────
var CU = null; // Current User: { id, name, grade, room, isAdmin, isGuest }

// ── Screen Router ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goHome() {
  showScreen('home-screen');
  updateNavbar();
  renderGrades();
  // Load leaderboard from Firebase
  getScoresAsync(function(scores) {
    DB.set('scores_cache', scores);
    populateLbGrades();
    renderLeaderboard();
  });
  document.getElementById('game-list-section').style.display = 'none';
}

function goAdmin() {
  showScreen('admin-screen');
  updateNavbar();
  // Load students from Firebase then render
  getStudentsAsync(function(students) {
    DB.set('students_cache', students);
    populateGradeDropdowns();
    renderStudentTable();
  });
  // Load scores from Firebase then render
  getScoresAsync(function(scores) {
    DB.set('scores_cache', scores);
    renderScoreTable();
  });
}

function updateNavbar() {
  var nb = document.getElementById('navbar');
  if (!CU) { nb.style.display = 'none'; return; }
  nb.style.display = 'flex';
  var badge = document.getElementById('nav-badge');
  var ud    = document.getElementById('nav-user-display');
  var ab    = document.getElementById('nav-admin-btn');
  if (CU.isAdmin) {
    badge.textContent = 'ADMIN'; badge.className = 'nav-badge'; badge.style.background = '#E17055';
    ud.textContent = 'Admin'; ab.style.display = 'flex';
  } else if (CU.isGuest) {
    badge.textContent = 'GUEST'; badge.className = 'nav-badge guest';
    ud.textContent = ''; ab.style.display = 'none';
  } else {
    var rm = CU.room ? ' / Room ' + CU.room : '';
    badge.textContent = CU.grade + rm; badge.className = 'nav-badge'; badge.style.background = '';
    ud.textContent = CU.name || CU.id; ab.style.display = 'none';
  }
}

// ── Login ─────────────────────────────────────────────────────
function doStudentLogin() {
  var id = document.getElementById('student-id-input').value.trim();
  var pw = document.getElementById('student-pw-input').value.trim();
  if (!id) { showAlert('login-error', 'Please enter your Student ID.'); return; }

  findStudentAsync(id, function(found) {
    if (!found) { showAlert('login-error', 'Student ID not found. Please check with your teacher.'); return; }
    if (found.pw && found.pw !== pw) { showAlert('login-error', 'Incorrect password. Please try again.'); return; }
    CU = { id: found.id, name: found.name, grade: found.grade, room: found.room || '' };
    afterLogin();
  });
}

function doAdminLogin()  { openModal('admin-login-modal'); }

function confirmAdminLogin() {
  var u = document.getElementById('admin-user-inp').value.trim();
  var p = document.getElementById('admin-pass-inp').value.trim();
  var creds = getAdminCreds();
  if (u !== creds.user || p !== creds.pass) { showAlert('admin-login-error', 'Incorrect username or password.'); return; }
  closeModal('admin-login-modal');
  CU = { id: 'admin', name: 'Admin', isAdmin: true };
  afterLogin(); goAdmin();
}

function doGuestLogin() { CU = { id: 'guest', name: 'Guest', isGuest: true }; afterLogin(); }

function afterLogin() {
  hideAlert('login-error');
  document.getElementById('student-id-input').value = '';
  document.getElementById('student-pw-input').value = '';

  if (CU) DB.set('session', CU);

  if (CU) {
    var name = CU.isAdmin ? 'Admin' : CU.isGuest ? 'Guest' : (CU.name || CU.id);
    document.getElementById('home-greeting').textContent = 'Welcome, ' + name + '! 🎉';
  }

  updateNavbar(); goHome();
  if (CU && !CU.isAdmin && !CU.isGuest) {
    var grade = CU.grade || 'M.1';
    setTimeout(function() {
      var el = document.querySelector('.grade-card[data-grade="' + grade + '"]');
      if (el) el.click();
    }, 400);
  }
}

function doLogout() {
  CU = null;
  DB.set('session', null);
  showScreen('login-screen');
  document.getElementById('navbar').style.display = 'none';
}

// ── Utilities ─────────────────────────────────────────────────
function htmlEsc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function showAlert(id, msg) { var el = document.getElementById(id); if (el) { el.textContent = msg; el.style.display = 'block'; } }
function hideAlert(id)      { var el = document.getElementById(id); if (el) el.style.display = 'none'; }
function openModal(id)      { var el = document.getElementById(id); if (el) el.classList.add('open'); }
function closeModal(id)     { var el = document.getElementById(id); if (el) el.classList.remove('open'); }

var _toastTimer;
function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast ' + (type || 'success'); t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2800);
}

// ── Stars background ──────────────────────────────────────────
(function() {
  var c = document.getElementById('stars');
  for (var i = 0; i < 80; i++) {
    var s = document.createElement('div'); s.className = 'star';
    var sz = Math.random() * 2.5 + 0.5;
    s.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;left:' + Math.random()*100 + '%;top:'
      + Math.random()*100 + '%;--d:' + (2 + Math.random()*4) + 's;--delay:-' + Math.random()*5 + 's';
    c.appendChild(s);
  }
})();

// ── Keyboard shortcuts + session restore ──────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Init Firebase first
  initFirebase();

  document.getElementById('student-id-input').addEventListener('keydown', function(e) { if (e.key === 'Enter') doStudentLogin(); });
  document.getElementById('admin-pass-inp').addEventListener('keydown',   function(e) { if (e.key === 'Enter') confirmAdminLogin(); });

  // Restore session after refresh
  var saved = DB.get('session', null);
  if (saved) {
    CU = saved;
    var name = CU.isAdmin ? 'Admin' : CU.isGuest ? 'Guest' : (CU.name || CU.id);
    document.getElementById('home-greeting').textContent = 'Welcome, ' + name + '! 🎉';
    updateNavbar();
    if (CU.isAdmin) { goAdmin(); } else { goHome(); }
    if (!CU.isAdmin && !CU.isGuest) {
      var grade = CU.grade || 'M.1';
      setTimeout(function() {
        var el = document.querySelector('.grade-card[data-grade="' + grade + '"]');
        if (el) el.click();
      }, 400);
    }
  }
});
