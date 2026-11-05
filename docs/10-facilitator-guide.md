# Facilitator guide: staff session (90 minutes)

*For the person running the session. This guide and the slide deck are trainer materials, kept separate from the toolkit handed to participants.*

## Before the session
- [ ] Laptop on a work device, signed in to **Microsoft Copilot** with a work account; **Protected** label visible
- [ ] Slide deck open; speaker notes visible on your screen only
- [ ] Copies of: one-page AI rules, prompt-planning template (printed or shared link)
- [ ] The **template course** open in a browser (double-click `index.html` in a copy of `course-folder`)
- [ ] A copy of `course/content.js` open in Notepad for the live edit
- [ ] If showing ADP: the **private test folder** only, with a test learner, and no real learner records on screen
- [ ] **Close** email, Teams chats, ADP reports, spreadsheets and anything else with personal data

## Agenda
| Time | Segment | Materials |
|---|---|---|
| 0:00 | Welcome, goals | Slides 1–2 |
| 0:05 | What a game-style course looks like: play 2 minutes of the template | Slide 3, template |
| 0:15 | The rules: tool, what goes in, what never does | Slides 4–7, one-page rules |
| 0:30 | Plan before you prompt | Slide 8, planning template |
| 0:40 | **Live demo** | Slide 9, Copilot, Notepad |
| 0:55 | **Hands-on exercise** | Slide 10 |
| 1:10 | Share-out | |
| 1:15 | From content to ADP Learning: who does what | Slide 11 |
| 1:20 | What's next, questions | Slides 12–13 |

## Live demo script (prompt template → prompt → output → review → content file → package → ADP)
1. **Plan (2 min).** Show the planning template filled in with the worked example ("Data Vault" room). Point at question 3, the data check: "Nothing personal here: it's all made up."
2. **Prompt (2 min).** Open Copilot; point at the **Protected** label. Paste the worked-example prompt.
3. **Output (3 min).** Read it aloud with the group. Ask: "Is there exactly one right answer? Does any feedback invent a rule?"
4. **Review and fix (3 min).** Ask for one fix: *"Question 2 has two right answers. Rewrite choice C so only B is correct."* Point out that you changed one thing only.
5. **Update the content file (3 min).** In Notepad, open `course/content.js`, find `room2_q1`, paste the new question text over the old, save, and refresh the browser. Show **Content check (0)**.
   - Bonus: change `theme: "manor"` to `theme: "workshop"` in `settings.js` and refresh. Same content, new look.
6. **Package (1 min, talk-through).** Show the packaging guide: double-click **Build Course Package**, choose the folder, read the report. *(Don't run it live until it's been tested and signed by IT.)*
7. **Test in ADP (1 min, talk-through).** Explain the private test folder and the testing checklist. If you show ADP, use the test learner only.

**If Copilot gives a different answer than expected:** that's a teaching moment. Review it together the same way.

## Hands-on exercise (15 minutes)
**Task:** pick a topic you train on. Fill in the 10 planning questions, write a prompt for 3 quiz questions with feedback, run it in Copilot, and find one thing to fix.

**Sample topics** (all safe, made up):
- "How to submit a supply request" (generic steps)
- "Welcoming a new student at the front desk" (made-up scenario with [STUDENT])
- "Safe use of a shared printer" (no names)
- For the financial aid team: "Explaining what a deadline reminder email should include," with no real student situations

**Rules for the exercise:** made-up examples only; no student, employee or learner data, even for practice.

**Share-out (5 min):** two or three people share what Copilot did well and what they had to fix.

## Do not show live
- Any **real learner data**: ADP reports, completion lists, scores, interaction exports
- **ADP logs** or admin screens with learner records
- **Spreadsheets** with learner or staff data
- **Script editors or code connected to outside services**; old reporting set-ups
- Emails, Teams chats or files with personal information
- Passwords or sign-in screens with credentials visible

## Questions you may get
| Question | Answer |
|---|---|
| Can I use another AI tool I like? | Only tools in Appendix A for your role. Others need a request to the CIO (Section 5). |
| Can I paste our internal training into Copilot? | Yes, in Copilot only, signed in with your work account. Personal information never. |
| Do I need to code? | No. The template is updated by editing text files. Code changes are for technical staff. |
| Who uploads to ADP? | HR L&D, after the security review. |
| Does AI decide who passes? | No. The course scores answers by fixed rules; people make decisions about people. |

## After the session
- Share the toolkit ZIP (not this guide or the slides) and the one-page rules.
- Collect topics people want to build; pair each with a subject expert.
- Follow up on open policy questions with the CIO.
