# Prompt-planning template: questions to ask yourself

*Fill this in **before** you open Microsoft Copilot. It takes 5–10 minutes and saves rework. Rule numbers (R1 …) match the [policy map](00-policy-map.md).*

> **Prompt:** the message you type to the AI tool.
> **Output:** what the AI tool gives back.

## Part 1: Plan

| # | Question | Your answer |
|---|---|---|
| 1 | **Audience:** who will take this training? What do they already know? | |
| 2 | **Outcome:** after the training, what should they be able to *do*? (Start with a verb: "identify", "choose", "complete".) | |
| 3 | **Data check:** does anything I plan to paste include internal know-how, student or employee information, ADP Learning data, passwords, or unreleased content? (R5–R8) *If yes, clean it up first using the checklist in the [AI rules](01-ai-rules-for-course-builders.md), or leave it out.* | ☐ Nothing restricted ☐ Cleaned up |
| 4 | **Tool:** am I using an approved tool, on a work device, signed in with my work email? (R1–R4) | ☐ Microsoft Copilot ☐ Other approved tool: ____ |
| 5 | **Task:** what exactly am I asking for? (One task per prompt works best.) | |
| 6 | **Limits:** word count, reading level, tone, accessibility needs. *Course standard: under 100 words per screen; one summary sentence plus up to 3 bullets.* | |
| 7 | **Format:** how should the output look? (table, numbered list, question + 4 choices + feedback) | |
| 8 | **Examples:** is there a short, made-up sample of what "good" looks like? | |
| 9 | **Review:** who checks the output, and against what? (R9) If I can't verify it myself, who approves it? | Checker: ____ Source of truth: ____ |
| 10 | **Disclosure:** will this be published? If yes, add the AI-assistance line. (R10) | ☐ Yes, line added ☐ Not needed (brainstorm/outline only) |

## Part 2: Build the prompt

Copy this pattern and fill in the brackets:

```
You are helping me design workplace training for [AUDIENCE].
Goal: after this activity, learners can [OUTCOME].
Task: [ONE CLEAR TASK].
Limits: [WORD LIMIT], [READING LEVEL], plain language, no jargon.
Format: [FORMAT].
Use placeholders like [PROGRAM NAME] instead of real names or numbers.
Before you answer, ask me up to 3 questions if anything is unclear.
```

## Part 3: After the output
- [ ] Read every word. Check the facts against the source of truth from question 9.
- [ ] Remove anything invented (fake policies, wrong numbers, made-up links).
- [ ] Put the real details back yourself, **outside** the AI tool.
- [ ] Ask for **one fix at a time**: "Shorten bullet 2 to under 12 words."
- [ ] Note what changed in your change log (date, what, who reviewed).

---

## Worked example: planning one room of the sample game

*This example comes from the sample course in this toolkit: a mystery-house game that teaches staff how to use an AI assistant safely. It is already cleaned up, so you can show it as is.*

| # | Question | Answer |
|---|---|---|
| 1 | Audience | All staff; most have used email and Teams but not an AI assistant. |
| 2 | Outcome | Learners can **choose** which information is safe to type into an AI assistant. |
| 3 | Data check | ☑ Nothing restricted. All scenarios are made up and use `[LEARNER]`, `[PROGRAM NAME]`. |
| 4 | Tool | ☑ Microsoft Copilot, work laptop, work sign-in. |
| 5 | Task | Draft 3 multiple-choice questions for the "Data Vault" room. |
| 6 | Limits | Each question under 40 words; 4 answer choices; feedback under 30 words; 8th-grade reading level. |
| 7 | Format | Table: question, choices A–D, correct letter, feedback for correct, feedback for incorrect. |
| 8 | Example | "A coworker asks you to paste a student's grade report into an AI tool to summarize it. What should you do?" |
| 9 | Review | Checker: course owner, against the AI rules page. Compliance review before launch. |
| 10 | Disclosure | ☑ Yes. The game's credits screen says "Created with help from AI tools and reviewed by [TEAM]." |

**The prompt typed into Copilot:**

```
You are helping me design workplace training for staff at a career school
who are new to AI assistants.
Goal: after this activity, learners can choose which information is safe
to type into an AI assistant.
Task: write 3 multiple-choice questions for a game room called "Data Vault".
Limits: each question under 40 words, 4 choices, feedback under 30 words,
8th-grade reading level, friendly tone.
Format: a table with columns Question | A | B | C | D | Correct | Feedback if
correct | Feedback if incorrect.
Use placeholders like [LEARNER] and [PROGRAM NAME] instead of real names.
Here is one example question: "A coworker asks you to paste a student's grade
report into an AI tool to summarize it. What should you do?"
Before you answer, ask me up to 3 questions if anything is unclear.
```

**A typical review loop (illustration):**
1. Copilot asked whether the feedback should name the policy. Answer: "Yes, as [POLICY LINK]."
2. The first draft had one question with two correct answers. Fix request: "Question 2 has two right answers. Rewrite choice C so only B is correct."
3. One feedback line said a made-up rule ("you may share data with your manager's approval"). The checker removed it because that isn't in the policy.
4. The final questions went into the game's content file (see the content update guide). Each change was noted in the change log.
