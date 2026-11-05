# Prompt library

*Prompts to copy into **Microsoft Copilot** (work sign-in, Protected label). Replace every `[BRACKET]`. Plan first with the [prompt-planning template](02-prompt-planning-template.md), and check every output (AI rules, R9).*

**Reminders:**
- **Internal documents may go into Copilot only.** Personal information never goes into any AI tool ([AI rules](01-ai-rules-for-course-builders.md)).
- **One task per prompt.** Ask for **one fix at a time**.
- Every prompt ends with: *"Ask me up to 3 questions first if anything is unclear."*

---

## 1. Course outline
```
Help me outline a short game-style course for [AUDIENCE].
Goal: after the course, learners can [OUTCOME 1], [OUTCOME 2] and [OUTCOME 3].
The game has [4] rooms; each room teaches one topic and ends with [3] multiple-choice questions.
Give me a table: Room number | Topic | Key point 1 | Key point 2 | Key point 3.
Keep each key point under 15 words. Plain language, 8th-grade reading level.
Ask me up to 3 questions first if anything is unclear.
```

## 2. Room or module design
```
For the room about [TOPIC], suggest:
1) 2–3 lesson screens, each with a heading, one summary sentence and up to 3 bullets (under 100 words per screen);
2) one short practice activity with a model answer.
Audience: [AUDIENCE]. Tone: [friendly / formal]. Use placeholders like [PROGRAM NAME] instead of real names.
Ask me up to 3 questions first if anything is unclear.
```

## 3. Lesson text (rewrite to the standard)
```
Rewrite this lesson screen to fit our standard: one summary sentence, up to 3 bullets,
under 100 words in total, 8th-grade reading level, active voice.
Keep the meaning exactly the same; don't add new facts.
[PASTE YOUR TEXT]
```

## 4. Question and answer bank with feedback
```
Write [3] multiple-choice questions for a room about [TOPIC] for [AUDIENCE].
Each question: under 40 words, 4 choices, exactly one correct answer, plausible wrong answers
(no "all of the above"), feedback for correct and incorrect under 30 words each that explains why.
Base the questions only on these key points: [KEY POINTS].
Format as a table: ID | Question | A | B | C | D | Correct | Feedback if correct | Feedback if incorrect.
Use IDs [room1_q1], [room1_q2], [room1_q3].
Ask me up to 3 questions first if anything is unclear.
```
**Check:** exactly one right answer per question; feedback matches your source; no invented rules.

## 5. Turn a table into the template format
```
Convert this table into the format below. Don't change any wording.
Format for each row:
{ id: "[ID]", prompt: "[Question]", choices: [ { id: "a", text: "[A]" }, { id: "b", text: "[B]" }, { id: "c", text: "[C]" }, { id: "d", text: "[D]" } ], correct: "[letter]", feedbackCorrect: "[...]", feedbackIncorrect: "[...]" },
[PASTE TABLE]
```
Paste the result into `course/content.js`, then preview and run **Content check**.

## 6. Practice activities
```
Write one practice activity for [TOPIC]: a short task the learner types an answer to,
plus a model answer under 50 words. Audience: [AUDIENCE]. Use placeholders, not real names.
```

## 7. Theme ideas
```
Suggest 3 game themes for a course on [TOPIC] for [AUDIENCE] at a career and trade school.
For each: theme name, start-button wording, hub name, names for [4] rooms and a bonus room,
and a 3-color palette (hex codes) with readable text contrast.
Keep it professional and inclusive; no violence or scary content.
```

## 8. Alt text and transcripts
```
Write alt text (one sentence, under 20 words) for an image showing [DESCRIBE THE IMAGE].
Focus on what matters for this lesson: [LESSON POINT].
```
*(Describe the image in words. Don't upload photos of real people.)*

## 9. Test checklist
```
Make a test checklist for a SCORM course in our learning system covering: launch, resume after
save and exit, completion, score, each answer recorded, links and media opening, keyboard-only
use, screen reader, mobile. Format as a checklist with one line per check.
```

## 10. Rollout emails
```
Draft a 120-word announcement email to [AUDIENCE] about a new game-style course, [COURSE TITLE].
Include: why it matters, how long it takes ([MINUTES] minutes), the due date [DATE], where to
find it (ADP Learning), and who to contact: technical issues → [HELPDESK], content questions →
[LEARNING CENTER]. Friendly, plain language.
```
```
Draft a 70-word reminder email for learners who haven't finished [COURSE TITLE] by [DATE].
Encouraging tone; no blame. Include how to resume where they left off.
```

## 11. Manager talking points
```
Write 5 short talking points managers can use in a team meeting to introduce [COURSE TITLE]:
what it is, why it matters, time needed, when it's due, where to get help.
```

## 12. Fix one thing
```
In question [ID], choices [B] and [C] could both be right. Rewrite choice [C] so only [B] is correct.
Change nothing else.
```
```
Shorten bullet [2] on the screen "[HEADING]" to under 12 words. Keep the meaning.
```

---
**For technical staff (Claude, Appendix A):** code changes follow the same habits: one change per request, test after every change, review the code, keep a change log, and send the package for security review. See [Appendix: Claude for technical staff](appendix-claude-for-technical-staff.md).
