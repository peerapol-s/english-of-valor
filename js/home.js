// ============================================================
// home.js — Grade grid, Game list, Leaderboard
// ============================================================

// ── Game Registry ─────────────────────────────────────────────
// To add a new game:  add an entry with released:false while developing,
// flip to released:true to make it visible to students.
// Admin always sees ALL games (including released:false) for testing.
var GAME_REGISTRY = {
  'P.1': [], 'P.2': [], 'P.3': [], 'P.4': [], 'P.5': [], 'P.6': [],
  'M.1': [
    {
      id:       'word-quest',
      name:     'Word Quest RPG',
      desc:     'Battle monsters with vocabulary & grammar! Answer correctly to attack.',
      skill:    'Vocabulary + Grammar',
      released: true,
      loader:   'loadWordQuestGame'  // string name — resolved at runtime, not parse time
    }
  ],
  'M.2': [], 'M.3': [], 'M.4': [], 'M.5': [], 'M.6': []
};

var GRADE_META = {
  primary: [
    { id:'P.1', emoji:'🌱' }, { id:'P.2', emoji:'🌿' }, { id:'P.3', emoji:'🌸' },
    { id:'P.4', emoji:'🌺' }, { id:'P.5', emoji:'🌻' }, { id:'P.6', emoji:'🌳' }
  ],
  secondary: [
    { id:'M.1', emoji:'⚔️' }, { id:'M.2', emoji:'🧩' }, { id:'M.3', emoji:'🔮' },
    { id:'M.4', emoji:'🎯' }, { id:'M.5', emoji:'🚀' }, { id:'M.6', emoji:'🏆' }
  ]
};

// ── Grade Grid ────────────────────────────────────────────────
function renderGrades() {
  ['primary', 'secondary'].forEach(function(level) {
    var container = document.getElementById(level + '-grades');
    container.innerHTML = '';
    GRADE_META[level].forEach(function(g) {
      var games      = GAME_REGISTRY[g.id] || [];
      var isAdmin    = CU && CU.isAdmin;
      var isGuest    = CU && CU.isGuest;
      var myGrade    = CU ? CU.grade : null;
      var visibleGames = isAdmin ? games : games.filter(function(gm) { return gm.released; });
      var hasGames   = visibleGames.length > 0;
      var locked     = !isGuest && !isAdmin && myGrade !== g.id;

      var div = document.createElement('div');
      div.className = 'grade-card ' + (locked ? 'locked' : 'unlocked') + (myGrade === g.id ? ' active-grade' : '');
      div.dataset.grade = g.id;
      div.innerHTML =
        '<div class="grade-icon">' + g.emoji + '</div>'
        + '<div class="grade-name">' + g.id + '</div>'
        + '<div class="grade-sub">' + (hasGames ? visibleGames.length + ' game(s)' : 'No games yet') + '</div>'
        + (!hasGames ? '<div class="badge-coming">SOON</div>' : '')
        + (hasGames && !locked ? '<div class="badge-new">PLAY</div>' : '');

      if (!locked) {
        (function(gid) { div.onclick = function() { selectGrade(gid); }; })(g.id);
      }
      container.appendChild(div);
    });
  });
}

function selectGrade(gradeId) {
  var allMeta = GRADE_META.primary.concat(GRADE_META.secondary);
  var meta = null;
  for (var i = 0; i < allMeta.length; i++) { if (allMeta[i].id === gradeId) { meta = allMeta[i]; break; } }
  if (!meta) return;

  var isAdmin = CU && CU.isAdmin;
  var games   = GAME_REGISTRY[gradeId] || [];
  var visible = isAdmin ? games : games.filter(function(g) { return g.released; });

  document.getElementById('game-list-title').textContent = 'Games for ' + gradeId;
  var list = document.getElementById('game-list');

  if (!visible.length) {
    list.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text3);font-size:.9rem">'
      + '🚧 Games for ' + gradeId + ' are coming soon!</div>';
  } else {
    list.innerHTML = visible.map(function(game) {
      var draftTag = (!game.released && isAdmin)
        ? '<span class="tag tag-draft">🛠 DRAFT</span>' : '';
      return '<div class="game-item ' + (game.released ? 'active-game' : 'draft-game') + '" id="gi-' + game.id + '">'
        + '<div class="game-emoji">' + meta.emoji + '</div>'
        + '<div class="game-info">'
        + '<div class="game-name">' + htmlEsc(game.name) + '</div>'
        + '<div class="game-desc">' + htmlEsc(game.desc) + '</div>'
        + '<div class="game-meta">'
        + '<span class="tag tag-grade">' + gradeId + '</span>'
        + '<span class="tag tag-skill">' + htmlEsc(game.skill) + '</span>'
        + draftTag
        + '</div></div>'
        + '<button class="play-btn" data-gid="' + htmlEsc(game.id) + '" data-grade="' + htmlEsc(gradeId) + '">▶ Play</button>'
        + '</div>';
    }).join('');

    // Attach play button handlers
    list.querySelectorAll('.play-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        startGame(btn.dataset.gid, btn.dataset.grade);
      });
    });
    list.querySelectorAll('.game-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var btn = item.querySelector('.play-btn');
        if (btn) startGame(btn.dataset.gid, btn.dataset.grade);
      });
    });
  }

  document.getElementById('game-list-section').style.display = 'block';
  document.getElementById('game-list-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Leaderboard ───────────────────────────────────────────────
function populateLbGrades() {
  var students = getStudents();
  var grades = [];
  students.forEach(function(s) { if (grades.indexOf(s.grade) < 0) grades.push(s.grade); });
  grades.sort();
  var sel = document.getElementById('lb-grade');
  var cur = sel.value;
  sel.innerHTML = '<option value="all">All Levels</option>'
    + grades.map(function(g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');
  if (cur) sel.value = cur;
  populateLbRooms();
}

function populateLbRooms() {
  var grade  = document.getElementById('lb-grade').value;
  var scores = getScores();
  var rooms  = [];
  scores.forEach(function(s) {
    if ((grade === 'all' || s.grade === grade) && s.room && rooms.indexOf(s.room) < 0) rooms.push(s.room);
  });
  rooms.sort();
  var sel = document.getElementById('lb-room');
  var cur = sel.value;
  sel.innerHTML = '<option value="all">All Rooms</option>'
    + rooms.map(function(r) { return '<option value="' + r + '">Room ' + r + '</option>'; }).join('');
  if (rooms.indexOf(cur) >= 0) sel.value = cur;
}

function lbGradeChange() { populateLbRooms(); renderLeaderboard(); }

function renderLeaderboard() {
  var gameF  = document.getElementById('lb-game').value;
  var gradeF = document.getElementById('lb-grade').value;
  var roomF  = document.getElementById('lb-room').value;
  var scores = getScores().filter(function(s) {
    return (gameF === 'all' || s.game === gameF)
        && (gradeF === 'all' || s.grade === gradeF)
        && (roomF === 'all' || s.room === roomF);
  });
  var best = {};
  scores.forEach(function(s) { var k = s.studentId + '|' + s.game; if (!best[k] || s.score > best[k].score) best[k] = s; });
  var sorted = Object.values(best).sort(function(a, b) { return b.score - a.score; }).slice(0, 10);
  var cont = document.getElementById('lb-container');
  if (!sorted.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:20px;font-size:.9rem">No scores yet. Be the first!</div>';
    return;
  }
  cont.innerHTML = sorted.map(function(s, i) {
    var rc    = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
    var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1);
    var rm    = s.room ? ' / Room ' + s.room : '';
    return '<div class="lb-row">'
      + '<div class="lb-rank ' + rc + '">' + medal + '</div>'
      + '<div style="flex:1"><div style="font-weight:700;font-size:.88rem">' + htmlEsc(s.name || s.studentId)
      + ' <span style="color:var(--text3);font-size:.75rem">(' + htmlEsc(s.studentId) + ')</span></div>'
      + '<div style="font-size:.73rem;color:var(--text3)">' + htmlEsc(s.grade) + rm + ' &middot; ' + htmlEsc(s.game) + '</div></div>'
      + '<div><div style="font-weight:800;color:var(--accent)">' + s.score.toLocaleString() + '</div>'
      + '<div style="font-size:.72rem;color:var(--text3)">' + htmlEsc(s.date) + '</div></div>'
      + '</div>';
  }).join('');
}

// Lb game filter also needs to refresh room filter for scores
function updateLbGameOptions() {
  var sel = document.getElementById('lb-game');
  sel.innerHTML = '<option value="all">All Games</option>';
  // Collect all unique game names from GAME_REGISTRY
  var names = [];
  Object.keys(GAME_REGISTRY).forEach(function(grade) {
    GAME_REGISTRY[grade].forEach(function(g) {
      if (g.released && names.indexOf(g.name) < 0) names.push(g.name);
    });
  });
  names.forEach(function(n) {
    var opt = document.createElement('option'); opt.value = n; opt.textContent = n;
    sel.appendChild(opt);
  });
}
