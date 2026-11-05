(function () {
  var frame = document.getElementById("course");
  var COURSE = "../../template/course-folder/index.html";
  function draw() {
    var t = document.getElementById("data"), cmi = MockLms.data().cmi;
    t.textContent = "";
    Object.keys(cmi).sort().forEach(function (k) {
      var tr = document.createElement("tr");
      [k, cmi[k]].forEach(function (x) { var td = document.createElement("td"); td.textContent = x; tr.appendChild(td); });
      t.appendChild(tr);
    });
  }
  window.onMockCall = function (c) { if (c === "Commit" || c === "Terminate") draw(); };
  function launch() { MockLms.relaunch(); frame.src = COURSE + "?t=" + Date.now(); }
  document.getElementById("relaunch").addEventListener("click", launch);
  document.getElementById("reset").addEventListener("click", function () { MockLms.reset(); launch(); draw(); });
  launch(); draw();
})();
