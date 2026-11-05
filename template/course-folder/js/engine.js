/* =====================================================================
   GAME ENGINE  (technical file: course editors don't need to change it)
   Reads course/settings.js, course/content.js and the theme's theme.js,
   builds every screen, and reports progress through js/scorm-api.js.
   ===================================================================== */
(function () {
  "use strict";

  var SETTINGS = window.COURSE_SETTINGS || {};
  var CONTENT = window.COURSE_CONTENT || {};
  var THEME = {};
  var THEME_BASE = "";
  var THEME_FAILED = false;
  var Scorm = window.Scorm;

  var DEFAULT_LABELS = {
    start: "Start", resume: "Continue", next: "Next", back: "Back", hub: "Main hall",
    toHub: "Back to the main hall", check: "Check answer", saveExit: "Save & exit",
    retry: "Start over", review: "Review rooms", help: "Help", credits: "Credits",
    finish: "See results", musicOn: "Music: on", musicOff: "Music: off",
    roomDone: "Room complete", showModel: "Show model answer", submitSurvey: "Send answer", skip: "Skip",
    close: "Close", confirmRetry: "Yes, start over", cancel: "Cancel"
  };

  var state = null;          // saved progress (suspend_data)
  var passing = null;        // passing score as 0..1, or null
  var objectiveIndex = {};   // room id -> cmi.objectives index
  var startedAt = Date.now();
  var questionShownAt = 0;
  var music = null;
  var resumeScreen = { type: "hub" };   // where "Continue" takes the learner
  var root, main;

  /* ------------------------------ helpers ------------------------------ */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "onclick") n.addEventListener("click", v);
      else if (k === "className") n.className = v;
      else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function label(key) { return (THEME.labels && THEME.labels[key]) || DEFAULT_LABELS[key]; }
  function rooms() { return CONTENT.rooms || []; }
  function bonusRooms() { return CONTENT.bonusRooms || []; }
  function allRooms() { return rooms().concat(bonusRooms()); }
  function findRoom(id) { return allRooms().filter(function (r) { return r.id === id; })[0]; }
  function isBonus(id) { return bonusRooms().some(function (r) { return r.id === id; }); }
  function roomName(r) {
    var t = THEME.rooms && THEME.rooms[r.id];
    return (t && t.name) || r.title || r.id;
  }
  function themeFile(f) { return f ? THEME_BASE + f : null; }
  function coreQuestions() {
    var list = [];
    rooms().forEach(function (r) { (r.questions || []).forEach(function (q) { if (!q.survey) list.push({ q: q, room: r }); }); });
    return list;
  }
  function isPlaceholder(s) { return typeof s === "string" && /^\[[^\]]+\]$/.test(s.trim()); }
  function words(s) { return (s || "").split(/\s+/).filter(Boolean).length; }

  /* ------------------------------ state ------------------------------ */
  function freshState(attempt) {
    return { v: 1, attempt: attempt || 1, rooms: {}, answers: {}, survey: {}, eggs: {},
             best: null, passedEver: false, completed: false, scoreSent: false,
             screen: { type: "start" } };
  }
  function roomState(id) {
    if (!state.rooms[id]) state.rooms[id] = { step: 0, done: false };
    return state.rooms[id];
  }
  function save(commit) {
    if (!Scorm.connected()) return;
    Scorm.set("cmi.suspend_data", JSON.stringify(state));
    var s = state.screen;
    Scorm.set("cmi.location", s.type === "room" ? s.room + ":" + s.step : s.type);
    if (commit) Scorm.commit();
  }

  /* ------------------------------ SCORM reporting ------------------------------ */
  function setupObjectives() {
    if (!Scorm.connected() || !SETTINGS.tracking || !SETTINGS.tracking.recordRoomsAsObjectives) return;
    var count = parseInt(Scorm.get("cmi.objectives._count"), 10) || 0;
    for (var i = 0; i < count; i++) objectiveIndex[Scorm.get("cmi.objectives." + i + ".id")] = i;
    rooms().forEach(function (r) {
      if (objectiveIndex[r.id] === undefined) {
        objectiveIndex[r.id] = count;
        Scorm.set("cmi.objectives." + count + ".id", r.id);
        count++;
      }
    });
  }

  function recordInteraction(item, room, choiceId, kind) {
    if (!Scorm.connected() || !SETTINGS.tracking || !SETTINGS.tracking.recordAnswers) return;
    if (kind === "bonus" && !SETTINGS.tracking.recordBonusAnswers) return;
    var n = parseInt(Scorm.get("cmi.interactions._count"), 10) || 0;
    var p = "cmi.interactions." + n + ".";
    Scorm.set(p + "id", item.id);
    Scorm.set(p + "type", "choice");
    if (room && objectiveIndex[room.id] !== undefined) Scorm.set(p + "objectives.0.id", room.id);
    Scorm.set(p + "timestamp", Scorm.timestamp());
    if (kind !== "survey") Scorm.set(p + "correct_responses.0.pattern", item.correct);
    Scorm.set(p + "weighting", kind === "core" ? "1" : "0");
    Scorm.set(p + "learner_response", choiceId);
    Scorm.set(p + "result", kind === "survey" ? "neutral" : (choiceId === item.correct ? "correct" : "incorrect"));
    if (questionShownAt) Scorm.set(p + "latency", Scorm.duration((Date.now() - questionShownAt) / 1000));
    Scorm.set(p + "description", String(item.prompt).slice(0, 250));
  }

  function scoreNow() {
    var all = coreQuestions();
    var answered = all.filter(function (x) { return state.answers[x.q.id] !== undefined; });
    var correct = all.filter(function (x) { return state.answers[x.q.id] === x.q.correct; });
    return { total: all.length, answered: answered.length, correct: correct.length };
  }

  function maybeReportScore() {
    var s = scoreNow();
    if (s.total === 0 || s.answered < s.total || state.scoreSent) return;
    var scaled = Math.floor((s.correct / s.total) * 1000) / 1000;   // 11/12 -> 0.916
    var report = { raw: s.correct, scaled: scaled };
    var keepBest = !SETTINGS.scoring || SETTINGS.scoring.keepScore !== "latest";
    if (keepBest && state.best && state.best.scaled > scaled) report = state.best;
    if (!state.best || scaled > state.best.scaled) state.best = { raw: s.correct, scaled: scaled };
    state.scoreSent = true;
    if (Scorm.connected()) {
      Scorm.set("cmi.score.min", "0");
      Scorm.set("cmi.score.max", String(s.total));
      Scorm.set("cmi.score.raw", String(report.raw));
      Scorm.set("cmi.score.scaled", String(report.scaled));
    }
    if (passing !== null) {
      var passed = report.scaled >= passing;
      if (passed) state.passedEver = true;
      // Never change a pass back to a fail.
      if (Scorm.connected()) Scorm.set("cmi.success_status", (passed || state.passedEver) ? "passed" : "failed");
    }
    save(true);
  }

  function updateProgress() {
    var req = rooms(), done = req.filter(function (r) { return roomState(r.id).done; }).length;
    if (Scorm.connected() && req.length) Scorm.set("cmi.progress_measure", String(Math.floor((done / req.length) * 100) / 100));
    if (done === req.length && req.length && !state.completed) {
      state.completed = true;
      if (Scorm.connected()) Scorm.set("cmi.completion_status", "completed");
    }
  }

  function finishRoom(room) {
    var rs = roomState(room.id);
    if (rs.done) return;
    rs.done = true;
    if (!isBonus(room.id)) {
      if (Scorm.connected() && objectiveIndex[room.id] !== undefined) {
        Scorm.set("cmi.objectives." + objectiveIndex[room.id] + ".completion_status", "completed");
      }
      updateProgress();
    }
    save(true);
  }

  function exitCourse(navigate) {
    if (Scorm.connected() && !Scorm.isTerminated()) {
      save(false);
      Scorm.set("cmi.exit", "suspend");          // keeps progress for next time
      Scorm.set("cmi.session_time", Scorm.duration((Date.now() - startedAt) / 1000));
      Scorm.commit();
      Scorm.terminate();                         // no adl.nav.request is sent
    }
    if (navigate) window.location.replace("exit.html");
  }

  /* ------------------------------ unlock rules ------------------------------ */
  function perfect() { var s = scoreNow(); return s.total > 0 && s.correct === s.total; }
  function unlocked(b) {
    var u = b.unlock || "always";
    if (u === "always") return true;
    if (u === "perfectScore") return perfect() || !!(state.best && state.best.scaled === 1);
    if (u === "allRoomsComplete") return state.completed;
    if (u.indexOf("egg:") === 0) return !!state.eggs[u.slice(4)];
    return false;
  }

  /* ------------------------------ screens ------------------------------ */
  function show(screen) {
    state.screen = screen;
    save(false);
    main.textContent = "";
    root.setAttribute("data-screen", screen.type);
    var bg = screen.type === "room" ? ((THEME.rooms && THEME.rooms[screen.room] && THEME.rooms[screen.room].background) || (THEME.images && THEME.images.roomBackground))
      : screen.type === "start" ? THEME.images && THEME.images.titleBackground : THEME.images && THEME.images.hubBackground;
    // Full address so the picture resolves from the page, not from the stylesheet.
    document.documentElement.style.setProperty("--screen-bg", bg ? 'url("' + new URL(themeFile(bg), document.baseURI).href + '")' : "none");
    ({ start: renderStart, hub: renderHub, room: renderRoom, finish: renderFinish, survey: renderStartSurvey })[screen.type](screen);
    var h = main.querySelector("h1");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
    window.scrollTo(0, 0);
  }

  function toolbar(extra) {
    var bar = el("div", { className: "toolbar" }, extra || []);
    if (SETTINGS.features && SETTINGS.features.showHelp !== false) bar.appendChild(el("button", { type: "button", className: "btn ghost", text: label("help"), onclick: openHelp }));
    if (SETTINGS.features && SETTINGS.features.showCredits !== false) bar.appendChild(el("button", { type: "button", className: "btn ghost", text: label("credits"), onclick: openCredits }));
    if (music) bar.appendChild(musicButton());
    bar.appendChild(el("button", { type: "button", className: "btn ghost", text: label("saveExit"), onclick: function () { exitCourse(true); } }));
    return bar;
  }

  function renderStart() {
    var greet = "";
    if (SETTINGS.features && SETTINGS.features.greetByName && Scorm.connected()) {
      var n = Scorm.get("cmi.learner_name");               // "Last, First" in most systems
      var first = n.indexOf(",") > -1 ? n.split(",")[1].trim() : n.split(" ")[0];
      if (first) greet = "Hi " + first + ". ";
    }
    var hasProgress = Object.keys(state.rooms).length > 0;
    main.appendChild(el("div", { className: "panel start" }, [
      THEME.images && THEME.images.logo ? el("img", { src: themeFile(THEME.images.logo), alt: THEME.images.logoAlt || "", className: "logo" }) : null,
      el("p", { className: "theme-name", text: THEME.name || "" }),
      el("h1", { text: SETTINGS.courseTitle || "Course" }),
      el("p", { className: "lead", text: greet + ((CONTENT.intro && CONTENT.intro.text) || "") }),
      THEME.tagline ? el("p", { className: "tagline", text: THEME.tagline }) : null,
      el("button", { type: "button", className: "btn primary big", text: hasProgress ? label("resume") : label("start"),
        onclick: function () {
          startMusic();
          var ss = CONTENT.startSurvey;
          if (ss && ss.show && ss.questions && ss.questions.length && !state.startSurveyDone) show({ type: "survey" });
          else show(hasProgress ? resumeScreen : { type: "hub" });
        } }),
      CONTENT.intro && CONTENT.intro.tip ? el("p", { className: "small", text: CONTENT.intro.tip }) : null,
      el("p", { className: "version", text: "Version " + (SETTINGS.version || "") })
    ]));
    main.appendChild(toolbar());
  }

  function eggButtons(location) {
    return (CONTENT.easterEggs || []).filter(function (e) { return e.location === location; }).map(function (e) {
      var found = !!state.eggs[e.id];
      return el("button", { type: "button", className: "egg" + (found ? " found" : ""), "aria-label": e.label + (found ? " (found)" : ""),
        onclick: function () {
          state.eggs[e.id] = true; save(true);
          openDialog(e.label, [el("p", { text: e.message })], function () { show(state.screen); });
        } }, [THEME.images && THEME.images.egg ? el("img", { src: themeFile(THEME.images.egg), alt: "" }) : el("span", { text: "?", "aria-hidden": "true" })]);
    });
  }

  function roomCard(r, bonus) {
    var rs = state.rooms[r.id], t = (THEME.rooms && THEME.rooms[r.id]) || {};
    var status = rs && rs.done ? "Complete" : rs ? "In progress" : "Not started";
    return el("li", { className: "room-card" + (rs && rs.done ? " done" : "") + (bonus ? " bonus" : "") }, [
      el("button", { type: "button", className: "room-btn", onclick: function () { show({ type: "room", room: r.id, step: rs && !rs.done ? rs.step : 0 }); } }, [
        t.icon ? el("img", { src: themeFile(t.icon), alt: "", className: "room-icon" }) : null,
        el("span", { className: "room-name", text: roomName(r) }),
        el("span", { className: "room-status", text: (bonus ? "Bonus · " : "") + status })
      ])
    ]);
  }

  function renderHub() {
    var req = rooms(), done = req.filter(function (r) { return state.rooms[r.id] && state.rooms[r.id].done; }).length;
    var list = el("ul", { className: "room-grid" }, req.map(function (r) { return roomCard(r, false); }));
    bonusRooms().filter(unlocked).forEach(function (b) { list.appendChild(roomCard(b, true)); });
    var pct = req.length ? Math.round((done / req.length) * 100) : 0;
    var bar = el("div", { className: "progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(req.length), "aria-valuenow": String(done), "aria-label": "Rooms complete" }, [el("span", { className: "progress-fill" })]);
    bar.firstChild.style.setProperty("width", pct + "%");
    main.appendChild(el("div", { className: "panel hub" }, [
      el("h1", { text: label("hub") }),
      el("p", { className: "lead", text: done + " of " + req.length + " rooms complete" }),
      bar,
      list,
      el("div", { className: "eggs" }, eggButtons("hub")),
      el("div", { className: "actions" }, [
        state.completed ? el("button", { type: "button", className: "btn primary", text: label("finish"), onclick: function () { show({ type: "finish" }); } }) : null,
        Object.keys(state.answers).length ? el("button", { type: "button", className: "btn", text: label("retry"), onclick: confirmRetry }) : null
      ])
    ]));
    main.appendChild(toolbar());
  }

  function steps(room) {
    var list = [];
    (room.lessons || []).forEach(function (l, i) { list.push({ kind: "lesson", item: l, i: i }); });
    (room.questions || []).forEach(function (q, i) { list.push({ kind: "question", item: q, i: i }); });
    if (room.practice) list.push({ kind: "practice", item: room.practice });
    list.push({ kind: "done" });
    return list;
  }

  function renderRoom(screen) {
    var room = findRoom(screen.room);
    if (!room) { show({ type: "hub" }); return; }
    var all = steps(room), step = Math.min(screen.step || 0, all.length - 1), cur = all[step];
    var rs = roomState(room.id);
    if (!rs.done) rs.step = step;
    var body = el("div", { className: "panel room" }, [el("p", { className: "room-label", text: roomName(room) + " · " + (step + 1) + " of " + all.length })]);
    var nextBtn = el("button", { type: "button", className: "btn primary", text: label("next"), onclick: function () { show({ type: "room", room: room.id, step: step + 1 }); } });
    var backBtn = el("button", { type: "button", className: "btn", text: label("back"), onclick: function () { show(step === 0 ? { type: "hub" } : { type: "room", room: room.id, step: step - 1 }); } });

    if (cur.kind === "lesson") renderLesson(body, cur.item);
    else if (cur.kind === "question") renderQuestion(body, cur.item, room, nextBtn);
    else if (cur.kind === "practice") renderPractice(body, cur.item);
    else {
      finishRoom(room);
      body.appendChild(el("h1", { text: label("roomDone") }));
      body.appendChild(el("p", { className: "lead", text: "You finished " + roomName(room) + "." }));
      nextBtn = el("button", { type: "button", className: "btn primary", text: state.completed && !isBonus(room.id) && !state.seenFinish ? label("finish") : label("toHub"),
        onclick: function () {
          if (state.completed && !isBonus(room.id) && !state.seenFinish) { state.seenFinish = true; show({ type: "finish" }); }
          else show({ type: "hub" });
        } });
    }
    body.appendChild(el("div", { className: "eggs" }, eggButtons(room.id)));
    body.appendChild(el("nav", { className: "nav", "aria-label": "Room navigation" }, [backBtn, nextBtn]));
    main.appendChild(body);
    main.appendChild(toolbar());
  }

  function mediaBlock(l) {
    var out = [];
    if (l.image && l.image.file) out.push(el("img", { className: "lesson-img", src: l.image.file, alt: l.image.alt || "" }));
    if (l.video && l.video.file) {
      var v = el("video", { controls: true, preload: "metadata", className: "lesson-video" }, [
        l.video.captions ? el("track", { kind: "captions", src: l.video.captions, srclang: "en", label: "English", default: true }) : null]);
      v.src = l.video.file; out.push(v);
    }
    if (l.audio && l.audio.file) { var a = el("audio", { controls: true, preload: "metadata" }); a.src = l.audio.file; out.push(a); }
    var tr = (l.video && l.video.transcript) || (l.audio && l.audio.transcript);
    if (tr) out.push(el("details", { className: "transcript" }, [el("summary", { text: "Transcript" }), el("p", { text: tr })]));
    if (l.link) out.push(linkEl(l.link));
    if (l.file) out.push(linkEl({ text: l.file.text, file: l.file.file }));
    return out;
  }

  function linkEl(link) {
    var target = link.url || link.file;
    if (!target || isPlaceholder(target)) {
      return el("p", { className: "link placeholder", text: link.text + (Scorm.connected() ? "" : " (link not set yet)") });
    }
    return el("p", { className: "link" }, [el("a", { href: target, target: "_blank", rel: "noopener noreferrer" }, [link.text, el("span", { className: "sr-only", text: " (opens in a new window)" })])]);
  }

  function renderLesson(body, l) {
    body.appendChild(el("h1", { text: l.heading }));
    if (l.summary) body.appendChild(el("p", { className: "lead", text: l.summary }));
    if (l.bullets && l.bullets.length) body.appendChild(el("ul", { className: "bullets" }, l.bullets.map(function (b) { return el("li", { text: b }); })));
    mediaBlock(l).forEach(function (n) { body.appendChild(n); });
  }

  function renderQuestion(body, q, room, nextBtn) {
    var bonus = isBonus(room.id);
    if (q.survey) { renderSurveyQuestion(body, q, room, nextBtn); return; }
    var answered = state.answers[q.id];
    if (bonus && state.rooms[room.id] && state.rooms[room.id].bonusAnswers) answered = state.rooms[room.id].bonusAnswers[q.id];
    var form = el("form", { className: "question" });
    var fs = el("fieldset", null, [el("legend", null, [el("h1", { text: q.prompt })])]);
    q.choices.forEach(function (c) {
      var id = "c_" + q.id + "_" + c.id;
      var input = el("input", { type: "radio", name: "choice", id: id, value: c.id, checked: answered === c.id, disabled: answered !== undefined });
      var cls = "choice";
      if (answered !== undefined && c.id === q.correct) cls += " is-correct";
      if (answered === c.id && c.id !== q.correct) cls += " is-wrong";
      fs.appendChild(el("div", { className: cls }, [input, el("label", { "for": id, text: c.text })]));
    });
    form.appendChild(fs);
    var fb = el("div", { className: "feedback", role: "status", "aria-live": "polite" });
    function showFeedback(choice) {
      var ok = choice === q.correct;
      fb.className = "feedback " + (ok ? "good" : "bad");
      fb.textContent = (ok ? "✓ " : "✗ ") + (ok ? q.feedbackCorrect : q.feedbackIncorrect);
    }
    var check = el("button", { type: "submit", className: "btn primary", text: label("check"), disabled: answered !== undefined });
    form.appendChild(check);
    form.appendChild(fb);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var picked = form.querySelector("input[name=choice]:checked");
      if (!picked) { fb.className = "feedback"; fb.textContent = "Choose an answer first."; return; }
      var choice = picked.value;
      if (bonus) { var rs = roomState(room.id); rs.bonusAnswers = rs.bonusAnswers || {}; rs.bonusAnswers[q.id] = choice; }
      else state.answers[q.id] = choice;
      recordInteraction(q, room, choice, bonus ? "bonus" : "core");
      Array.prototype.forEach.call(form.querySelectorAll("input"), function (i) { i.disabled = true; });
      check.disabled = true;
      Array.prototype.forEach.call(form.querySelectorAll(".choice"), function (d) {
        var v = d.querySelector("input").value;
        if (v === q.correct) d.classList.add("is-correct");
        if (v === choice && v !== q.correct) d.classList.add("is-wrong");
      });
      showFeedback(choice);
      nextBtn.disabled = false;
      if (!bonus) maybeReportScore();
      save(true);
      nextBtn.focus();
    });
    if (answered !== undefined) showFeedback(answered);
    else { nextBtn.disabled = true; questionShownAt = Date.now(); }
    body.appendChild(form);
  }

  function renderSurveyQuestion(body, q, room, nextBtn) {
    var answered = state.survey[q.id];
    var form = el("form", { className: "question" });
    var fs = el("fieldset", null, [el("legend", null, [el("h1", { text: q.prompt })])]);
    fs.appendChild(el("p", { className: "small", text: "Survey question: there's no right or wrong answer, and it doesn't affect your score." }));
    q.choices.forEach(function (c) {
      var id = "c_" + q.id + "_" + c.id;
      fs.appendChild(el("div", { className: "choice" }, [el("input", { type: "radio", name: "choice", id: id, value: c.id, checked: answered === c.id, disabled: answered !== undefined }), el("label", { "for": id, text: c.text })]));
    });
    form.appendChild(fs);
    var fb = el("div", { className: "feedback", role: "status", "aria-live": "polite" });
    var send = el("button", { type: "submit", className: "btn primary", text: label("submitSurvey"), disabled: answered !== undefined });
    form.appendChild(send); form.appendChild(fb);
    if (answered !== undefined) fb.textContent = q.thanks || "Thanks for your answer.";
    else questionShownAt = Date.now();
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var picked = form.querySelector("input[name=choice]:checked");
      if (!picked) { fb.textContent = "Choose an answer, or select Next to skip."; return; }
      state.survey[q.id] = picked.value;
      recordInteraction(q, room, picked.value, "survey");
      Array.prototype.forEach.call(form.querySelectorAll("input"), function (i) { i.disabled = true; });
      send.disabled = true;
      fb.textContent = q.thanks || "Thanks for your answer.";
      save(true);
      nextBtn.focus();
    });
    body.appendChild(form);
  }

  function renderPractice(body, p) {
    body.appendChild(el("h1", { text: "Practice" }));
    body.appendChild(el("p", { className: "lead", text: p.prompt }));
    var id = "practice_box";
    body.appendChild(el("label", { "for": id, className: "small", text: "Your answer (stays on this screen; it isn't saved or sent):" }));
    body.appendChild(el("textarea", { id: id, rows: "4", className: "practice-box" }));
    var model = el("div", { className: "model", hidden: true }, [el("h2", { text: "Model answer" }), el("p", { text: p.modelAnswer })]);
    body.appendChild(el("button", { type: "button", className: "btn", text: label("showModel"), onclick: function () { model.hidden = false; model.querySelector("h2").setAttribute("tabindex", "-1"); model.querySelector("h2").focus(); } }));
    body.appendChild(model);
  }

  function renderStartSurvey() {
    var ss = CONTENT.startSurvey;
    var panel = el("div", { className: "panel" }, [el("h1", { text: ss.heading || "Before you start" })]);
    if (ss.text) panel.appendChild(el("p", { className: "lead", text: ss.text }));
    function done() { state.startSurveyDone = true; save(true); show({ type: "hub" }); }
    panel.appendChild(surveyForm(ss, done, true));
    panel.appendChild(el("div", { className: "actions" }, [el("button", { type: "button", className: "btn", text: label("skip"), onclick: done })]));
    main.appendChild(panel);
    main.appendChild(toolbar());
  }

  function renderFinish() {
    var f = CONTENT.finish || {}, s = scoreNow();
    var panel = el("div", { className: "panel finish" }, [
      THEME.images && THEME.images.badge ? el("img", { className: "badge", src: themeFile(THEME.images.badge), alt: THEME.images.badgeAlt || "Completion badge" }) : null,
      el("h1", { text: f.heading || "Finished" }),
      el("p", { className: "lead", text: f.completeText || "" })
    ]);
    if (s.answered === s.total) {
      var shown = state.best && (!SETTINGS.scoring || SETTINGS.scoring.keepScore !== "latest") ? state.best.raw : s.correct;
      panel.appendChild(el("p", { className: "score", text: "Score: " + shown + " of " + s.total + (passing !== null ? " (passing: " + Math.round(passing * 100) + "%)" : "") }));
      if (passing !== null) panel.appendChild(el("p", { text: state.passedEver ? (f.passText || "") : (f.failText || "") }));
      if (perfect() && bonusRooms().some(function (b) { return b.unlock === "perfectScore"; })) panel.appendChild(el("p", { className: "perfect", text: f.perfectText || "" }));
    }
    var sv = CONTENT.survey;
    if (sv && sv.show && sv.questions && sv.questions.length && !state.surveyDone) panel.appendChild(surveyForm(sv, function () { state.surveyDone = true; save(true); }));
    panel.appendChild(el("div", { className: "actions" }, [
      el("button", { type: "button", className: "btn primary", text: label("review"), onclick: function () { show({ type: "hub" }); } }),
      el("button", { type: "button", className: "btn", text: label("retry"), onclick: confirmRetry })
    ]));
    main.appendChild(panel);
    main.appendChild(toolbar());
  }

  function surveyForm(sv, onDone, noHeading) {
    var form = el("form", { className: "survey" }, [noHeading ? null : el("h2", { text: sv.heading || "Survey" })]);
    sv.questions.forEach(function (q) {
      var fs = el("fieldset", null, [el("legend", { text: q.prompt })]);
      q.choices.forEach(function (c) {
        var id = "s_" + q.id + "_" + c.id;
        fs.appendChild(el("div", { className: "choice" }, [el("input", { type: "radio", name: q.id, id: id, value: c.id }), el("label", { "for": id, text: c.text })]));
      });
      form.appendChild(fs);
    });
    form.appendChild(el("button", { type: "submit", className: "btn", text: label("submitSurvey") }));
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      sv.questions.forEach(function (q) {
        var p = form.querySelector('input[name="' + q.id + '"]:checked');
        if (p) { state.survey[q.id] = p.value; questionShownAt = 0; recordInteraction(q, null, p.value, "survey"); }
      });
      form.replaceWith(el("p", { className: "small", role: "status", text: "Thank you. Your answers were sent." }));
      onDone();
    });
    return form;
  }

  /* ------------------------------ dialogs ------------------------------ */
  function openDialog(title, kids, onClose, extraButtons) {
    var d = el("dialog", { className: "dialog", "aria-labelledby": "dlg_title" }, [el("h2", { id: "dlg_title", text: title })].concat(kids));
    var row = el("div", { className: "actions" }, (extraButtons || []).concat([el("button", { type: "button", className: "btn", text: label(extraButtons ? "cancel" : "close"), onclick: function () { d.close(); } })]));
    d.appendChild(row);
    d.addEventListener("close", function () { d.remove(); if (onClose) onClose(); });
    document.body.appendChild(d);
    d.showModal();
    return d;
  }

  function openHelp() {
    var h = CONTENT.help || {};
    var kids = (h.contacts || []).map(function (c) { return el("p", null, [el("strong", { text: c.label + ": " }), c.detail]); });
    (h.resources || []).forEach(function (r) { kids.push(linkEl(r)); });
    openDialog(h.heading || label("help"), kids);
  }

  function openCredits() {
    var c = CONTENT.credits || {};
    var kids = (c.lines || []).map(function (t) { return el("p", { text: t }); });
    kids.push(el("p", { className: "small", text: (SETTINGS.courseTitle || "") + " · Version " + (SETTINGS.version || "") + " · Theme: " + (THEME.name || "") }));
    if (THEME.credits) THEME.credits.forEach(function (t) { kids.push(el("p", { className: "small", text: t })); });
    openDialog(c.heading || label("credits"), kids);
  }

  function confirmRetry() {
    var d;
    var yes = el("button", { type: "button", className: "btn primary", text: label("confirmRetry"), onclick: function () {
      var keep = { best: state.best, passedEver: state.passedEver, completed: state.completed, survey: state.survey, surveyDone: state.surveyDone, startSurveyDone: state.startSurveyDone, seenFinish: state.seenFinish };
      state = freshState(state.attempt + 1);
      Object.keys(keep).forEach(function (k) { state[k] = keep[k]; });   // completion and best score are kept
      save(true);
      d.close();
      show({ type: "hub" });
    } });
    d = openDialog(label("retry"), [el("p", { text: "This clears your answers and room progress so you can play again. Your completion and best score are kept." })], null, [yes]);
  }

  /* ------------------------------ music ------------------------------ */
  function setupMusic() {
    if (!THEME.music || !THEME.music.file) return;
    music = new Audio(themeFile(THEME.music.file));
    music.loop = true;
    music.volume = typeof THEME.music.volume === "number" ? THEME.music.volume : 0.3;
    music.muted = THEME.music.startMuted !== false;
  }
  function startMusic() { if (music && !music.muted) { var p = music.play(); if (p && p.catch) p.catch(function () {}); } }
  function musicButton() {
    var b = el("button", { type: "button", className: "btn ghost", "aria-pressed": String(!music.muted), text: music.muted ? label("musicOff") : label("musicOn") });
    b.addEventListener("click", function () {
      music.muted = !music.muted;
      if (!music.muted) startMusic(); else music.pause();
      b.setAttribute("aria-pressed", String(!music.muted));
      b.textContent = music.muted ? label("musicOff") : label("musicOn");
    });
    return b;
  }

  /* ------------------------------ theme ------------------------------ */
  function applyTheme() {
    var css = document.documentElement.style, c = THEME.colors || {};
    Object.keys(c).forEach(function (k) { css.setProperty("--" + k, c[k]); });
    if (THEME.fonts) {
      if (THEME.fonts.heading) css.setProperty("--font-heading", THEME.fonts.heading);
      if (THEME.fonts.body) css.setProperty("--font-body", THEME.fonts.body);
      (THEME.fonts.files || []).forEach(function (f) {
        if (!window.FontFace) return;
        var face = new FontFace(f.family, 'url("' + themeFile(f.file) + '")');
        face.load().then(function (l) { document.fonts.add(l); }).catch(function () {});
      });
    }
    document.title = (SETTINGS.courseTitle || "Course") + (THEME.name ? " · " + THEME.name : "");
  }

  /* ------------------------------ preview checks ------------------------------ */
  function checkContent() {
    var issues = [], ids = {}, lim = SETTINGS.limits || {};
    function dup(id, what) { if (!id) issues.push(what + " is missing an id."); else if (ids[id]) issues.push("The id \"" + id + "\" is used twice."); ids[id] = true; }
    if (!rooms().length) issues.push("There are no rooms in content.js.");
    allRooms().forEach(function (r) {
      dup(r.id, "A room");
      if (!(THEME.rooms && THEME.rooms[r.id] && THEME.rooms[r.id].name)) issues.push("Room \"" + r.id + "\" has no name in the theme file; using its title instead.");
      (r.lessons || []).forEach(function (l, i) {
        var n = words(l.heading) + words(l.summary) + (l.bullets || []).reduce(function (a, b) { return a + words(b); }, 0);
        if (lim.maxWordsPerScreen && n > lim.maxWordsPerScreen) issues.push(r.id + " lesson " + (i + 1) + " has " + n + " words (limit " + lim.maxWordsPerScreen + ").");
        if (lim.maxBulletsPerScreen && (l.bullets || []).length > lim.maxBulletsPerScreen) issues.push(r.id + " lesson " + (i + 1) + " has more than " + lim.maxBulletsPerScreen + " bullets.");
        if (l.image && !l.image.alt) issues.push(r.id + " lesson " + (i + 1) + ": the image needs alt text (or alt: \"\" if it is decoration).");
        if (l.video && !l.video.captions) issues.push(r.id + " lesson " + (i + 1) + ": the video needs a captions file.");
      });
      (r.questions || []).forEach(function (q) {
        dup(q.id, "A question in " + r.id);
        if (q.survey) { if (!(q.choices || []).length) issues.push("Survey question " + q.id + " has no choices."); return; }
        var cids = (q.choices || []).map(function (c) { return c.id; });
        if (cids.indexOf(q.correct) < 0) issues.push("Question " + q.id + ": the correct answer \"" + q.correct + "\" isn't one of its choice ids.");
        if (!q.feedbackCorrect || !q.feedbackIncorrect) issues.push("Question " + q.id + " is missing feedback.");
      });
    });
    bonusRooms().forEach(function (b) {
      var u = b.unlock || "always";
      if (["always", "perfectScore", "allRoomsComplete"].indexOf(u) < 0 && !(u.indexOf("egg:") === 0 && (CONTENT.easterEggs || []).some(function (e) { return e.id === u.slice(4); })))
        issues.push("Bonus room " + b.id + " has an unknown unlock rule: \"" + u + "\".");
    });
    (CONTENT.easterEggs || []).forEach(function (e) { dup(e.id, "An easter egg"); });
    [CONTENT.startSurvey, CONTENT.survey].forEach(function (sv) { if (sv && sv.questions) sv.questions.forEach(function (q) { dup(q.id, "A survey question"); }); });
    if (!coreQuestions().length) issues.push("There are no scored questions in the required rooms.");
    var sp = SETTINGS.scoring && SETTINGS.scoring.passingPercent;
    if (sp !== null && sp !== undefined && !(sp > 0 && sp <= 100)) issues.push("passingPercent must be a number from 1 to 100, or null.");
    return issues;
  }

  function previewBanner() {
    var issues = checkContent();
    var b = el("div", { className: "preview-banner", role: "note" }, [
      el("strong", { text: "Preview mode: " }), "nothing is saved or sent. ",
      el("button", { type: "button", className: "btn small", text: "Content check (" + issues.length + ")", onclick: function () {
        openDialog("Content check", issues.length ? [el("ul", null, issues.map(function (t) { return el("li", { text: t }); }))] : [el("p", { text: "No problems found." })]);
      } })
    ]);
    document.body.insertBefore(b, document.body.firstChild);
  }

  /* ------------------------------ start up ------------------------------ */
  // Plain-language message when an edited file has a typing mistake.
  function loadProblem() {
    var errs = window.COURSE_LOAD_ERRORS || [];
    var missing = [];
    if (!window.COURSE_SETTINGS) missing.push("course/settings.js");
    if (!window.COURSE_CONTENT) missing.push("course/content.js");
    if (THEME_FAILED) missing.push(THEME_BASE + "theme.js");
    if (!errs.length && !missing.length) return null;
    var where = errs.length ? errs.map(function (x) { return x.file + (x.line ? " (around line " + x.line + ")" : ""); }) : missing;
    return where.filter(function (v, i, a) { return a.indexOf(v) === i; });
  }

  function showLoadProblem(where) {
    var m = document.getElementById("main");
    m.textContent = "";
    m.appendChild(el("div", { className: "panel" }, [
      el("h1", { text: "This course has a typing mistake" }),
      el("p", { className: "lead", text: "A file couldn't be read. Check:" }),
      el("ul", null, where.map(function (w) { return el("li", { text: w }); })),
      el("p", { text: "Common causes: a missing quote mark (\"), a missing comma between items, or a missing } or ]. Undo your last change, or compare with the original template file." })
    ]));
  }

  function start() {
    var problem = loadProblem();
    if (problem) { showLoadProblem(problem); return; }
    applyTheme();
    setupMusic();
    root = document.getElementById("app");
    main = document.getElementById("main");
    Scorm.init();
    state = freshState(1);
    if (Scorm.connected()) {
      var raw = Scorm.get("cmi.suspend_data");
      if (raw) { try { var saved = JSON.parse(raw); if (saved && saved.v === 1) state = saved; } catch (e) { /* start fresh */ } }
      var status = Scorm.get("cmi.completion_status");
      if (status === "completed") state.completed = true;
      else Scorm.set("cmi.completion_status", "incomplete");   // never overwrites "completed"
      if (Scorm.get("cmi.success_status") === "passed") state.passedEver = true;
      var lms = parseFloat(Scorm.get("cmi.scaled_passing_score"));
      setupObjectives();
      Scorm.commit();
      if (!isNaN(lms)) passing = lms;                          // the learning system's setting wins
    } else {
      previewBanner();
    }
    if (passing === null && SETTINGS.scoring && typeof SETTINGS.scoring.passingPercent === "number") passing = SETTINGS.scoring.passingPercent / 100;
    window.addEventListener("pagehide", function () { exitCourse(false); });
    window.addEventListener("beforeunload", function () { exitCourse(false); });
    resumeScreen = state.screen && (state.screen.type === "room" || state.screen.type === "finish") ? state.screen : { type: "hub" };
    show({ type: "start" });
  }

  function loadTheme() {
    var name = String(SETTINGS.theme || "manor").replace(/[^A-Za-z0-9_-]/g, "");
    THEME_BASE = "themes/" + name + "/";
    var s = document.createElement("script");
    s.src = THEME_BASE + "theme.js";
    s.onload = function () { THEME = window.COURSE_THEME || {}; if (!window.COURSE_THEME) THEME_FAILED = true; start(); };
    s.onerror = function () { THEME = {}; THEME_FAILED = true; start(); };
    document.head.appendChild(s);
  }

  // Exposed for the test tools only.
  window.CourseEngine = { checkContent: function () { return checkContent(); }, state: function () { return state; } };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadTheme); else loadTheme();
})();
