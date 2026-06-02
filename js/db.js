// ============================================================
// db.js — Firebase Realtime Database layer
// Replaces localStorage for students and scores
// localStorage is still used for: session, admin credentials
// ============================================================

var DB_READY = false;
var _db = null;

// ── Init ──────────────────────────────────────────────────────
function initFirebase() {
  var config = {
    apiKey:            "AIzaSyB4V2-ApIAju6ab9HIdSpSXueN_59XV2dg",
    authDomain:        "english-of-valor.firebaseapp.com",
    databaseURL:       "https://english-of-valor-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:         "english-of-valor",
    storageBucket:     "english-of-valor.firebasestorage.app",
    messagingSenderId: "183008256311",
    appId:             "1:183008256311:web:cc09551ef0f55fb7a87ab2"
  };
  firebase.initializeApp(config);
  _db = firebase.database();
  DB_READY = true;
  console.log('Firebase connected ✅');
}

// ── Helpers ───────────────────────────────────────────────────
function _ref(path) { return _db.ref(path); }

// ── Students ──────────────────────────────────────────────────

// Get all students (async) — callback(students[])
function getStudentsAsync(callback) {
  _ref('students').once('value', function(snap) {
    var data = snap.val();
    if (!data) { callback([]); return; }
    var arr = Object.keys(data).map(function(k) {
      return Object.assign({}, data[k], { _key: k });
    });
    callback(arr);
  }, function(err) {
    console.error('getStudents error:', err);
    callback([]);
  });
}

// Save ALL students (overwrite) — used by import
function saveStudentsAsync(arr, callback) {
  var obj = {};
  arr.forEach(function(s) {
    var key = s._key || s.id;
    obj[key] = { id: s.id, name: s.name, grade: s.grade, room: s.room || '', pw: s.pw || '' };
  });
  _ref('students').set(obj, function(err) {
    if (callback) callback(err);
  });
}

// Add single student
function addStudentAsync(student, callback) {
  _ref('students/' + student.id).set({
    id: student.id, name: student.name, grade: student.grade,
    room: student.room || '', pw: student.pw || ''
  }, function(err) {
    if (callback) callback(err);
  });
}

// Update single student (handles ID change)
function updateStudentAsync(origId, newData, callback) {
  if (origId === newData.id) {
    // Same ID — just update
    _ref('students/' + origId).set({
      id: newData.id, name: newData.name, grade: newData.grade,
      room: newData.room || '', pw: newData.pw || ''
    }, function(err) { if (callback) callback(err); });
  } else {
    // ID changed — delete old, create new
    _ref('students/' + origId).remove(function() {
      _ref('students/' + newData.id).set({
        id: newData.id, name: newData.name, grade: newData.grade,
        room: newData.room || '', pw: newData.pw || ''
      }, function(err) { if (callback) callback(err); });
    });
  }
}

// Delete single student
function deleteStudentAsync(id, callback) {
  _ref('students/' + id).remove(function(err) {
    if (callback) callback(err);
  });
}

// Delete multiple students
function deleteStudentsAsync(ids, callback) {
  var updates = {};
  ids.forEach(function(id) { updates['students/' + id] = null; });
  _db.ref().update(updates, function(err) {
    if (callback) callback(err);
  });
}

// Delete all students
function clearStudentsAsync(callback) {
  _ref('students').remove(function(err) {
    if (callback) callback(err);
  });
}

// ── Scores ────────────────────────────────────────────────────

// Get all scores (async) — callback(scores[])
function getScoresAsync(callback) {
  _ref('scores').once('value', function(snap) {
    var data = snap.val();
    if (!data) { callback([]); return; }
    var arr = Object.keys(data).map(function(k) { return data[k]; });
    callback(arr);
  }, function(err) {
    console.error('getScores error:', err);
    callback([]);
  });
}

// Push one score
function pushScoreAsync(score, callback) {
  _ref('scores').push(score, function(err) {
    if (callback) callback(err);
  });
}

// Delete scores by ts list
function deleteScoresAsync(tsList, callback) {
  // Must find keys first
  _ref('scores').once('value', function(snap) {
    var data = snap.val(); if (!data) { if (callback) callback(); return; }
    var updates = {};
    Object.keys(data).forEach(function(k) {
      if (tsList.indexOf(data[k].ts) >= 0) updates['scores/' + k] = null;
    });
    _db.ref().update(updates, function(err) { if (callback) callback(err); });
  });
}

// Delete all scores
function clearScoresAsync(callback) {
  _ref('scores').remove(function(err) {
    if (callback) callback(err);
  });
}

// ── Login helper — find student by ID ─────────────────────────
function findStudentAsync(id, callback) {
  _ref('students/' + id).once('value', function(snap) {
    callback(snap.exists() ? snap.val() : null);
  }, function() { callback(null); });
}
