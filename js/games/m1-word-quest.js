// ============================================================
// games/m1-word-quest.js — Word Quest RPG (M.1)
// To add a new game: copy this file, change the IDs/data,
// then add an entry in home.js GAME_REGISTRY.
// ============================================================

// ── Question bank (50 questions — shuffled each round) ───────
var WQ_QUESTIONS = [
  // VOCABULARY
  { type:'vocab', word:'Apple',      choices:['A red or green fruit','A vegetable','A type of bread','A drink'],              answer:'A red or green fruit',    hint:'One a day keeps the doctor away!',        explain:'"Apple" is a fruit. It can be red, green, or yellow.' },
  { type:'vocab', word:'Book',       choices:['You read it','You eat it','You wear it','You drive it'],                       answer:'You read it',             hint:'Found in a library',                      explain:'"Book" is something you read. Libraries are full of books.' },
  { type:'vocab', word:'School',     choices:['A place to learn','A place to sleep','A place to eat','A type of fish'],      answer:'A place to learn',        hint:'Students go here every day',              explain:'"School" is a place where students go to learn from teachers.' },
  { type:'vocab', word:'Beautiful',  choices:['Very pretty','Very ugly','Very fast','Very strong'],                           answer:'Very pretty',             hint:'An adjective about looks',                explain:'"Beautiful" means very pretty or attractive in appearance.' },
  { type:'vocab', word:'Friend',     choices:['Someone you like','An enemy','A teacher','A doctor'],                         answer:'Someone you like',        hint:'You enjoy time together',                 explain:'"Friend" is a person you like and enjoy spending time with.' },
  { type:'vocab', word:'Happy',      choices:['Feeling great joy','Feeling angry','Feeling sad','Feeling scared'],            answer:'Feeling great joy',       hint:'Opposite of sad',                         explain:'"Happy" means feeling great joy or pleasure. Opposite of sad.' },
  { type:'vocab', word:'Run',        choices:['Move fast on foot','Sleep','Eat quickly','Look carefully'],                    answer:'Move fast on foot',       hint:'Faster than walking',                     explain:'"Run" means to move fast on foot. It is faster than walking.' },
  { type:'vocab', word:'Mountain',   choices:['A tall landform','An ocean','A flat field','A city'],                         answer:'A tall landform',         hint:'Often has snow at the top',               explain:'"Mountain" is a very tall landform. Famous ones include Everest.' },
  { type:'vocab', word:'Teacher',    choices:['Helps students learn','Fixes cars','Cooks food','Fights fires'],              answer:'Helps students learn',    hint:'Works in a school',                       explain:'"Teacher" is someone whose job is to help students learn.' },
  { type:'vocab', word:'Water',      choices:['A liquid we drink','A type of food','A gas','A kind of rock'],                answer:'A liquid we drink',       hint:'H2O - essential for life',                explain:'"Water" is the liquid we drink every day. Chemical formula: H2O.' },
  { type:'vocab', word:'Generous',   choices:['Willing to give','Very selfish','Easily angered','Very shy'],                 answer:'Willing to give',         hint:'Opposite of selfish',                     explain:'"Generous" means willing to give freely to others. Opposite of selfish.' },
  { type:'vocab', word:'Enormous',   choices:['Extremely large','Very small','Very beautiful','Very fast'],                  answer:'Extremely large',         hint:'Even bigger than "huge"',                 explain:'"Enormous" means extremely large - even bigger than "huge" or "big".' },
  { type:'vocab', word:'Curious',    choices:['Eager to know','Feeling bored','Very brave','Very lazy'],                     answer:'Eager to know',           hint:'Curiosity killed the cat!',               explain:'"Curious" means eager to learn or know about something.' },
  { type:'vocab', word:'Angry',      choices:['Feeling mad','Feeling happy','Feeling tired','Feeling cold'],                 answer:'Feeling mad',             hint:'You might shout when feeling this',       explain:'"Angry" means feeling strong displeasure or rage about something.' },
  { type:'vocab', word:'Brave',      choices:['Not afraid of danger','Very tired','Very hungry','Very cold'],                answer:'Not afraid of danger',    hint:'Heroes are always this',                  explain:'"Brave" means showing courage and not being afraid of danger.' },
  { type:'vocab', word:'Clever',     choices:['Quick to understand','Very slow','Very tall','Very loud'],                    answer:'Quick to understand',     hint:'Synonyms: smart, intelligent',            explain:'"Clever" means quick to understand things. Similar to smart or intelligent.' },
  { type:'vocab', word:'Dangerous',  choices:['Likely to cause harm','Very safe','Very boring','Very quiet'],                answer:'Likely to cause harm',    hint:'Opposite of safe',                        explain:'"Dangerous" means likely to cause harm or injury. Opposite of safe.' },
  { type:'vocab', word:'Delicious',  choices:['Tasting very good','Smelling bad','Looking ugly','Feeling rough'],            answer:'Tasting very good',       hint:'You say this about great food',           explain:'"Delicious" describes food or drink that tastes extremely good.' },
  { type:'vocab', word:'Honest',     choices:['Telling the truth','Telling lies','Being lazy','Being loud'],                 answer:'Telling the truth',       hint:'Opposite of dishonest',                   explain:'"Honest" means always telling the truth and not lying.' },
  { type:'vocab', word:'Patient',    choices:['Able to wait calmly','Very angry','Very quick','Very loud'],                  answer:'Able to wait calmly',     hint:'Opposite of impatient',                   explain:'"Patient" means able to wait calmly without getting upset.' },
  { type:'vocab', word:'Polite',     choices:['Having good manners','Being rude','Being lazy','Being loud'],                 answer:'Having good manners',     hint:'You say "please" and "thank you"',        explain:'"Polite" means having good manners, saying please and thank you.' },
  { type:'vocab', word:'Shy',        choices:['Nervous around people','Very brave','Very loud','Very happy'],                answer:'Nervous around people',   hint:'Opposite of outgoing',                    explain:'"Shy" means nervous or uncomfortable around other people.' },
  { type:'vocab', word:'Tired',      choices:['Needing rest or sleep','Full of energy','Very happy','Very angry'],           answer:'Needing rest or sleep',   hint:'How you feel after a long day',           explain:'"Tired" means needing rest or sleep, usually after working hard.' },
  { type:'vocab', word:'Excited',    choices:['Very happy and eager','Very sad','Very tired','Very angry'],                  answer:'Very happy and eager',    hint:'How you feel before a holiday',           explain:'"Excited" means feeling very happy and enthusiastic about something.' },
  { type:'vocab', word:'Hungry',     choices:['Wanting to eat food','Wanting to sleep','Wanting to run','Feeling cold'],     answer:'Wanting to eat food',     hint:'Your stomach might growl',                explain:'"Hungry" means feeling the need to eat because your stomach is empty.' },
  { type:'vocab', word:'Library',    choices:['A place with books','A place to swim','A place to cook','A place to sleep'],  answer:'A place with books',      hint:'You need to be quiet here',               explain:'"Library" is a building where books are kept and people can read.' },
  { type:'vocab', word:'Hospital',   choices:['A place for sick people','A place to study','A place to shop','A place to play'], answer:'A place for sick people', hint:'Doctors and nurses work here',        explain:'"Hospital" is where sick or injured people go to be treated by doctors.' },
  { type:'vocab', word:'Introduce',  choices:['To present someone','To finish something','To eat quickly','To run fast'],    answer:'To present someone',      hint:'"Let me ___ myself"',                     explain:'"Introduce" means to present yourself or another person for the first time.' },
  { type:'vocab', word:'Improve',    choices:['To get better','To get worse','To stay the same','To forget'],                answer:'To get better',           hint:'Practice makes perfect - you will ___',   explain:'"Improve" means to get better at something through practice or effort.' },
  { type:'vocab', word:'Remember',   choices:['To keep in mind','To forget','To lose','To break'],                           answer:'To keep in mind',         hint:'Opposite of forget',                      explain:'"Remember" means to keep something in your mind. Opposite of forget.' },
  // GRAMMAR
  { type:'grammar', word:'She ___ a student.',              choices:['is','are','am','be'],                    answer:'is',          hint:'She = singular 3rd person',            explain:'"She" is 3rd person singular. Rule: I am / You are / She IS / They are.' },
  { type:'grammar', word:'They ___ happy.',                 choices:['is','are','am','be'],                    answer:'are',         hint:'They = plural',                        explain:'"They" is plural. Rule: I am / He is / They ARE / We are.' },
  { type:'grammar', word:'I ___ 13 years old.',             choices:['is','are','am','be'],                    answer:'am',          hint:'I always uses "am"',                   explain:'"I" always takes "am". This is a fixed rule: I AM (never I is/are).' },
  { type:'grammar', word:'He ___ to school yesterday.',     choices:['go','goes','went','going'],               answer:'went',        hint:'Yesterday = past tense',               explain:'"Yesterday" signals past tense. "go" is irregular: go -> went (past).' },
  { type:'grammar', word:'We ___ eating right now.',        choices:['is','are','am','be'],                    answer:'are',         hint:'We + Present Continuous',              explain:'Present Continuous = am/is/are + verb-ing. "We" always uses "are".' },
  { type:'grammar', word:'___ you like cats?',              choices:['Do','Does','Is','Are'],                   answer:'Do',          hint:'Question with "you" uses Do',          explain:'Simple present Yes/No questions: Do/Does + subject + verb. "you" -> Do.' },
  { type:'grammar', word:'She ___ not know him.',           choices:['do','does','is','has'],                   answer:'does',        hint:'She = singular -> Does',               explain:'Negative simple present: he/she/it + does not + verb. She DOES not.' },
  { type:'grammar', word:'I have ___ my homework.',         choices:['do','did','done','doing'],                answer:'done',        hint:'Present Perfect: have + V3',           explain:'Present Perfect = have/has + past participle (V3). do -> done.' },
  { type:'grammar', word:'The cat ___ on the table.',       choices:['sit','sits','sat','sitting'],             answer:'sits',        hint:'Singular subject adds -s',             explain:'Simple present 3rd person singular: always add -s. The cat SITS.' },
  { type:'grammar', word:'___ he playing football now?',    choices:['Do','Does','Is','Are'],                   answer:'Is',          hint:'Present Continuous Question with He',  explain:'Present Continuous question: Is/Are + subject + -ing. "He" uses Is.' },
  { type:'grammar', word:'My friends ___ very kind.',       choices:['is','are','am','be'],                    answer:'are',         hint:'My friends = plural',                  explain:'"My friends" is plural, so we use "are". Not "is" (that is singular).' },
  { type:'grammar', word:'She ___ TV every evening.',       choices:['watch','watches','watched','watching'],   answer:'watches',     hint:'She + simple present -> -es',          explain:'3rd person singular simple present: watch -> watches (-es ending).' },
  { type:'grammar', word:'We ___ to the park last Sunday.', choices:['go','goes','went','going'],               answer:'went',        hint:'Last Sunday = past',                   explain:'"Last Sunday" = past tense. Irregular verb: go -> went.' },
  { type:'grammar', word:'___ your sister like music?',     choices:['Do','Does','Is','Are'],                   answer:'Does',        hint:'Your sister = 3rd person singular',    explain:'3rd person singular simple present question uses "Does": Does she/he/it.' },
  { type:'grammar', word:'They ___ not playing right now.', choices:['is','are','am','was'],                    answer:'are',         hint:'They + continuous -> are',             explain:'Negative Present Continuous with "they": They ARE not playing.' },
  { type:'grammar', word:'I ___ never been to London.',     choices:['have','has','had','am'],                  answer:'have',        hint:'I + Present Perfect = have',           explain:'Present Perfect: I/You/We/They HAVE + past participle.' },
  { type:'grammar', word:'He has ___ his lunch already.',   choices:['eat','ate','eaten','eating'],             answer:'eaten',       hint:'has + V3 (past participle)',           explain:'Present Perfect = has + V3. "eat" -> irregular V3 is "eaten".' },
  { type:'grammar', word:'___ she speak English well?',     choices:['Do','Does','Is','Are'],                   answer:'Does',        hint:'she = 3rd person singular',            explain:'Simple present question with she/he/it always uses "Does".' },
  { type:'grammar', word:'I ___ my keys this morning.',     choices:['lose','lost','losing','have lose'],        answer:'lost',        hint:'This morning = simple past',           explain:'"This morning" = past tense. "lose" is irregular: lose -> lost.' },
  { type:'grammar', word:'Tom ___ his teeth twice a day.',  choices:['brush','brushes','brushed','brushing'],   answer:'brushes',     hint:'Tom = 3rd person singular',            explain:'Tom (he) is 3rd person singular. Simple present: brush -> brushes.' },
];

var WQ_MONSTERS = [
  { name:'Goblin',   emoji:'\u{1F47A}', hp:60,  atk:15, reward:100 },
  { name:'Slime',    emoji:'\uD83D\uDFE2', hp:40,  atk:10, reward:80  },
  { name:'Skeleton', emoji:'\uD83D\uDC80', hp:80,  atk:20, reward:130 },
  { name:'Dragon',   emoji:'\uD83D\uDC09', hp:150, atk:35, reward:300 },
  { name:'Witch',    emoji:'\uD83E\uDDD9', hp:90,  atk:25, reward:180 },
  { name:'Ghost',    emoji:'\uD83D\uDC7B', hp:70,  atk:18, reward:120 },
  { name:'Orc',      emoji:'\uD83D\uDC79', hp:100, atk:28, reward:200 },
  { name:'Vampire',  emoji:'\uD83E\uDDDB', hp:110, atk:22, reward:210 },
];

var WQ = {};

function loadWordQuestGame(gradeId) {
  var shuffled = WQ_QUESTIONS.slice().sort(function() { return Math.random() - 0.5; });
  WQ = {
    gradeId: gradeId, gameName: 'Word Quest RPG',
    questions: shuffled, qIndex: 0, totalQ: Math.min(15, shuffled.length),
    score: 0, wave: 1, streak: 0, maxStreak: 0, correct: 0, wrong: 0,
    playerHp: 100, maxPlayerHp: 100, monster: null, monsterHp: 0, monstersDefeated: 0,
    powerups: { hint: 2, shield: 1, double: 1 },
    shieldActive: false, doubleActive: false,
    phase: 'battle',
    history: []
  };
  _wqNextMonster();
  showScreen('game-screen');
  document.getElementById('navbar').style.display = 'flex';
  document.getElementById('game-title-bar').textContent = '\u2694\uFE0F Word Quest RPG';
  _wqRender();
}

function _wqNextMonster() {
  var m = WQ_MONSTERS[WQ.monstersDefeated % WQ_MONSTERS.length];
  var scale = 1 + (WQ.wave - 1) * 0.3;
  WQ.monster = { name: m.name, emoji: m.emoji, hp: Math.round(m.hp * scale), atk: m.atk, reward: m.reward };
  WQ.monster.maxHp = WQ.monster.hp;
  WQ.monsterHp = WQ.monster.hp;
}

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
    // ── progress + counter (flex-shrink:0) ──
    '<div class="progress-bar"><div class="progress-fill" style="width:' + qProg + '%"></div></div>'
    + '<div class="wq-counter">'
    + '<span>Question ' + (WQ.qIndex+1) + ' / ' + WQ.totalQ + '</span>'
    + '<span>Monster #' + (WQ.monstersDefeated+1) + ' &nbsp;Wave ' + WQ.wave + '</span>'
    + '</div>'
    // ── battle arena (flex-shrink:0) ──
    + '<div class="battle-arena">'
    + '<div class="player-side"><div class="player-box">'
    + '<div class="player-name">⚔️ Warrior ' + WQ.gradeId + '</div>'
    + '<div class="player-avatar" id="pl-avatar">🧙‍♂️</div>'
    + '<div class="hp-row"><span style="font-size:.65rem;color:var(--text3)">HP</span>'
    + '<div class="hp-bar"><div class="hp-fill ' + plClass + '" id="pl-hp" style="width:' + plPct + '%"></div></div>'
    + '<span class="hp-label" style="color:var(--success)">' + WQ.playerHp + '/' + WQ.maxPlayerHp + '</span></div>'
    + (WQ.shieldActive ? '<div style="font-size:.7rem;color:var(--secondary)">🛡️ Shield!</div>' : '')
    + (WQ.doubleActive ? '<div style="font-size:.7rem;color:var(--accent)">⚡ Double!</div>' : '')
    + '<div style="font-size:.68rem;color:var(--text3);margin-top:4px">🔥 ' + WQ.streak + ' &nbsp;✅ ' + WQ.correct + ' &nbsp;❌ ' + WQ.wrong + '</div>'
    + '</div></div>'
    + '<div class="monster-side"><div class="monster-box">'
    + '<div class="monster-name">' + WQ.monster.name + '</div>'
    + '<div class="monster-display" id="mon-emoji">' + WQ.monster.emoji + '</div>'
    + '<div class="hp-row"><span style="font-size:.65rem;color:var(--text3)">HP</span>'
    + '<div class="hp-bar"><div class="hp-fill" id="mon-hp" style="width:' + mnPct + '%"></div></div>'
    + '<span class="hp-label" style="color:var(--danger)">' + WQ.monsterHp + '/' + WQ.monster.maxHp + '</span></div>'
    + '<div style="font-size:.68rem;color:var(--text3);margin-top:4px">⚔️ ATK ' + WQ.monster.atk + ' &nbsp;💎 ' + WQ.monster.reward + ' pts</div>'
    + '</div></div>'
    + '</div>'
    // ── powerups (flex-shrink:0) ──
    + '<div class="powerups">'
    + '<button class="powerup-btn" id="wq-pu-hint"   ' + (WQ.powerups.hint   <= 0 ? 'disabled' : '') + '>💡 Hint <span class="powerup-count">' + WQ.powerups.hint   + '</span></button>'
    + '<button class="powerup-btn" id="wq-pu-shield" ' + (WQ.powerups.shield <= 0 || WQ.shieldActive ? 'disabled' : '') + '>🛡️ Shield <span class="powerup-count">' + WQ.powerups.shield + '</span></button>'
    + '<button class="powerup-btn" id="wq-pu-double" ' + (WQ.powerups.double <= 0 || WQ.doubleActive ? 'disabled' : '') + '>⚡ Double <span class="powerup-count">' + WQ.powerups.double + '</span></button>'
    + '</div>'
    // ── question box (flex-shrink:0) ──
    + '<div class="question-box">'
    + '<div style="text-align:center;font-size:.68rem;font-weight:800;letter-spacing:1px;margin-bottom:4px;color:'
    + (q.type === 'grammar' ? '#A29BFE' : '#00CEC9') + '">'
    + (q.type === 'grammar' ? '📝 GRAMMAR' : '📚 VOCABULARY') + '</div>'
    + '<div class="question-word">' + htmlEsc(q.word) + '</div>'
    + '<div class="question-text">' + (q.type === 'vocab' ? 'What does this word mean?' : 'Fill in the blank:') + '</div>'
    + '<div id="wq-hint" style="display:none;text-align:center;color:var(--text3);font-size:.75rem;margin-top:4px">💡 ' + htmlEsc(q.hint) + '</div>'
    + '</div>'
    // ── choices (flex:1 — fills remaining height) ──
    + '<div class="choices" id="wq-choices">'
    + choices.map(function(c) {
        return '<button class="choice-btn" data-choice="' + encodeURIComponent(c) + '" data-answer="' + encodeURIComponent(q.answer) + '">' + htmlEsc(c) + '</button>';
      }).join('')
    + '</div>';

  document.getElementById('wq-pu-hint').addEventListener('click',   function() { _wqPowerup('hint'); });
  document.getElementById('wq-pu-shield').addEventListener('click', function() { _wqPowerup('shield'); });
  document.getElementById('wq-pu-double').addEventListener('click', function() { _wqPowerup('double'); });
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
  var q = WQ.questions[WQ.qIndex];
  var correct = (choice === answer);
  WQ.history.push({ q: q, chosen: choice, correct: correct });

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
  var emoji = pct >= 80 ? '\uD83C\uDFC6' : pct >= 60 ? '\u2B50' : pct >= 40 ? '\uD83D\uDE0A' : '\uD83D\uDCAA';
  var msg   = pct >= 80 ? 'Outstanding! You are a true Valor!'
            : pct >= 60 ? 'Great job! Keep it up!'
            : pct >= 40 ? 'Good effort! Practice more!'
            : 'Keep training \u2014 you will improve!';

  if (CU && !CU.isGuest && !CU.isAdmin) {
    var scores = getScores(), now = new Date();
    var newScore = {
      studentId: CU.id, name: CU.name || CU.id, grade: CU.grade, room: CU.room || '',
      game: WQ.gameName, score: WQ.score, correct: WQ.correct, wrong: WQ.wrong,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }),
      ts: now.getTime()
    };
    pushScoreAsync(newScore, function() { showToast('Score saved!', 'success'); });
  }

  // Build answer review
  var reviewHTML = WQ.history.map(function(h, i) {
    var icon     = h.correct ? '\u2705' : '\u274C';
    var tagColor = h.q.type === 'grammar' ? '#A29BFE' : '#00CEC9';
    var tagLabel = h.q.type === 'grammar' ? '\uD83D\uDCDD GRAMMAR' : '\uD83D\uDCDA VOCAB';
    var wrongRow = h.correct ? ''
      : '<div style="margin-top:4px;font-size:.8rem;color:var(--danger)">Your answer: <b>' + htmlEsc(h.chosen) + '</b></div>'
      + '<div style="font-size:.8rem;color:var(--success)">Correct answer: <b>' + htmlEsc(h.q.answer) + '</b></div>';
    return '<div style="background:var(--bg3);border-radius:10px;padding:14px;margin-bottom:10px;border-left:4px solid '
      + (h.correct ? 'var(--success)' : 'var(--danger)') + '">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
      + '<span>' + icon + '</span>'
      + '<span style="font-size:.7rem;font-weight:800;color:' + tagColor + '">' + tagLabel + '</span>'
      + '<span style="font-size:.72rem;color:var(--text3);margin-left:auto">Q' + (i+1) + '</span>'
      + '</div>'
      + '<div style="font-weight:700;font-size:.9rem;margin-bottom:4px">' + htmlEsc(h.q.word) + '</div>'
      + wrongRow
      + '<div style="margin-top:6px;font-size:.78rem;color:var(--text2);background:var(--card);border-radius:6px;padding:8px">'
      + '\uD83D\uDCD6 ' + htmlEsc(h.q.explain) + '</div>'
      + '</div>';
  }).join('');

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
    + '<div class="result-stat"><div class="result-stat-val" style="color:var(--accent)">'  + WQ.maxStreak + '</div><div class="result-stat-label">MAX STREAK \uD83D\uDD25</div></div>'
    + '<div class="result-stat"><div class="result-stat-val" style="color:var(--primary)">' + WQ.monstersDefeated + '</div><div class="result-stat-label">Monsters Defeated</div></div>'
    + '<div class="result-stat"><div class="result-stat-val" style="color:var(--secondary)">' + pct + '%</div><div class="result-stat-label">Accuracy</div></div>'
    + '<div class="result-stat"><div class="result-stat-val">' + WQ.wave + '</div><div class="result-stat-label">Highest Wave</div></div>'
    + '</div>'
    + (CU && CU.isGuest ? '<div style="background:rgba(253,203,110,.1);border:1px solid rgba(253,203,110,.3);border-radius:10px;padding:12px;color:var(--accent);font-size:.83rem;margin-bottom:16px">\uD83D\uDC7B Guest mode \u2014 score not saved.</div>' : '')
    + '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:8px;margin-bottom:28px">'
    + '<button class="btn btn-primary btn-sm" onclick="loadWordQuestGame(\'' + WQ.gradeId + '\')">\uD83D\uDD04 Play Again</button>'
    + '<button class="btn btn-secondary btn-sm" onclick="goHome()">\uD83C\uDFE0 Home</button>'
    + '</div>'
    + '<div style="text-align:left">'
    + '<div style="font-weight:800;font-size:1rem;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border)">\uD83D\uDCCB Answer Review \u2014 All ' + WQ.totalQ + ' Questions</div>'
    + reviewHTML
    + '</div></div>';
}

function confirmLeave() { openModal('leave-modal'); }
function leaveGame()    { closeModal('leave-modal'); goHome(); }
