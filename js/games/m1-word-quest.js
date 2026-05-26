// ============================================================
// games/m1-word-quest.js — Word Quest RPG (M.1)
// To add a new game: copy this file, change the IDs/data,
// then add an entry in home.js GAME_REGISTRY.
// ============================================================

// ── Question bank ─────────────────────────────────────────────
var WQ_QUESTIONS = [
  // VOCABULARY
  { type:'vocab', word:'Apple',     choices:['A red or green fruit','A vegetable','A type of bread','A drink'],    answer:'A red or green fruit',    hint:'One a day keeps the doctor away!' },
  { type:'vocab', word:'Book',      choices:['You read it','You eat it','You wear it','You drive it'],             answer:'You read it',              hint:'Found in a library' },
  { type:'vocab', word:'School',    choices:['A place to learn','A place to sleep','A place to eat','A fish'],    answer:'A place to learn',         hint:'Students go here every day' },
  { type:'vocab', word:'Beautiful', choices:['Very pretty','Very ugly','Very fast','Very strong'],                 answer:'Very pretty',              hint:'An adjective about looks' },
  { type:'vocab', word:'Friend',    choices:['Someone you like','An enemy','A teacher','A doctor'],               answer:'Someone you like',         hint:'You enjoy time together' },
  { type:'vocab', word:'Happy',     choices:['Feeling great joy','Feeling angry','Feeling sad','Feeling scared'], answer:'Feeling great joy',        hint:'Opposite of sad' },
  { type:'vocab', word:'Run',       choices:['Move fast on foot','Sleep','Eat quickly','Look carefully'],         answer:'Move fast on foot',        hint:'Faster than walking' },
  { type:'vocab', word:'Mountain',  choices:['A tall landform','An ocean','A flat field','A city'],               answer:'A tall landform',          hint:'Often has snow at the top' },
  { type:'vocab', word:'Teacher',   choices:['Helps students learn','Fixes cars','Cooks food','Fights fires'],    answer:'Helps students learn',     hint:'Works in a school' },
  { type:'vocab', word:'Water',     choices:['A liquid we drink','A type of food','A gas','A kind of rock'],      answer:'A liquid we drink',        hint:'H₂O — essential for life' },
  { type:'vocab', word:'Generous',  choices:['Willing to give','Very selfish','Easily angered','Very shy'],       answer:'Willing to give',          hint:'Opposite of selfish' },
  { type:'vocab', word:'Enormous',  choices:['Extremely large','Very small','Very beautiful','Very fast'],        answer:'Extremely large',          hint:'Even bigger than huge' },
  { type:'vocab', word:'Curious',   choices:['Eager to know','Feeling bored','Very brave','Very lazy'],           answer:'Eager to know',            hint:'Curiosity killed the cat!' },
  // GRAMMAR
  { type:'grammar', word:'She ___ a student.',           choices:['is','are','am','be'],          answer:'is',   hint:'She = singular 3rd person' },
  { type:'grammar', word:'They ___ happy.',              choices:['is','are','am','be'],          answer:'are',  hint:'They = plural' },
  { type:'grammar', word:'I ___ 13 years old.',          choices:['is','are','am','be'],          answer:'am',   hint:'I always uses "am"' },
  { type:'grammar', word:'He ___ to school yesterday.',  choices:['go','goes','went','going'],    answer:'went', hint:'Yesterday = Past Tense' },
  { type:'grammar', word:'We ___ eating right now.',     choices:['is','are','am','be'],          answer:'are',  hint:'We + Present Continuous' },
  { type:'grammar', word:'___ you like cats?',           choices:['Do','Does','Is','Are'],        answer:'Do',   hint:'Question with "you" → Do' },
  { type:'grammar', word:'She ___ not know him.',        choices:['do','does','is','has'],        answer:'does', hint:'She (singular) → Does' },
  { type:'grammar', word:'I have ___ my homework.',      choices:['do','did','done','doing'],     answer:'done', hint:'Present Perfect: have + V3' },
  { type:'grammar', word:'The cat ___ on the table.',    choices:['sit','sits','sat','sitting'],  answer:'sits', hint:'Singular subject adds -s' },
  { type:'grammar', word:'___ he playing football now?', choices:['Do','Does','Is','Are'],        answer:'Is',   hint:'Present Continuous Question' },
];

var WQ_MONSTERS = [
  { name:'Goblin',   emoji:'👺', hp:60,  atk:15, reward:100 },
  { name:'Slime',    emoji:'🟢', hp:40,  atk:10, reward:80  },
  { name:'Skeleton', emoji:'💀', hp:80,  atk:20, reward:130 },
  { name:'Dragon',   emoji:'🐉', hp:150, atk:35, reward:300 },
  { name:'Witch',    emoji:'🧙', hp:90,  atk:25, reward:180 },
  { name:'Ghost',    emoji:'👻', hp:70,  atk:18, reward:120 },
  { name:'Orc',      emoji:'👹', hp:100, atk:28, reward:200 },
  { name:'Vampire',  emoji:'🧛', hp:110, atk:22, reward:210 },
];

// ── Game state ────────────────────────────────────────────────
var WQ = {};  // isolated state — no collision with other games

// Entry point called by home.js startGame()
function loadWordQuestGame(gradeId) {
  var shuffled = WQ_QUESTIONS.slice().sort(function() { return Math.random() - 0.5; });
  WQ = {
    gradeId: gradeId,
    gameName: 'Word Quest RPG',
    questions: shuffled,
    qIndex: 0,
    totalQ: Math.min(15, shuffled.length),
    score: 0, wave: 1, streak: 0, maxStreak: 0,
    correct: 0, wrong: 0,
    playerHp: 100, maxPlayerHp: 100,
    monster: null, monsterHp: 0, monstersDefeated: 0,
    powerups: { hint: 2, shield: 1, double: 1 },
    shieldActive: false, doubleActive: false,
    phase: 'battle'
  };
  _wqNextMonster();
  showScreen('game-screen');
  document.getElementById('navbar').style.display = 'flex';
  document.getElementById('game-title-bar').textContent = '⚔️ Word Quest RPG';
  _wqRender();
}

function _wqNextMonster() {
  var m     = WQ_MONSTERS[WQ.monstersDefeated % WQ_MONSTERS.length];
  var scale = 1 + (WQ.wave - 1) * 0.3;
  WQ.monster = { name: m.name, emoji: m.emoji, hp: Math.round(m.hp * scale), atk: m.atk, reward: m.reward };
  WQ.monster.maxHp = WQ.monster.hp;
  WQ.monsterHp = WQ.monster.hp;
}

// ── Render ────────────────────────────────────────────────────
function _wqRender() {
  if (WQ.phase === 'result') { _wqResult(); return; }
  document.getElementById('stat-score').textContent  = WQ.score.toLocaleString();
  document.getElementById('stat-level').textContent  = WQ.wave;
  document.getElementById('stat-streak').textContent = WQ.streak;

  var q      = WQ.questions[WQ.qIndex];
  var plPct  = Math.max(0, (WQ.playerHp / WQ.maxPlayerHp) * 100);
  var mnPct  = Math.max(0, (WQ.monsterHp / WQ.monster.maxHp) * 100);
  var plClass = plPct > 60 ? 'good' : plPct > 30 ? 'medium' : '';
  var qProg  = Math.round((WQ.qIndex / WQ.totalQ) * 100);
  var choices = q.choices.slice().sort(function() { return Math.random() - 0.5; });

  document.getElementById('game-body').innerHTML =
    '<div class="progress-bar"><div class="progress-fill" style="width:' + qProg + '%"></div></div>'
    + '<div style="display:flex;justify-content:space-between;font-size:.78rem;color:var(--text3);margin-bottom:16px">'
    + '<span>Question ' + (WQ.qIndex+1) + ' of ' + WQ.totalQ + '</span>'
    + '<span>Monster #' + (WQ.monstersDefeated+1) + '</span></div>'

    + '<div class="battle-arena">'
    // Monster
    + '<div class="monster-side"><div class="monster-box">'
    + '<div class="monster-name">' + WQ.monster.name + '</div>'
    + '<div class="monster-display" id="mon-emoji">' + WQ.monster.emoji + '</div>'
    + '<div class="hp-row"><span style="font-size:.73rem;color:var(--text3)">HP</span>'
    + '<div class="hp-bar"><div class="hp-fill" id="mon-hp" style="width:' + mnPct + '%"></div></div>'
    + '<span class="hp-label" style="color:var(--danger)">' + WQ.monsterHp + '/' + WQ.monster.maxHp + '</span></div>'
    + '<div style="font-size:.75rem;color:var(--text3);margin-top:6px">⚔️ ATK ' + WQ.monster.atk + ' &nbsp;💎 ' + WQ.monster.reward + ' pts</div>'
    + '</div></div>'
    // Player
    + '<div class="player-side"><div class="player-box">'
    + '<div class="player-name">Warrior ' + WQ.gradeId + '</div>'
    + '<div class="player-avatar" id="pl-avatar">🧙‍♂️</div>'
    + '<div class="hp-row"><span style="font-size:.73rem;color:var(--text3)">HP</span>'
    + '<div class="hp-bar"><div class="hp-fill ' + plClass + '" id="pl-hp" style="width:' + plPct + '%"></div></div>'
    + '<span class="hp-label" style="color:var(--success)">' + WQ.playerHp + '/' + WQ.maxPlayerHp + '</span></div>'
    + (WQ.shieldActive ? '<div style="margin-top:8px;font-size:.78rem;color:var(--secondary)">🛡️ Shield Active!</div>' : '')
    + (WQ.doubleActive ? '<div style="margin-top:4px;font-size:.78rem;color:var(--accent)">⚡ Double Damage!</div>' : '')
    + '<div style="margin-top:10px;font-size:.76rem;color:var(--text3)">🔥 Streak: ' + WQ.streak + ' | ✅ ' + WQ.correct + ' ❌ ' + WQ.wrong + '</div>'
    + '</div></div></div>'

    + '<div class="powerups">'
    + '<button class="powerup-btn" id="wq-pu-hint"   ' + (WQ.powerups.hint   <= 0 ? 'disabled' : '') + '>💡 Hint   <span class="powerup-count">' + WQ.powerups.hint   + '</span></button>'
    + '<button class="powerup-btn" id="wq-pu-shield" ' + (WQ.powerups.shield <= 0 || WQ.shieldActive ? 'disabled' : '') + '>🛡️ Shield <span class="powerup-count">' + WQ.powerups.shield + '</span></button>'
    + '<button class="powerup-btn" id="wq-pu-double" ' + (WQ.powerups.double <= 0 || WQ.doubleActive ? 'disabled' : '') + '>⚡ Double <span class="powerup-count">' + WQ.powerups.double + '</span></button>'
    + '</div>'

    + '<div class="question-box">'
    + '<div style="text-align:center;font-size:.72rem;font-weight:800;letter-spacing:1px;margin-bottom:8px;color:'
    + (q.type === 'grammar' ? '#A29BFE' : '#00CEC9') + '">'
    + (q.type === 'grammar' ? '📝 GRAMMAR' : '📚 VOCABULARY') + '</div>'
    + '<div class="question-word">' + htmlEsc(q.word) + '</div>'
    + '<div class="question-text">' + (q.type === 'vocab' ? 'What does this word mean?' : 'Fill in the blank:') + '</div>'
    + '<div id="wq-hint" style="display:none;text-align:center;color:var(--text3);font-size:.8rem;margin-top:6px">💡 ' + htmlEsc(q.hint) + '</div>'
    + '</div>'

    + '<div class="choices" id="wq-choices">'
    + choices.map(function(c) {
        return '<button class="choice-btn" data-choice="' + encodeURIComponent(c) + '" data-answer="' + encodeURIComponent(q.answer) + '">' + htmlEsc(c) + '</button>';
      }).join('')
    + '</div>';

  // Powerup handlers
  document.getElementById('wq-pu-hint').addEventListener('click',   function() { _wqPowerup('hint'); });
  document.getElementById('wq-pu-shield').addEventListener('click', function() { _wqPowerup('shield'); });
  document.getElementById('wq-pu-double').addEventListener('click', function() { _wqPowerup('double'); });

  // Choice handler (event delegation)
  document.getElementById('wq-choices').addEventListener('click', function(e) {
    var btn = e.target.closest('.choice-btn');
    if (!btn || btn.disabled) return;
    _wqAnswer(btn, decodeURIComponent(btn.dataset.choice), decodeURIComponent(btn.dataset.answer));
  });
}

function _wqPowerup(type) {
  if (type === 'hint') {
    if (WQ.powerups.hint <= 0) return;
    WQ.powerups.hint--;
    var hb = document.getElementById('wq-hint'); if (hb) hb.style.display = 'block';
    document.getElementById('wq-pu-hint').disabled = true;
  } else if (type === 'shield') {
    if (WQ.powerups.shield <= 0 || WQ.shieldActive) return;
    WQ.powerups.shield--; WQ.shieldActive = true; _wqRender();
  } else if (type === 'double') {
    if (WQ.powerups.double <= 0 || WQ.doubleActive) return;
    WQ.powerups.double--; WQ.doubleActive = true; _wqRender();
  }
}

function _wqAnswer(btn, choice, answer) {
  document.querySelectorAll('.choice-btn').forEach(function(b) { b.disabled = true; });
  var correct = (choice === answer);

  if (correct) {
    btn.classList.add('correct');
    WQ.streak++; WQ.correct++;
    if (WQ.streak > WQ.maxStreak) WQ.maxStreak = WQ.streak;
    var dmg = Math.round(20 + WQ.streak * 5);
    if (WQ.doubleActive) { dmg *= 2; WQ.doubleActive = false; }
    WQ.monsterHp = Math.max(0, WQ.monsterHp - dmg);
    WQ.score += 50 + WQ.streak * 10;
    _wqDmg('-' + dmg, true); _wqAnim('mon');
    var mh = document.getElementById('mon-hp');
    if (mh) mh.style.width = ((WQ.monsterHp / WQ.monster.maxHp) * 100) + '%';
    showToast('Correct! +' + dmg + ' damage', 'success');
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.choice-btn').forEach(function(b) { if (b.textContent.trim() === answer) b.classList.add('correct'); });
    WQ.streak = 0; WQ.wrong++;
    var dmg2 = WQ.monster.atk;
    if (WQ.shieldActive) { dmg2 = 0; WQ.shieldActive = false; showToast('Shield blocked the attack!', 'success'); }
    else { WQ.playerHp = Math.max(0, WQ.playerHp - dmg2); showToast('Wrong! Monster attacks -' + dmg2 + ' HP', 'error'); }
    if (dmg2 > 0) _wqDmg('-' + dmg2, false);
    _wqAnim('pl');
    var ph = document.getElementById('pl-hp');
    if (ph) { var p = (WQ.playerHp / WQ.maxPlayerHp) * 100; ph.style.width = p + '%'; ph.className = 'hp-fill' + (p > 60 ? ' good' : p > 30 ? ' medium' : ''); }
  }

  setTimeout(function() {
    if (WQ.monsterHp <= 0) {
      WQ.score += WQ.monster.reward; WQ.monstersDefeated++;
      WQ.wave = Math.floor(WQ.monstersDefeated / 3) + 1;
      WQ.maxPlayerHp = Math.min(100 + WQ.monstersDefeated * 5, 200);
      WQ.playerHp    = Math.min(WQ.playerHp + 20, WQ.maxPlayerHp);
      if (WQ.monstersDefeated % 3 === 0) { WQ.powerups.hint++; WQ.powerups.shield++; }
    }
    if (WQ.playerHp <= 0) { WQ.phase = 'result'; _wqResult(); return; }
    WQ.qIndex++;
    if (WQ.qIndex >= WQ.totalQ) { WQ.phase = 'result'; _wqResult(); return; }
    if (WQ.monsterHp <= 0) _wqNextMonster();
    _wqRender();
  }, 1400);
}

function _wqDmg(text, isEnemy) {
  var arena = document.querySelector('.battle-arena'); if (!arena) return;
  var side  = isEnemy ? arena.querySelector('.monster-side') : arena.querySelector('.player-side');
  if (!side) return;
  side.style.position = 'relative';
  var d = document.createElement('div');
  d.className = 'damage-float ' + (isEnemy ? 'enemy' : 'player');
  d.textContent = text; side.appendChild(d);
  setTimeout(function() { if (d.parentNode) d.parentNode.removeChild(d); }, 900);
}

function _wqAnim(who) {
  var el = document.getElementById(who === 'mon' ? 'mon-emoji' : 'pl-avatar'); if (!el) return;
  var anim = who === 'mon' ? 'monsterShake' : 'playerHit';
  el.style.animation = anim + ' .4s ease';
  setTimeout(function() { el.style.animation = ''; }, 400);
}

function _wqResult() {
  var pct   = Math.round((WQ.correct / WQ.totalQ) * 100);
  var grade = pct >= 80 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D';
  var emoji = pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : pct >= 40 ? '😊' : '💪';
  var msg   = pct >= 80 ? 'Outstanding! You are a true Valor!' : pct >= 60 ? 'Great job! Keep it up!'
            : pct >= 40 ? 'Good effort! Practice more!' : 'Keep training — you will improve!';

  // Save score
  if (CU && !CU.isGuest && !CU.isAdmin) {
    var scores = getScores(), now = new Date();
    scores.push({
      studentId: CU.id, name: CU.name || CU.id, grade: CU.grade, room: CU.room || '',
      game: WQ.gameName, score: WQ.score, correct: WQ.correct, wrong: WQ.wrong,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }),
      ts: now.getTime()
    });
    saveScores(scores); showToast('Score saved!', 'success');
  }

  document.getElementById('game-body').innerHTML =
    '<div class="result-box">'
    + '<span class="result-emoji">' + emoji + '</span>'
    + '<div class="result-title">' + msg + '</div>'
    + '<div style="color:var(--text2);font-size:.88rem;margin-bottom:4px">Grade: <b style="color:var(--accent);font-size:1.2rem">' + grade + '</b></div>'
    + '<div class="result-score">' + WQ.score.toLocaleString() + '</div>'
    + '<div style="color:var(--text3);font-size:.83rem">Total Score</div>'
    + '<div class="result-details">'
    + '<div class="result-stat"><div class="result-stat-val" style="color:var(--success)">' + WQ.correct + '</div><div class="result-stat-label">Correct</div></div>'
    + '<div class="result-stat"><div class="result-stat-val" style="color:var(--danger)">'  + WQ.wrong   + '</div><div class="result-stat-label">Wrong</div></div>'
    + '<div class="result-stat"><div class="result-stat-val" style="color:var(--accent)">'  + WQ.maxStreak + '</div><div class="result-stat-label">MAX STREAK 🔥</div></div>'
    + '<div class="result-stat"><div class="result-stat-val" style="color:var(--primary)">' + WQ.monstersDefeated + '</div><div class="result-stat-label">Monsters Defeated</div></div>'
    + '<div class="result-stat"><div class="result-stat-val" style="color:var(--secondary)">' + pct + '%</div><div class="result-stat-label">Accuracy</div></div>'
    + '<div class="result-stat"><div class="result-stat-val">' + WQ.wave + '</div><div class="result-stat-label">Highest Wave</div></div>'
    + '</div>'
    + (CU && CU.isGuest ? '<div style="background:rgba(253,203,110,.1);border:1px solid rgba(253,203,110,.3);border-radius:10px;padding:12px;color:var(--accent);font-size:.83rem;margin-bottom:16px">👻 Guest mode — score not saved.</div>' : '')
    + '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:8px">'
    + '<button class="btn btn-primary btn-sm" onclick="loadWordQuestGame(\'' + WQ.gradeId + '\')">🔄 Play Again</button>'
    + '<button class="btn btn-secondary btn-sm" onclick="goHome()">🏠 Home</button>'
    + '</div></div>';
}

// ── Game lifecycle (called from index.html) ───────────────────
function confirmLeave() { openModal('leave-modal'); }
function leaveGame()    { closeModal('leave-modal'); goHome(); }
