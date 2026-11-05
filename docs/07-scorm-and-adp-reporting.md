# SCORM and ADP Learning: what is tracked and how to report on it

## In plain words
- **SCORM 2004 (4th Edition)** is a standard "plug" between a course and a learning system. The course package is a ZIP; ADP Learning unpacks it and plays it in its course player.
- While a learner plays, the course sends small pieces of data to ADP Learning through that plug: "this learner finished," "scored 11 of 12," "answered B to question 3." ADP's player, built on the Rustici engine, stores them against the learner's record.
- **That's the only place data goes.** The course can't send anything to any other website or service. A security setting in `index.html` blocks it, and the packaging tool checks for it.

## What the template sends to ADP Learning
| Data (SCORM name) | What it means | When it's sent | Example |
|---|---|---|---|
| Completion `cmi.completion_status` | Finished or not | "incomplete" at first launch; "completed" when every required room is done | `completed` |
| Pass/fail `cmi.success_status` | Only if a passing score is set | After the last required question | `passed` / `failed` |
| Score, raw `cmi.score.raw` | Number correct | After the last required question | `11` |
| Score, min/max `cmi.score.min/max` | Range | Same time | `0` / `12` |
| Score, scaled `cmi.score.scaled` | Percent as 0–1, truncated to 3 decimals | Same time | `0.916` (= 91.6%) |
| Progress `cmi.progress_measure` | Share of required rooms done | Each time a room is finished | `0.5` |
| Rooms `cmi.objectives.n` | One per required room, with completion | Room finished | id `room2`, `completed` |
| **Each answer** `cmi.interactions.n` | One record per answer (see below) | Each time a learner checks an answer | |
| Bookmark `cmi.location` / `cmi.suspend_data` | Where the learner is, and their progress | Continuously | (internal) |
| Exit `cmi.exit` | "suspend" so progress is kept | Save & exit, or closing the window | `suspend` |
| Session time `cmi.session_time` | Time in this session | On exit | `PT12M30S` (12 min 30 s) |

### What each answer record holds (`cmi.interactions`)
| Field | Meaning | Example |
|---|---|---|
| `id` | The question's id from `content.js` | `room2_q1` |
| `description` | Question text (first 250 characters) | "A coworker asks you to paste…" |
| `type` | Question type | `choice` |
| `learner_response` | The choice the learner picked | `c` |
| `correct_responses.0.pattern` | The right choice | `c` |
| `result` | correct / incorrect (neutral for survey) | `correct` |
| `weighting` | 1 = counts toward score; 0 = bonus or survey | `1` |
| `timestamp` | When they answered | `2026-11-05T14:03:22` |
| `latency` | Time taken to answer | `PT18S` |
| `objectives.0.id` | Which room | `room2` |

**Retries:** each attempt's answers are kept as new records, so the report shows every attempt with its timestamp. **Survey** answers use ids starting with `survey_` and result `neutral`.

### Rules the template follows
- **Completion** = every required room finished, whatever the score. **Bonus rooms never count.**
- **Score only after the last required question** is answered, so partial scores never appear.
- A **"completed" status is never changed back** to incomplete, and **"passed" is never changed back** to failed.
- **Save & exit** sets exit to "suspend," saves and closes the connection, then shows a "progress saved" page. The template never sends a "suspend all" navigation request, because with that, ADP's player left courses stuck "In process."
- **Learner name** is read only if `greetByName` is on, and only for the greeting on screen. It's never stored in the course.

### Where the old external reporting went
Earlier versions of this kind of game could send results to an outside spreadsheet. **That's removed.** Every useful field now travels through SCORM:

| Old outside report field | Now |
|---|---|
| Learner name and email | Not needed: ADP Learning already knows who the learner is |
| Score (x/12) | `cmi.score.raw` / `max` / `scaled` |
| Familiarity level | Survey question `survey_familiarity` (interaction) |
| Interest in more training | Survey question `survey_interest` (interaction) |

---

## Building the question-level report in ADP Learning (once, then share it)
Answers to individual questions are pulled with **ADP Learning → Reports Manager → create a custom report.** Follow your organization's ADP Learning reporting resource for the exact steps. In short:
1. Create a custom report on **course or SCORM interaction results**, filtered to your course (its title, or `courseId` from `settings.js`).
2. Add the fields below.
3. **Save** it with a clear name, for example `using-ai-safely – question responses`.
4. **Share the saved report** with the people who need it, rather than exporting files, so access stays inside ADP.
5. Check it with test data from your private test folder ([Testing in ADP Learning](08-testing-in-adp-learning.md)) before launch.

### Fields to include
| Group | Fields |
|---|---|
| Learner (only what the reader needs) | Learner ID or name, department or location *[only if the report's readers need it]* |
| Course | Course title, course ID/version, enrollment date, attempt number |
| Status | Completion status, completion date, success status (if passing score used), score raw, score scaled/percent |
| Answers | Interaction id, description, learner response, correct response, result, timestamp, latency |
| Optional | Objective (room) id and status, total time |

**Tip:** for a summary of which questions are missed most, filter result = incorrect and group by interaction id.

## Rules for handling exported learner data
Exported reports contain **personal information**. They follow the AI policy (R6, R8) and the organization's data protection, information security and confidentiality policies.

1. **Prefer sharing the saved report inside ADP** over exporting files.
2. If you must export, save to an **access-controlled internal location** only. No personal drives, personal email or USB sticks.
3. **Never** paste exports into Copilot or any AI tool, and never upload them to GitHub or any outside site.
4. Share with **only the people who need it**. Remove columns they don't need.
5. **Delete** exports when the task is done, following your retention schedule.
6. **Student records** (FERPA) need extra care: confirm who may see them before sharing.
7. Report a suspected data leak right away, following the information security policy.

## Optional outside reporting
**Not included, and not supported.** The template has no code for sending data anywhere except ADP Learning. Any request for outside reporting goes to **the Training and Development reviewer** and IT security, and must comply with the AI policy.
