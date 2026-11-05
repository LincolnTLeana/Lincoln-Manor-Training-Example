/* =====================================================================
   SCORM 2004 (4th Edition) connection to the learning system (ADP Learning).
   Technical file: course editors don't need to change anything here.

   This is the ONLY place the course sends data, and it sends it only to the
   learning system that launched it (through the SCORM API object the player
   provides). The course makes no other connections.
   ===================================================================== */
(function () {
  "use strict";

  var api = null;
  var active = false;
  var terminated = false;
  var log = [];

  function record(call, args, result) {
    log.push({ call: call, args: args, result: result, error: api ? String(api.GetLastError()) : "0" });
    if (log.length > 500) log.shift();
  }

  // Look for the SCORM 2004 API in parent windows, then in the opener's windows.
  function findApi(win) {
    var hops = 0;
    while (win && hops < 20) {
      try { if (win.API_1484_11) return win.API_1484_11; } catch (e) { return null; }
      if (win.parent === win) break;
      win = win.parent; hops++;
    }
    return null;
  }

  function locate() {
    var found = findApi(window);
    if (!found && window.opener) found = findApi(window.opener);
    return found;
  }

  var Scorm = {
    /** True when a learning system is connected; false in preview mode. */
    connected: function () { return active; },

    init: function () {
      api = locate();
      if (!api) { active = false; return false; }
      var ok = String(api.Initialize("")) === "true";
      record("Initialize", [], ok);
      active = ok;
      return ok;
    },

    get: function (name) {
      if (!active) return "";
      var v = String(api.GetValue(name));
      record("GetValue", [name], v);
      return v;
    },

    set: function (name, value) {
      if (!active) return false;
      var ok = String(api.SetValue(name, String(value))) === "true";
      record("SetValue", [name, String(value)], ok);
      return ok;
    },

    commit: function () {
      if (!active) return false;
      var ok = String(api.Commit("")) === "true";
      record("Commit", [], ok);
      return ok;
    },

    terminate: function () {
      if (!active || terminated) return false;
      var ok = String(api.Terminate("")) === "true";
      record("Terminate", [], ok);
      terminated = true;
      active = false;
      return ok;
    },

    isTerminated: function () { return terminated; },

    /** Recent calls, for troubleshooting in preview or test tools. */
    history: function () { return log.slice(); },

    /** SCORM time interval, e.g. 125.4 seconds -> "PT2M5.4S". */
    duration: function (seconds) {
      seconds = Math.max(0, seconds);
      var h = Math.floor(seconds / 3600);
      var m = Math.floor((seconds % 3600) / 60);
      var s = Math.round((seconds % 60) * 100) / 100;
      return "PT" + (h ? h + "H" : "") + (m ? m + "M" : "") + s + "S";
    },

    /** SCORM timestamp: YYYY-MM-DDThh:mm:ss (local time, no zone). */
    timestamp: function (d) {
      d = d || new Date();
      function p(n) { return (n < 10 ? "0" : "") + n; }
      return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
        "T" + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    }
  };

  window.Scorm = Scorm;
})();
