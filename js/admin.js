// ============================================================
// admin.js — Admin panel: Students, Scores, Settings, Import
// ============================================================

function switchTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.admin-panel').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('tab-btn-' + tab).classList.add('active');
  document.getElementById('admin-tab-' + tab).classList.add('active');
  if (tab === 'students') {
    getStudentsAsync(function(students) {
      DB.set('students_cache', students);
      populateGradeDropdowns();
      renderStudentTable();
    });
  }
  if (tab === 'scores') {
    getScoresAsync(function(scores) {
      DB.set('scores_cache', scores);
      populateGradeDropdowns();
      renderScoreTable();
    });
  }
}

// ── Grade / Room filter helpers ───────────────────────────────
var GRADE_LIST = ['P.1','P.2','P.3','P.4','P.5','P.6','M.1','M.2','M.3','M.4','M.5','M.6'];

function populateGradeDropdowns() {
  ['sf-grade', 'scf-grade'].forEach(function(id) {
    var sel = document.getElementById(id); if (!sel) return;
    var cur = sel.value;
    sel.innerHTML = '<option value="all">All Levels</option>'
      + GRADE_LIST.map(function(g) { return '<option value="' + g + '">' + g + '</option>'; }).join('');
    if (cur) sel.value = cur;
  });
  updateSfRooms();
  updateScfRooms();
}

function sfGradeChange()  { updateSfRooms();  renderStudentTable(); }
function scfGradeChange() { updateScfRooms(); renderScoreTable(); }

function updateSfRooms() {
  var grade = document.getElementById('sf-grade').value;
  var rooms = _roomsFrom(getStudents(), grade);
  _fillRoomSel('sf-room', rooms);
}
function updateScfRooms() {
  var grade = document.getElementById('scf-grade').value;
  var rooms = _roomsFrom(getScores(), grade);
  _fillRoomSel('scf-room', rooms);
}
function _roomsFrom(arr, grade) {
  var rooms = [];
  arr.forEach(function(s) {
    if ((grade === 'all' || s.grade === grade) && s.room && rooms.indexOf(s.room) < 0) rooms.push(s.room);
  });
  return rooms.sort();
}
function _fillRoomSel(selId, rooms) {
  var sel = document.getElementById(selId); if (!sel) return;
  var cur = sel.value;
  sel.innerHTML = '<option value="all">All Rooms</option>'
    + rooms.map(function(r) { return '<option value="' + r + '">Room ' + r + '</option>'; }).join('');
  if (rooms.indexOf(cur) >= 0) sel.value = cur; else sel.value = 'all';
}

// ── Student CRUD ──────────────────────────────────────────────
function addStudent() {
  var id    = document.getElementById('ns-id').value.trim();
  var name  = document.getElementById('ns-name').value.trim();
  var grade = document.getElementById('ns-grade').value;
  var room  = document.getElementById('ns-room').value.trim();
  var pw    = document.getElementById('ns-pw').value.trim();
  if (!id || !grade) { showToast('Please enter Student ID and Level.', 'error'); return; }
  var students = getStudents();
  for (var i = 0; i < students.length; i++) {
    if (students[i].id === id) { showToast('Student ID already exists!', 'error'); return; }
  }
  var newStudent = { id:id, name:name, grade:grade, room:room, pw:pw };
  addStudentAsync(newStudent, function(err) {
    if (err) { showToast('Error saving student.', 'error'); return; }
    getStudentsAsync(function(fresh) {
      DB.set('students_cache', fresh);
      ['ns-id','ns-name','ns-room','ns-pw'].forEach(function(f) { document.getElementById(f).value = ''; });
      document.getElementById('ns-grade').value = '';
      updateSfRooms(); renderStudentTable();
      showToast('Added: ' + id, 'success');
    });
  });
}

function openEditStudent(id) {
  var students = getStudents(); var s = null;
  for (var i = 0; i < students.length; i++) { if (students[i].id === id) { s = students[i]; break; } }
  if (!s) return;
  document.getElementById('edit-orig-id').value = s.id;
  document.getElementById('edit-sid').value     = s.id;
  document.getElementById('edit-sname').value   = s.name  || '';
  document.getElementById('edit-sgrade').value  = s.grade || 'M.1';
  document.getElementById('edit-sroom').value   = s.room  || '';
  document.getElementById('edit-spw').value     = s.pw    || '';
  openModal('edit-student-modal');
}

function saveEditStudent() {
  var origId = document.getElementById('edit-orig-id').value;
  var newId  = document.getElementById('edit-sid').value.trim();
  var name   = document.getElementById('edit-sname').value.trim();
  var grade  = document.getElementById('edit-sgrade').value;
  var room   = document.getElementById('edit-sroom').value.trim();
  var pw     = document.getElementById('edit-spw').value.trim();
  if (!newId || !grade) { showToast('ID and Level are required.', 'error'); return; }
  if (newId !== origId) {
    var students = getStudents();
    for (var i = 0; i < students.length; i++) {
      if (students[i].id === newId) { showToast('That ID already exists.', 'error'); return; }
    }
  }
  updateStudentAsync(origId, { id:newId, name:name, grade:grade, room:room, pw:pw }, function(err) {
    if (err) { showToast('Error updating student.', 'error'); return; }
    getStudentsAsync(function(fresh) {
      DB.set('students_cache', fresh);
      closeModal('edit-student-modal');
      updateSfRooms(); renderStudentTable();
      showToast('Student updated.', 'success');
    });
  });
}

function deleteStudent(id) {
  if (!confirm('Delete student: ' + id + '?')) return;
  deleteStudentAsync(id, function(err) {
    if (err) { showToast('Error deleting student.', 'error'); return; }
    getStudentsAsync(function(fresh) {
      DB.set('students_cache', fresh);
      updateSfRooms(); renderStudentTable();
      showToast('Student deleted.', 'success');
    });
  });
}

function clearAllStudents() {
  if (!confirm('Delete ALL students? This cannot be undone.')) return;
  clearStudentsAsync(function(err) {
    if (err) { showToast('Error clearing students.', 'error'); return; }
    DB.set('students_cache', []);
    updateSfRooms(); renderStudentTable();
    showToast('All students deleted.', 'success');
  });
}

// ── Student Checkbox ──────────────────────────────────────────
function toggleSelectAllStudents(masterCb) {
  document.querySelectorAll('#student-tbody .row-cb').forEach(function(cb) { cb.checked = masterCb.checked; });
  _updateStudentDeleteBtn();
}
function _updateStudentDeleteBtn() {
  var checked = document.querySelectorAll('#student-tbody .row-cb:checked').length;
  var btn = document.getElementById('btn-delete-selected-students');
  if (btn) { btn.disabled = checked === 0; btn.textContent = checked > 0 ? '🗑️ Delete Selected (' + checked + ')' : '🗑️ Delete Selected'; }
  var all = document.querySelectorAll('#student-tbody .row-cb');
  var master = document.getElementById('student-master-cb');
  if (master && all.length > 0) { master.indeterminate = checked > 0 && checked < all.length; master.checked = checked === all.length; }
}
function deleteSelectedStudents() {
  var checked = document.querySelectorAll('#student-tbody .row-cb:checked');
  if (!checked.length) return;
  if (!confirm('Delete ' + checked.length + ' selected student(s)?')) return;
  var ids = [];
  checked.forEach(function(cb) { ids.push(cb.dataset.id); });
  deleteStudentsAsync(ids, function(err) {
    if (err) { showToast('Error deleting students.', 'error'); return; }
    getStudentsAsync(function(fresh) {
      DB.set('students_cache', fresh);
      updateSfRooms(); renderStudentTable();
      showToast('Deleted ' + ids.length + ' student(s).', 'success');
    });
  });
}

// ── Render student table ──────────────────────────────────────
function renderStudentTable() {
  var students = getStudents();
  var gf = document.getElementById('sf-grade').value;
  var rf = document.getElementById('sf-room').value;
  var filtered = students.filter(function(s) {
    return (gf === 'all' || s.grade === gf) && (rf === 'all' || s.room === rf);
  });
  document.getElementById('student-count-label').textContent =
    'Student List (' + students.length + ' total, showing ' + filtered.length + ')';
  var master = document.getElementById('student-master-cb');
  if (master) { master.checked = false; master.indeterminate = false; }
  var delBtn = document.getElementById('btn-delete-selected-students');
  if (delBtn) { delBtn.disabled = true; delBtn.textContent = '🗑️ Delete Selected'; }
  var tbody = document.getElementById('student-tbody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">No students found.</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(function(s, i) {
    return '<tr>'
      + '<td style="text-align:center;width:36px"><input type="checkbox" class="row-cb admin-cb" data-id="' + htmlEsc(s.id) + '" onchange="_updateStudentDeleteBtn()"></td>'
      + '<td style="color:var(--text3)">' + (i+1) + '</td>'
      + '<td><b>' + htmlEsc(s.id) + '</b></td>'
      + '<td>' + htmlEsc(s.name || '-') + '</td>'
      + '<td><span class="tag tag-grade">' + htmlEsc(s.grade) + '</span></td>'
      + '<td style="color:var(--text2)">' + htmlEsc(s.room || '-') + '</td>'
      + '<td style="color:var(--text3);font-size:.8rem">' + (s.pw ? '••••' : 'None') + '</td>'
      + '<td style="text-align:right;white-space:nowrap"><div style="display:flex;justify-content:flex-end;gap:6px">'
      + '<button class="btn btn-sm" style="background:rgba(108,92,231,.15);color:#A29BFE;border:1px solid rgba(108,92,231,.3);font-size:.76rem" onclick="openEditStudent(\'' + htmlEsc(s.id) + '\')">✏️ Edit</button>'
      + '<button class="btn btn-sm" style="background:rgba(225,112,85,.12);color:#FF8A72;border:1px solid rgba(225,112,85,.3);font-size:.76rem" onclick="deleteStudent(\'' + htmlEsc(s.id) + '\')">🗑️ Del</button>'
      + '</div></td></tr>';
  }).join('');
}

// ── Scores ────────────────────────────────────────────────────
function renderScoreTable() {
  var scores = getScores().sort(function(a, b) { return b.ts - a.ts; });
  var gf  = document.getElementById('scf-grade').value;
  var rf  = document.getElementById('scf-room').value;
  var gmf = document.getElementById('scf-game').value;
  var filtered = scores.filter(function(s) {
    return (gf === 'all' || s.grade === gf) && (rf === 'all' || s.room === rf) && (gmf === 'all' || s.game === gmf);
  });
  var master = document.getElementById('score-master-cb');
  if (master) { master.checked = false; master.indeterminate = false; }
  var delBtn = document.getElementById('btn-clear-selected-scores');
  if (delBtn) { delBtn.disabled = true; delBtn.textContent = '🗑️ Clear Selected'; }
  var tbody = document.getElementById('score-tbody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--text3);padding:24px">No scores found.</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(function(s, i) {
    return '<tr>'
      + '<td style="text-align:center;width:36px"><input type="checkbox" class="row-cb admin-cb" data-ts="' + s.ts + '" onchange="_updateScoreDeleteBtn()"></td>'
      + '<td style="color:var(--text3)">' + (i+1) + '</td>'
      + '<td><b>' + htmlEsc(s.studentId) + '</b></td>'
      + '<td>' + htmlEsc(s.name || '-') + '</td>'
      + '<td><span class="tag tag-grade">' + htmlEsc(s.grade) + '</span></td>'
      + '<td style="color:var(--text2)">' + htmlEsc(s.room || '-') + '</td>'
      + '<td style="font-size:.8rem">' + htmlEsc(s.game) + '</td>'
      + '<td><span class="score-badge">' + s.score.toLocaleString() + '</span></td>'
      + '<td style="font-size:.8rem;color:var(--text2)">✅' + s.correct + ' ❌' + s.wrong + '</td>'
      + '<td style="font-size:.76rem;color:var(--text3)">' + htmlEsc(s.date) + ' ' + htmlEsc(s.time) + '</td>'
      + '</tr>';
  }).join('');
}

// ── Score Checkbox ────────────────────────────────────────────
function toggleSelectAllScores(masterCb) {
  document.querySelectorAll('#score-tbody .row-cb').forEach(function(cb) { cb.checked = masterCb.checked; });
  _updateScoreDeleteBtn();
}
function _updateScoreDeleteBtn() {
  var checked = document.querySelectorAll('#score-tbody .row-cb:checked').length;
  var btn = document.getElementById('btn-clear-selected-scores');
  if (btn) { btn.disabled = checked === 0; btn.textContent = checked > 0 ? '🗑️ Clear Selected (' + checked + ')' : '🗑️ Clear Selected'; }
  var all = document.querySelectorAll('#score-tbody .row-cb');
  var master = document.getElementById('score-master-cb');
  if (master && all.length > 0) { master.indeterminate = checked > 0 && checked < all.length; master.checked = checked === all.length; }
}
function clearSelectedScores() {
  var checked = document.querySelectorAll('#score-tbody .row-cb:checked');
  if (!checked.length) return;
  if (!confirm('Clear ' + checked.length + ' selected score(s)?')) return;
  var tsList = [];
  checked.forEach(function(cb) { tsList.push(Number(cb.dataset.ts)); });
  deleteScoresAsync(tsList, function(err) {
    if (err) { showToast('Error clearing scores.', 'error'); return; }
    getScoresAsync(function(fresh) {
      DB.set('scores_cache', fresh);
      renderScoreTable();
      showToast('Cleared ' + tsList.length + ' score(s).', 'success');
    });
  });
}

function exportCSV() {
  var scores = getScores().sort(function(a, b) { return b.ts - a.ts; });
  var gf  = document.getElementById('scf-grade').value;
  var rf  = document.getElementById('scf-room').value;
  var gmf = document.getElementById('scf-game').value;
  var filtered = scores.filter(function(s) {
    return (gf === 'all' || s.grade === gf) && (rf === 'all' || s.room === rf) && (gmf === 'all' || s.game === gmf);
  });
  var bom = '\uFEFF';
  var header = 'No.,Student ID,Name,Level,Room,Game,Score,Correct,Wrong,Date,Time';
  var rows = filtered.map(function(s, i) {
    return [i+1, s.studentId, s.name, s.grade, s.room||'', s.game, s.score, s.correct, s.wrong, s.date, s.time].join(',');
  });
  var blob = new Blob([bom + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'EoV_Scores_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToast('CSV exported!', 'success');
}

function clearAllScores() {
  if (!confirm('Clear ALL scores? This cannot be undone.')) return;
  clearScoresAsync(function(err) {
    if (err) { showToast('Error clearing scores.', 'error'); return; }
    DB.set('scores_cache', []);
    renderScoreTable();
    showToast('All scores cleared.', 'success');
  });
}

// ── Settings ──────────────────────────────────────────────────
function changeAdminPw() {
  var old = document.getElementById('old-pw').value;
  var nw  = document.getElementById('new-pw').value;
  var cf  = document.getElementById('confirm-pw').value;
  var creds = getAdminCreds();
  if (old !== creds.pass)  { showToast('Current password is incorrect.', 'error'); return; }
  if (nw !== cf)           { showToast('New passwords do not match.', 'error'); return; }
  if (nw.length < 4)       { showToast('Password must be at least 4 characters.', 'error'); return; }
  DB.set('admin', { user: creds.user, pass: nw });
  showToast('Password changed!', 'success');
  ['old-pw','new-pw','confirm-pw'].forEach(function(f) { document.getElementById(f).value = ''; });
}

// ── Import ────────────────────────────────────────────────────
function downloadTemplate() {
  var bom = '\uFEFF';
  var csv = bom + 'No.,ID,Name,Level,Room,Password\n1,67001,John Smith,M.1,1,1234\n2,67002,Jane Doe,M.1,2,\n3,67003,Tom Brown,M.2,1,\n';
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'EoV_Student_Template.csv'; a.click();
  showToast('Template downloaded!', 'success');
}

function handleFileImport(input) {
  var file = input.files[0]; if (!file) return;
  var ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'csv') {
    var reader = new FileReader();
    reader.onload = function(e) { parseImportData(e.target.result); };
    reader.readAsText(file, 'UTF-8');
  } else if (ext === 'xls' || ext === 'xlsx') {
    var doRead = function() {
      var r2 = new FileReader();
      r2.onload = function(e) {
        var wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        parseImportData(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]));
      };
      r2.readAsArrayBuffer(file);
    };
    if (typeof XLSX === 'undefined') {
      var sc = document.createElement('script');
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      sc.onload = doRead; document.head.appendChild(sc);
    } else doRead();
  } else { showToast('Use .csv or .xlsx files only.', 'error'); }
  input.value = '';
}

function parseImportData(text) {
  var lines = text.split(/\r?\n/).filter(function(l) { return l.trim(); });
  var toAdd = []; var skipped = 0;
  var existingIds = getStudents().map(function(s) { return s.id; });
  lines.forEach(function(line, idx) {
    var cols = line.split(',').map(function(c) { return c.trim().replace(/^"|"$/g, ''); });
    if (idx === 0 && (isNaN(Number(cols[0])) || cols[0].toLowerCase() === 'no' || cols[0].toLowerCase() === 'no.')) return;
    var id = cols[1], name = cols[2]||'', grade = cols[3]||'', room = cols[4]||'', pw = cols[5]||'';
    if (!id || !grade) return;
    if (existingIds.indexOf(id) >= 0) { skipped++; return; }
    toAdd.push({ id:id, name:name, grade:grade, room:room, pw:pw }); existingIds.push(id);
  });
  if (!toAdd.length) { showToast('No new students. Skipped: ' + skipped, 'error'); return; }
  var done = 0;
  toAdd.forEach(function(s) {
    addStudentAsync(s, function() {
      done++;
      if (done === toAdd.length) {
        getStudentsAsync(function(fresh) {
          DB.set('students_cache', fresh);
          updateSfRooms(); renderStudentTable();
          showToast('Imported: ' + toAdd.length + ' | Skipped: ' + skipped, 'success');
        });
      }
    });
  });
}

function importPastedCSV() {
  var text = document.getElementById('csv-paste').value.trim();
  if (!text) { showToast('Please paste some data first.', 'error'); return; }
  var lines = text.split(/\n/).filter(function(l) { return l.trim(); });
  var toAdd = []; var skipped = 0;
  var existingIds = getStudents().map(function(s) { return s.id; });
  lines.forEach(function(line) {
    var cols = line.split(',').map(function(c) { return c.trim(); });
    var id = cols[0], name = cols[1]||'', grade = cols[2]||'', room = cols[3]||'', pw = cols[4]||'';
    if (!id || !grade) return;
    if (existingIds.indexOf(id) >= 0) { skipped++; return; }
    toAdd.push({ id:id, name:name, grade:grade, room:room, pw:pw }); existingIds.push(id);
  });
  if (!toAdd.length) { showToast('No new students. Skipped: ' + skipped, 'error'); return; }
  var done = 0;
  toAdd.forEach(function(s) {
    addStudentAsync(s, function() {
      done++;
      if (done === toAdd.length) {
        getStudentsAsync(function(fresh) {
          DB.set('students_cache', fresh);
          updateSfRooms(); renderStudentTable();
          document.getElementById('csv-paste').value = '';
          showToast('Imported: ' + toAdd.length + ' | Skipped: ' + skipped, 'success');
        });
      }
    });
  });
}

function populateScoreGameFilter() {
  var sel = document.getElementById('scf-game'); if (!sel) return;
  sel.innerHTML = '<option value="all">All Games</option>';
  var names = [];
  Object.keys(GAME_REGISTRY).forEach(function(grade) {
    GAME_REGISTRY[grade].forEach(function(g) { if (names.indexOf(g.name) < 0) names.push(g.name); });
  });
  names.forEach(function(n) {
    var opt = document.createElement('option'); opt.value = n; opt.textContent = n; sel.appendChild(opt);
  });
}
