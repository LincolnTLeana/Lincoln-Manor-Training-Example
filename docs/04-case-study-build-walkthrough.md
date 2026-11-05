# Case study: how a game-style course is built

*How the sample "Mystery Manor" course and this template came together, from idea to ADP Learning, told honestly so you can repeat it.*

## 1. Idea
**Problem:** staff needed to learn safe use of an AI assistant, and a slide deck would be skimmed.
**Idea:** a mystery house with four rooms. Each room teaches one point and asks three questions. A hidden room rewards a perfect score.
**Decisions made up front:**
- four required rooms × three questions = 12 scored questions;
- completion when all rooms are done (no pass/fail at first);
- under 100 words per screen;
- "Next" and "Back" buttons;
- results go only to ADP Learning.

## 2. Design
- **Outline** with an AI assistant (prompt library #1), using made-up examples. The subject expert then corrected it.
- **Room design** (#2): each room got 1–2 lesson screens, 3 questions and an optional practice task.
- **Theme** (#7): a mystery-manor theme, with neutral placeholder art made for the template.

## 3. Content
- **Questions** were drafted with the prompt in #4 and **rewritten by people**. Common fixes:
  - two right answers in one question;
  - feedback quoting a rule that doesn't exist;
  - wording too long for the screen.
- The **subject expert** checks every fact against the real source, and **compliance** checks the wording and the AI-assistance line, before anything is packaged.

## 4. Building the game ("vibe coding")
Technical staff built the game with an approved AI coding tool, working conversationally:
- **One request at a time:** "Add a Save & exit button," then "Make Save & exit keep progress," then "Show a 'progress saved' page."
- **Test after every change,** first in a browser, then in the mock learning system.
- **Keep a change log:** what changed, why and how it was tested.
- **A person reviews every output.** AI-written code can look finished and still:
  - break something that worked before;
  - report a test as passing without running it;
  - change something nobody asked for.
  The safeguard is the same every time: check the change, retest, and if it's wrong, undo it and ask again more specifically.
- **Lessons learned in the learning system:**
  - Sending a "suspend all" navigation request left courses stuck "In process" in ADP, so the course now just saves and closes properly.
  - The score is sent only after the last question, so reports never show a partial score.
  - A "Completed" status must never be changed back.
  - Early versions sent results to an outside spreadsheet. That was removed: everything now goes through SCORM to ADP Learning, and the course is blocked from contacting any outside service.

## 5. The template
The finished game was turned into this **template**: all words in `content.js`, all looks in a theme file, and settings in `settings.js`. Updates no longer need an AI tool or coding.

## 6. SCORM package
The **packaging tool** checks the folder (no outside calls, no data files, no leftover placeholders) and builds the ZIP with the version in its name.

## 7. ADP Learning
1. **Security review** of the ZIP by the Training and Development reviewer.
2. **HR L&D** uploads it to a private test folder.
3. **Testing** with the checklist: completion, score, resume, each answer recorded, links and media inside the player, keyboard and screen reader, phone.
4. **Fix → new version → re-upload,** until clean.

## 8. Rollout
- Announcement email, manager talking points and FAQ from the [rollout kit](09-rollout-and-communication-kit.md).
- Support routing: technical issues go to the **Helpdesk**; content questions go to the **Learning Center**.
- **Post-launch review** after 30 days: completion rate, most-missed questions (from the shared ADP report), and learner comments.

## What made it work
1. **Plan before prompting.**
2. **Never paste personal information.**
3. **One change at a time,** and test after each one.
4. **People check everything.**
5. **Keep a change log.**
6. **Test inside ADP, not just on your computer.**
