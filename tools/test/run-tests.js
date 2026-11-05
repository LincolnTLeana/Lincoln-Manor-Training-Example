// For IT: automated checks of the course template against the mock LMS.
// Runs a headless browser on this computer. Any request to anything other than
// the local test server is blocked AND counted as a failure.
// Usage: node tools/test/run-tests.js
const { chromium } = require('playwright');
const { start } = require('../mock-lms/serve.js');
const path = require('path');
const fs = require('fs');

const PORT = 8124;
const BASE = `http://127.0.0.1:${PORT}`;
const LMS = `${BASE}/tools/mock-lms/mock-lms.html`;
let failures = 0, passes = 0;
const outside = [];
function check(name, ok, detail) {
  if (ok) { passes++; console.log('  PASS ' + name); }
  else { failures++; console.log('  FAIL ' + name + (detail !== undefined ? '  -> ' + JSON.stringify(detail) : '')); }
}

async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext();
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.protocol === 'file:' || (u.hostname === '127.0.0.1' && u.port === String(PORT))) {
      if (opts.settings && u.pathname.endsWith('/course/settings.js')) return route.fulfill({ contentType: 'text/javascript', body: opts.settings });
      if (opts.content && u.pathname.endsWith('/course/content.js')) return route.fulfill({ contentType: 'text/javascript', body: opts.content });
      return route.continue();
    }
    outside.push(u.href); return route.abort();
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => {
    if (opts.expectError) { console.log('  (expected error from the deliberate typo: ' + e.message + ')'); return; }
    failures++; console.log('  FAIL page error: ' + e.message);
  });
  return page;
}

const course = (page) => page.frames().find((f) => /course-folder\/(index|exit)\.html/.test(f.url()));
const cmi = (page) => page.evaluate(() => MockLms.data().cmi);
async function waitCourse(page) {
  for (let i = 0; i < 50; i++) { const f = course(page); if (f) { try { await f.waitForSelector('main h1', { timeout: 200 }); return f; } catch (e) {} } await page.waitForTimeout(100); }
  throw new Error('course did not load');
}
async function click(f, text) { await f.getByRole('button', { name: text, exact: true }).first().click(); }

// Play one room. mode: 'correct' | 'wrongFirst' (first question wrong)
async function playRoom(f, roomName, mode) {
  await f.getByRole('button', { name: new RegExp('^' + roomName.replace(/[&]/g, '\\$&')) }).click();
  const content = await f.evaluate(() => window.COURSE_CONTENT);
  for (let guard = 0; guard < 30; guard++) {
    const h1 = (await f.locator('main h1').first().textContent()).trim();
    if (h1 === 'Room complete') return;
    const radios = f.locator('input[name=choice]:not([disabled])');
    if (await radios.count()) {
      const all = content.rooms.concat(content.bonusRooms);
      let q; all.forEach((r) => (r.questions || []).forEach((x) => { if (x.prompt === h1) q = x; }));
      let pick = q.survey ? q.choices[0].id : q.correct;
      if (mode === 'wrongFirst' && q.id.endsWith('_q1')) pick = q.choices.find((c) => c.id !== q.correct).id;
      await f.locator(`input[value="${pick}"]`).check();
      await f.locator('form.question button[type=submit]').click();
    }
    await f.locator('nav .btn.primary').click();
  }
  throw new Error('room never finished');
}

(async () => {
  const server = await start(PORT);
  const browser = await chromium.launch();
  const content = require('vm').runInNewContext(fs.readFileSync(path.join(__dirname, '../../template/course-folder/course/content.js'), 'utf8') + ';window.COURSE_CONTENT', { window: {} });
  const theme = require('vm').runInNewContext(fs.readFileSync(path.join(__dirname, '../../template/course-folder/themes/manor/theme.js'), 'utf8') + ';window.COURSE_THEME', { window: {} });
  const names = content.rooms.map((r) => theme.rooms[r.id].name);
  const total = content.rooms.reduce((a, r) => a + r.questions.filter((q) => !q.survey).length, 0);
  const scored = (c) => Object.keys(c).filter((k) => /^cmi\.interactions\.\d+\.weighting$/.test(k) && c[k] === '1').length;
  // Start button, then answer (or skip) the start survey.
  async function enter(f, label, answerSurvey) {
    await click(f, label);
    if ((await f.locator('main h1').first().textContent()).trim() === 'Your starting point') {
      if (answerSurvey) { await f.locator('input[value="beginner"]').check(); await click(f, 'Send answer'); }
      else await click(f, 'Skip');
    }
  }

  console.log('\n1. Perfect run, bonus room, survey, save & exit');
  let page = await newPage(browser);
  await page.goto(LMS); await page.evaluate(() => MockLms.reset()); await page.goto(LMS);
  let f = await waitCourse(page);
  await enter(f, 'Enter the manor', true);
  let c = await cmi(page);
  check('status is incomplete after launch', c['cmi.completion_status'] === 'incomplete', c['cmi.completion_status']);
  for (let i = 0; i < names.length; i++) {
    await playRoom(f, names[i], 'correct');
    c = await cmi(page);
    if (i < names.length - 1) {
      check(`no score before last question (room ${i + 1})`, c['cmi.score.raw'] === undefined, c['cmi.score.raw']);
      await click(f, 'Back to the Grand Hall');
    }
  }
  c = await cmi(page);
  check('completed after all rooms', c['cmi.completion_status'] === 'completed', c['cmi.completion_status']);
  check(`score raw ${total}/${total}`, c['cmi.score.raw'] === String(total) && c['cmi.score.max'] === String(total) && c['cmi.score.min'] === '0', [c['cmi.score.raw'], c['cmi.score.max']]);
  check('score scaled 1', c['cmi.score.scaled'] === '1', c['cmi.score.scaled']);
  check('no pass/fail when passingPercent is null', c['cmi.success_status'] === 'unknown', c['cmi.success_status']);
  check('progress_measure 1', c['cmi.progress_measure'] === '1', c['cmi.progress_measure']);
  check(`${total} scored answers recorded`, scored(c) === total, scored(c));
  const sid = (id) => Object.keys(c).find((k) => /interactions\.\d+\.id$/.test(k) && c[k] === id);
  check('start survey answer recorded (neutral, weight 0)', sid('survey_familiarity') && c[sid('survey_familiarity').replace('.id', '.result')] === 'neutral' && c[sid('survey_familiarity').replace('.id', '.learner_response')] === 'beginner');
  check('in-room survey answer recorded (neutral, weight 0, with room)', sid('survey_confidence') && c[sid('survey_confidence').replace('.id', '.weighting')] === '0' && c[sid('survey_confidence').replace('.id', '.objectives.0.id')] === 'room3');
  const q1 = Object.keys(c).find((k) => /interactions\.\d+\.id$/.test(k) && c[k] === 'room1_q1').replace('.id', '.');
  const i0 = (k) => c[q1 + k];
  check('interaction fields complete', i0('id') === 'room1_q1' && i0('type') === 'choice' && i0('learner_response') === 'b' && i0('correct_responses.0.pattern') === 'b' && i0('result') === 'correct' && i0('weighting') === '1' && /^\d{4}-\d\d-\d\dT/.test(i0('timestamp')) && /^PT/.test(i0('latency')) && i0('description') === 'What is a prompt?' && i0('objectives.0.id') === 'room1', Object.keys(c).filter((k) => k.startsWith(q1)).map((k) => k + '=' + c[k]));
  check('4 room objectives completed', ['0', '1', '2', '3'].every((i) => c[`cmi.objectives.${i}.completion_status`] === 'completed') && c['cmi.objectives._count'] === '4', c['cmi.objectives._count']);
  await click(f, 'See your results');
  const finishText = await f.locator('main').innerText();
  check('finish screen shows score', finishText.includes(`Score: ${total} of ${total}`));
  check('finish screen shows perfect message', finishText.includes('secret room'));
  // survey
  await f.locator('input[name="survey_badges"][value="yes"]').check(); await f.locator('input[name="survey_interest"][value="yes"]').check();
  await click(f, 'Send answer');
  c = await cmi(page);
  const sv = Object.keys(c).filter((k) => /interactions\.\d+\.id$/.test(k) && c[k].startsWith('survey_'));
  check('all 4 survey answers (start, room, end) recorded as neutral', sv.length === 4 && sv.every((k) => c[k.replace('.id', '.result')] === 'neutral' && c[k.replace('.id', '.weighting')] === '0'), sv.map((k) => c[k]));
  check('survey did not change the score', c['cmi.score.raw'] === String(total));
  // bonus room
  await click(f, 'Review rooms');
  check('bonus room unlocked', await f.getByRole('button', { name: /The Secret Study/ }).count() === 1);
  await playRoom(f, 'The Secret Study', 'correct');
  c = await cmi(page);
  const bonusKey = Object.keys(c).find((k) => /interactions\.\d+\.id$/.test(k) && c[k] === 'bonus1_q1');
  check('bonus answer recorded with weighting 0', bonusKey && c[bonusKey.replace('.id', '.weighting')] === '0');
  check('bonus room did not change score or completion', c['cmi.score.raw'] === String(total) && c['cmi.completion_status'] === 'completed');
  // easter egg
  await click(f, 'Back to the Grand Hall');
  await f.getByRole('button', { name: /A loose floorboard/ }).click();
  check('easter egg opens its message', (await f.locator('dialog').innerText()).includes('hidden note'));
  await f.locator('dialog').getByRole('button', { name: 'Close' }).click();
  // save & exit
  await click(f, 'Save & exit');
  await page.waitForTimeout(400);
  c = await cmi(page);
  const d = await page.evaluate(() => MockLms.data());
  check('exit set to suspend', d.lastExit === 'suspend', d.lastExit);
  check('session_time recorded', /^PT/.test(c['cmi.session_time'] || ''), c['cmi.session_time']);
  check('no navigation request (adl.nav.request) sent', !Object.keys(c).some((k) => k.startsWith('adl.nav')));
  check('exit page shown', /exit\.html/.test(course(page).url()));
  const calls = await page.evaluate(() => MockLms.calls());
  const errs = calls.filter((x) => x.e !== '0' && !(x.c === 'GetValue' && /scaled_passing_score/.test(x.a[0])));
  check('no SCORM errors during the run', errs.length === 0, errs.slice(0, 5));

  console.log('\n2. Resume after exit');
  await page.evaluate(() => { MockLms.relaunch(); document.getElementById('course').src = '../../template/course-folder/index.html?r=1'; });
  await page.waitForTimeout(300);
  f = await waitCourse(page);
  c = await cmi(page);
  check('entry is resume', c['cmi.entry'] === 'resume');
  check('completed stays completed after relaunch', c['cmi.completion_status'] === 'completed');
  await click(f, 'Return to the manor');
  check('progress kept on resume', (await f.locator('main').innerText()).includes('4 of 4 rooms complete'));
  // retry keeps completion and best score
  await click(f, 'Start over');
  await f.locator('dialog').getByRole('button', { name: 'Yes, start over' }).click();
  c = await cmi(page);
  check('start over keeps completed', c['cmi.completion_status'] === 'completed');
  check('start over clears room progress', (await f.locator('main').innerText()).includes('0 of 4 rooms complete'));
  await page.close();

  console.log('\n3. One wrong answer (11/12), mid-room save and resume');
  page = await newPage(browser);
  await page.goto(LMS + '?learner=b'); await page.evaluate(() => MockLms.reset()); await page.goto(LMS + '?learner=b');
  f = await waitCourse(page);
  await enter(f, 'Enter the manor', false);
  await playRoom(f, names[0], 'wrongFirst');
  await click(f, 'Back to the Grand Hall');
  // stop part-way through room 2
  await f.getByRole('button', { name: new RegExp('^' + names[1]) }).click();
  await f.locator('nav .btn.primary').click();
  const where = (await f.locator('main h1').first().textContent()).trim();
  await click(f, 'Save & exit'); await page.waitForTimeout(300);
  await page.evaluate(() => { MockLms.relaunch(); document.getElementById('course').src = '../../template/course-folder/index.html?r=2'; });
  await page.waitForTimeout(300); f = await waitCourse(page);
  await click(f, 'Return to the manor');
  check('resume returns to the same screen', (await f.locator('main h1').first().textContent()).trim() === where, where);
  // Back from step 2 -> step 1 -> main hall
  for (let k = 0; k < 2; k++) await f.locator('nav .btn:not(.primary)').click();
  check('Back from the first screen returns to the main hall', (await f.locator('main h1').first().textContent()).trim() === 'Grand Hall');
  for (let i = 1; i < names.length; i++) {
    await playRoom(f, names[i], 'correct');
    if (i < names.length - 1) await click(f, 'Back to the Grand Hall');
  }
  c = await cmi(page);
  const exp = (Math.floor(((total - 1) / total) * 1000) / 1000).toString();
  check(`score ${total - 1}/${total} scaled ${exp} (truncated)`, c['cmi.score.raw'] === String(total - 1) && c['cmi.score.scaled'] === exp, [c['cmi.score.raw'], c['cmi.score.scaled']]);
  check('wrong answer recorded as incorrect', c['cmi.interactions.0.result'] === 'incorrect');
  await click(f, 'See your results');
  await click(f, 'Review rooms');
  check('no bonus room without a perfect score', await f.getByRole('button', { name: /The Secret Study/ }).count() === 0);
  await page.close();

  console.log('\n4. Passing score (set in the LMS at 95%): fail, then pass on retry, never back to fail');
  page = await newPage(browser);
  await page.goto(LMS + '?learner=c&passing=0.95'); await page.evaluate(() => MockLms.reset()); await page.goto(LMS + '?learner=c&passing=0.95');
  f = await waitCourse(page);
  await enter(f, 'Enter the manor', false);
  for (let i = 0; i < names.length; i++) { await playRoom(f, names[i], i === 0 ? 'wrongFirst' : 'correct'); if (i < names.length - 1) await click(f, 'Back to the Grand Hall'); }
  c = await cmi(page);
  check('11/12 below 95% -> failed', c['cmi.success_status'] === 'failed', c['cmi.success_status']);
  check('failed learner is still completed', c['cmi.completion_status'] === 'completed');
  await click(f, 'See your results');
  check('finish screen explains retry', (await f.locator('main').innerText()).includes("didn't reach the passing score"));
  await click(f, 'Start over'); await f.locator('dialog').getByRole('button', { name: 'Yes, start over' }).click();
  for (let i = 0; i < names.length; i++) { await playRoom(f, names[i], 'correct'); await click(f, 'Back to the Grand Hall'); }
  c = await cmi(page);
  check('retry with 12/12 -> passed', c['cmi.success_status'] === 'passed' && c['cmi.score.scaled'] === '1', [c['cmi.success_status'], c['cmi.score.scaled']]);
  check('both attempts kept in interactions', scored(c) === total * 2, scored(c));
  await click(f, 'Start over'); await f.locator('dialog').getByRole('button', { name: 'Yes, start over' }).click();
  for (let i = 0; i < names.length; i++) { await playRoom(f, names[i], 'wrongFirst'); if (i < names.length - 1) await click(f, 'Back to the Grand Hall'); }
  c = await cmi(page);
  check('a worse third attempt stays passed and keeps best score', c['cmi.success_status'] === 'passed' && c['cmi.score.scaled'] === '1', [c['cmi.success_status'], c['cmi.score.scaled']]);
  await page.close();

  console.log('\n5. passingPercent set in settings.js (80%)');
  const baseSettings = fs.readFileSync(path.join(__dirname, '../../template/course-folder/course/settings.js'), 'utf8');
  page = await newPage(browser, { settings: baseSettings.replace('passingPercent: null', 'passingPercent: 80') });
  await page.goto(LMS + '?learner=d'); await page.evaluate(() => MockLms.reset()); await page.goto(LMS + '?learner=d');
  f = await waitCourse(page); await enter(f, 'Enter the manor', false);
  for (let i = 0; i < names.length; i++) { await playRoom(f, names[i], 'wrongFirst'); if (i < names.length - 1) await click(f, 'Back to the Grand Hall'); }
  c = await cmi(page);
  const sc = +c['cmi.score.scaled'];
  check(`8/12 (${sc}) below 80% -> failed`, c['cmi.success_status'] === 'failed' && c['cmi.score.raw'] === String(total - names.length), [c['cmi.score.raw'], c['cmi.success_status']]);
  await page.close();

  console.log('\n6. Workshop theme is a one-line switch');
  page = await newPage(browser, { settings: baseSettings.replace('theme: "manor"', 'theme: "workshop"') });
  await page.goto(LMS + '?learner=e'); await page.evaluate(() => MockLms.reset()); await page.goto(LMS + '?learner=e');
  f = await waitCourse(page); await enter(f, 'Clock in', false);
  const hub = await f.locator('main').innerText();
  check('workshop room names shown', hub.includes('CNC & Welding') && hub.includes('Shop Floor'), hub.slice(0, 200));
  await page.close();

  console.log('\n7. Add a room and remove the bonus room (content change only)');
  const extra = content.rooms[0];
  const added = fs.readFileSync(path.join(__dirname, '../../template/course-folder/course/content.js'), 'utf8')
    .replace('  bonusRooms: [', `  bonusRooms: [], _unused: [`)
    .replace('  rooms: [', '  rooms: [' + JSON.stringify(Object.assign({}, extra, { id: 'room5', title: 'Extra room', questions: extra.questions.map((q) => Object.assign({}, q, { id: q.id.replace('room1', 'room5') })) })) + ',');
  page = await newPage(browser, { content: added });
  await page.goto(LMS + '?learner=f'); await page.evaluate(() => MockLms.reset()); await page.goto(LMS + '?learner=f');
  f = await waitCourse(page); await enter(f, 'Enter the manor', false);
  check('hub shows 5 rooms', (await f.locator('main').innerText()).includes('0 of 5 rooms complete'));
  await playRoom(f, 'Extra room', 'correct'); await click(f, 'Back to the Grand Hall');
  for (let i = 0; i < names.length; i++) { await playRoom(f, names[i], 'correct'); if (i < names.length - 1) await click(f, 'Back to the Grand Hall'); }
  c = await cmi(page);
  check(`score out of ${total + 3} with the added room`, c['cmi.score.max'] === String(total + 3) && c['cmi.score.raw'] === String(total + 3), [c['cmi.score.raw'], c['cmi.score.max']]);
  await click(f, 'See your results'); await click(f, 'Review rooms');
  check('no bonus room when bonusRooms is empty', await f.locator('.room-card.bonus').count() === 0);
  await page.close();

  console.log('\n8. Preview mode (no LMS) and content check');
  page = await newPage(browser);
  await page.goto(`${BASE}/template/course-folder/index.html`);
  await page.waitForSelector('main h1');
  check('preview banner shown', (await page.locator('.preview-banner').innerText()).includes('Preview mode'));
  check('sample content passes the content check', (await page.evaluate(() => CourseEngine.checkContent())).length === 0, await page.evaluate(() => CourseEngine.checkContent()));
  await page.close();
  const broken = fs.readFileSync(path.join(__dirname, '../../template/course-folder/course/content.js'), 'utf8').replace('correct: "b",', 'correct: "z",').replace('unlock: "perfectScore"', 'unlock: "egg:missing"');
  page = await newPage(browser, { content: broken });
  await page.goto(`${BASE}/template/course-folder/index.html`); await page.waitForSelector('main h1');
  const issues = await page.evaluate(() => CourseEngine.checkContent());
  check('content check catches a wrong answer key and a bad unlock rule', issues.some((t) => t.includes('"z"')) && issues.some((t) => t.includes('egg:missing')), issues);
  await page.close();

  const typo = fs.readFileSync(path.join(__dirname, '../../template/course-folder/course/content.js'), 'utf8').replace('heading: "Welcome",', 'heading: "Welcome"');
  page = await newPage(browser, { content: typo, expectError: true });
  await page.goto(`${BASE}/template/course-folder/index.html`); await page.waitForSelector('main h1');
  const msg = await page.locator('main').innerText();
  check('a typing mistake shows a plain message naming the file', msg.includes('typing mistake') && msg.includes('course/content.js'), msg.slice(0, 200));
  await page.close();

  console.log('\n9. Opening index.html straight from a folder (double-click preview)');
  page = await newPage(browser);
  await page.goto('file://' + path.join(__dirname, '../../template/course-folder/index.html'));
  await page.waitForSelector('main h1', { timeout: 5000 }).catch(() => {});
  check('course runs from a local folder', (await page.locator('main h1').count()) === 1 && (await page.locator('.preview-banner').count()) === 1);
  await page.close();

  console.log('\n10. Phone-width layout');
  const ctx = await browser.newContext({ viewport: { width: 375, height: 740 } });
  const p2 = await ctx.newPage(); await p2.goto(`${BASE}/template/course-folder/index.html`); await p2.waitForSelector('main h1');
  await p2.getByRole('button', { name: 'Enter the manor' }).click();
  const sw = await p2.evaluate(() => document.documentElement.scrollWidth);
  check('no sideways scrolling at 375px', sw <= 375, sw);
  await ctx.close();

  check('no requests to anything outside the local test server', outside.length === 0, outside);
  await browser.close(); server.close();
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
