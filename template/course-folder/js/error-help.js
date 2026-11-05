/* Loads first. If an editing mistake stops a course file from loading, this
   remembers which file and line, so the course can show a plain message
   instead of a blank screen. Technical file: no need to edit. */
(function () {
  "use strict";
  window.COURSE_LOAD_ERRORS = [];
  window.addEventListener("error", function (e) {
    if (!e || !e.filename) return;
    var file = String(e.filename).split("?")[0].split("/").slice(-2).join("/");
    window.COURSE_LOAD_ERRORS.push({ file: file, line: e.lineno || 0 });
  });
})();
