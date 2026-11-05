/* Simulated SCORM 2004 learning system, for testing on this computer only.
   Keeps one learner's data in the browser's local storage so you can test
   save & exit and resume. Not used in the real course package. */
(function () {
  "use strict";
  var params = new URLSearchParams(location.search);
  var KEY = "mockLms:" + (params.get("learner") || "default");
  var store, state = "not-initialized", lastError = "0", calls = [];
  var READ_ONLY = /^cmi\.(_version|entry|learner_id|learner_name|mode|credit|total_time|launch_data|scaled_passing_score|completion_threshold|time_limit_action|max_time_allowed|interactions\._count|objectives\._count|.*\._children)$/;
  var WRITE_ONLY = /^cmi\.(exit|session_time)$/;
  var VOCAB = {
    "cmi.completion_status": ["completed", "incomplete", "not attempted", "unknown"],
    "cmi.success_status": ["passed", "failed", "unknown"],
    "cmi.exit": ["time-out", "suspend", "logout", "normal", ""]
  };
  function load() {
    try { store = JSON.parse(localStorage.getItem(KEY)); } catch (e) { store = null; }
    if (!store) store = { cmi: { "cmi.completion_status": "unknown", "cmi.success_status": "unknown", "cmi.interactions._count": "0", "cmi.objectives._count": "0", "cmi.suspend_data": "", "cmi.location": "" }, lastExit: "", attempts: 0 };
  }
  function persist() { localStorage.setItem(KEY, JSON.stringify(store)); }
  function err(code) { lastError = String(code); return "false"; }
  function log(c, a, r) { calls.push({ c: c, a: a, r: r, e: lastError }); if (window.onMockCall) window.onMockCall(c, a, r, lastError); }

  var API = {
    Initialize: function () {
      if (state === "running") { log("Initialize", [], err(103)); return "false"; }
      if (state === "terminated") { log("Initialize", [], err(104)); return "false"; }
      load();
      var resume = store.lastExit === "suspend";
      if (!resume) { // a new attempt starts clean, keeping only completion (as many systems do)
        var keep = store.cmi["cmi.completion_status"] === "completed" ? "completed" : "unknown";
        store.cmi = { "cmi.completion_status": keep, "cmi.success_status": "unknown", "cmi.interactions._count": "0", "cmi.objectives._count": "0", "cmi.suspend_data": "", "cmi.location": "" };
      }
      store.cmi["cmi.entry"] = resume ? "resume" : "ab-initio";
      store.cmi["cmi.learner_name"] = "Learner, Sample";
      store.cmi["cmi.learner_id"] = "sample-learner";
      store.cmi["cmi.mode"] = "normal"; store.cmi["cmi.credit"] = "credit";
      if (params.get("passing")) store.cmi["cmi.scaled_passing_score"] = params.get("passing"); else delete store.cmi["cmi.scaled_passing_score"];
      store.cmi["cmi.exit"] = ""; store.attempts++;
      state = "running"; lastError = "0"; log("Initialize", [], "true"); return "true";
    },
    GetValue: function (n) {
      if (state !== "running") { log("GetValue", [n], err(state === "terminated" ? 123 : 122)); return ""; }
      if (WRITE_ONLY.test(n)) { log("GetValue", [n], err(405)); return ""; }
      lastError = "0";
      if (n === "cmi.scaled_passing_score" && store.cmi[n] === undefined) { log("GetValue", [n], err(403)); return ""; }
      var v = store.cmi[n]; if (v === undefined) { v = ""; if (!/_count$/.test(n)) lastError = "403"; }
      log("GetValue", [n], v); return v;
    },
    SetValue: function (n, v) {
      v = String(v);
      if (state !== "running") { log("SetValue", [n, v], err(state === "terminated" ? 133 : 132)); return "false"; }
      if (READ_ONLY.test(n)) { log("SetValue", [n, v], err(404)); return "false"; }
      if (VOCAB[n] && VOCAB[n].indexOf(v) < 0) { log("SetValue", [n, v], err(406)); return "false"; }
      if (n === "cmi.score.scaled" && (isNaN(+v) || +v < -1 || +v > 1)) { log("SetValue", [n, v], err(407)); return "false"; }
      if (n === "cmi.suspend_data" && v.length > 64000) { log("SetValue", [n, v], err(407)); return "false"; }
      var m = n.match(/^cmi\.(interactions|objectives)\.(\d+)\.(.+)$/);
      if (m) {
        var coll = m[1], i = +m[2], field = m[3], count = +store.cmi["cmi." + coll + "._count"];
        if (i > count) { log("SetValue", [n, v], err(351)); return "false"; }
        if (i === count) {
          if (field !== "id") { log("SetValue", [n, v], err(408)); return "false"; } // id must come first
          store.cmi["cmi." + coll + "._count"] = String(count + 1);
        }
        if (coll === "interactions" && /^(learner_response|correct_responses\.\d+\.pattern)$/.test(field) && !store.cmi["cmi.interactions." + i + ".type"]) { log("SetValue", [n, v], err(408)); return "false"; }
        if (coll === "interactions" && field === "result" && ["correct", "incorrect", "unanticipated", "neutral"].indexOf(v) < 0 && isNaN(+v)) { log("SetValue", [n, v], err(406)); return "false"; }
      }
      store.cmi[n] = v; lastError = "0"; log("SetValue", [n, v], "true"); return "true";
    },
    Commit: function () { if (state !== "running") { log("Commit", [], err(state === "terminated" ? 143 : 142)); return "false"; } persist(); lastError = "0"; log("Commit", [], "true"); return "true"; },
    Terminate: function () {
      if (state !== "running") { log("Terminate", [], err(state === "terminated" ? 113 : 112)); return "false"; }
      store.lastExit = store.cmi["cmi.exit"] || ""; persist(); state = "terminated"; lastError = "0"; log("Terminate", [], "true"); return "true";
    },
    GetLastError: function () { return lastError; },
    GetErrorString: function (c) { return "Error " + c; },
    GetDiagnostic: function (c) { return "Error " + c; }
  };
  window.API_1484_11 = API;
  window.MockLms = {
    data: function () { load(); return store; },
    calls: function () { return calls.slice(); },
    reset: function () { localStorage.removeItem(KEY); },
    relaunch: function () { state = "not-initialized"; }
  };
})();
