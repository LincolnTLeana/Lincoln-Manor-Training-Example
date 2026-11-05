# Testing in ADP Learning

*Every course is tested **inside ADP Learning** before rollout. A course can pass on your computer and still behave differently in ADP's player.*

## How testing works
1. **Send your course folder** to the Training and Development reviewer, who **packages** it and does the **security review** ([Packaging guide](12-packaging-guide.md)).
2. **HR Learning & Development** uploads it to a **catalog folder only you can see**.
3. **You test** using the checklist below and take notes ([test notes template](templates/test-notes-template.md)).
4. **Fix** anything in your course folder, **raise the version**, and send the folder again for packaging and re-upload.
5. Repeat until every check passes. Then HR L&D moves it to the real catalog for rollout.

**Do not use public test sites** (for example SCORM Cloud) for anything containing organization content. If you want to try SCORM Cloud, use only the **unbranded template as it ships**, before any organization-specific information is added.

## Version naming
`COURSEID_vMAJOR.MINOR.PATCH_YYYY-MM-DD.zip`: see the [version rule](12-packaging-guide.md#version-rule). Write the version you're testing at the top of your notes. **The version is shown on the course's start screen,** so you can confirm ADP is playing the newest upload.

## Testing checklist
Use a **test learner account**, not your own record, if HR L&D can provide one. Clear or re-enroll between runs as noted.

### Launch and progress
- [ ] Course opens from the catalog, and the start screen shows the **right version**
- [ ] Every room opens; **Next** and **Back** work on every screen
- [ ] **Save & exit** shows "Your progress is saved"; ADP shows **In progress**
- [ ] **Resume:** relaunch, choose Continue, and you're back on the same screen with progress kept
- [ ] Closing the window without Save & exit still keeps progress

### Completion and score
- [ ] After the last required room, ADP shows **Completed**
- [ ] **Score** in ADP matches the finish screen (for example 11 of 12 = 91.6%)
- [ ] No score appears before the last question
- [ ] If a passing score is set: a low score shows **Failed**; Start over then a high score shows **Passed**
- [ ] **Start over** keeps Completed (it never goes back to In progress)
- [ ] **Re-enrollment:** HR L&D re-enrolls the test learner; the course starts fresh and completes again

### Data in ADP
- [ ] **Every question's answer** appears in the custom report ([SCORM and ADP reporting](07-scorm-and-adp-reporting.md)): id, response, result, time
- [ ] Bonus-room and survey answers appear with weight 0 and don't change the score
- [ ] Room objectives show as completed (if your ADP report shows objectives)

### Links and media (inside ADP's player)
- [ ] Every link in the packaging report opens, including pages that need sign-in
- [ ] PDFs open; images show; videos play **with captions**; transcripts open
- [ ] Music starts muted and the Music button works

### Accessibility
- [ ] Whole course works with the **keyboard only** (Tab, Shift+Tab, Enter, Space, arrow keys for choices)
- [ ] The focus outline is always visible
- [ ] A screen reader (Narrator: **Ctrl + Windows + Enter**) reads headings, choices, feedback and the easter egg labels
- [ ] Text is readable at 200% browser zoom (**Ctrl and +**)
- [ ] Every image has alt text; nothing depends on color alone (feedback also shows ✓ or ✗)

### Mobile
- [ ] Course opens in ADP's mobile app or a phone browser; no sideways scrolling; buttons are easy to tap

### Content
- [ ] No made-up sample details left (example.org, 555-0100, "Course Designer"); help contacts and credits are right
- [ ] AI-assistance line present (if AI helped)
- [ ] Subject expert and compliance sign-off recorded on the hand-off form

## What to do when something fails
| Problem | Likely cause | Fix |
|---|---|---|
| Old version plays | ADP still has the earlier upload | Check the version on the start screen; ask HR L&D to replace it |
| Stays "In progress" after finishing | A required room isn't finished; or a bonus room was expected to count | Check every required room shows Complete |
| Link won't open | Page needs sign-in, or blocks being opened from the player | Package the file instead, or use a public internal page |
| Course shows only "Loading…" | Typing mistake in a `.js` file | Preview locally and run Content check; undo the last change |
| Answers missing from report | `recordAnswers: false`, or the wrong report data source | Check `settings.js`; check the report's source |

Technical problems you can't solve go to the **Helpdesk**; content questions go to the **Learning Center**.
