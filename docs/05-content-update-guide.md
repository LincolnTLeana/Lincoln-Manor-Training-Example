# Content update guide (no AI tool needed)

*Change words, questions, rooms, scoring, contacts and media by editing plain text files. You need Notepad and a web browser.*

## Before you start
1. **Copy the whole `course-folder`** and give it your course's name. Work in the copy, saved on the **internal network**. Never put organization content in the shared template repository.
2. Open files with **Notepad**: right-click the file → **Open with** → **Notepad**.
3. After each change: **save**, then double-click `index.html` to preview. Click **Content check** in the yellow bar.
4. **Note the change** in your change log ([template](templates/change-log-template.md)).

### Five rules for editing these files
| Rule | Right | Wrong |
|---|---|---|
| Text stays inside "double quotes" | `heading: "Welcome",` | `heading: Welcome,` |
| A quote mark inside text gets a backslash | `"Click \"Next\""` | `"Click "Next""` |
| Items in a list are separated by commas | `"A", "B", "C"` | `"A" "B" "C"` |
| Every `{` has a matching `}` and every `[` a matching `]` | | |
| Lines starting with `//` are notes | `// this is ignored` | |

**If the course shows only "Loading…" after a change,** you've probably broken one of these rules. Undo your last change, or compare it with the sample.

---

## 1. Lesson text
**File:** `course/content.js`, inside a room's `lessons: [ … ]`.

```js
{
  heading: "Use the approved tool",
  summary: "One sentence that sums up the screen.",
  bullets: [
    "Up to three short points.",
    "Each in its own quotes.",
    "Commas between them."
  ]
}
```
- **Standard:** under **100 words** per screen, one summary sentence, up to **3 bullets**. The Content check warns you when a screen is too long.
- **To add a screen:** copy a whole `{ … }` block, paste it after another one, and put a comma between the blocks.
- **To remove a screen:** delete its whole `{ … }` block and the extra comma.

## 2. Questions, answers and feedback
```js
{
  id: "room2_q1",                       // unique; never reuse an id
  prompt: "Which of these is safe to type into the approved AI tool?",
  choices: [
    { id: "a", text: "An employee's home address" },
    { id: "b", text: "A made-up scenario using [LEARNER]" },
    { id: "c", text: "A password" },
    { id: "d", text: "A list of learners who didn't finish" }
  ],
  correct: "b",                         // the id of the right choice
  feedbackCorrect: "Yes. Made-up scenarios with placeholders are safe.",
  feedbackIncorrect: "Only the made-up scenario is safe."
}
```
- **Change the right answer:** change `correct:` to another choice's id.
- **Use more or fewer choices:** add or delete `{ id: …, text: … }` lines. Two choices make a true/false question. Choice ids are short: `a`, `b`, `c` …
- **Add a question to a room:** copy a question block, paste it, and give it a **new id** (for example `room2_q4`).
- **Remove a question:** delete its block.
- **More or fewer questions overall:** the score is always out of the total number of questions in the required rooms. Reports in ADP show the new total automatically.
- **⚠ After launch,** don't change an existing question's `id` or meaning. Its answers in ADP reports are grouped by id. For a different question, use a new id.

## 3. Practice activities
At the end of a room's block (optional):
```js
practice: {
  prompt: "Write a one-sentence prompt asking for a welcome email. Use placeholders.",
  modelAnswer: "Draft a friendly 100-word welcome email for new staff joining [TEAM]…"
}
```
What learners type stays on the screen. **It isn't saved or sent to ADP Learning.** To remove practice from a room, delete the whole `practice: { … }` part (and the comma before it).

## 4. Adding and removing rooms
**Required rooms** (`rooms: [ … ]`) count toward completion and score.

**To add a room:**
1. Copy a whole room block, from its `{` to its matching `},`.
2. Paste it after the last room.
3. Change `id` (for example `"room5"`) and every question id inside it (`room5_q1` …).
4. Write its lessons and questions.
5. In the **theme file**, add a name and icon: `room5: { name: "The Workshop", icon: "images/room5.svg" },`
6. Preview. The hub now says "0 of 5 rooms complete," and the score is out of the new total.

**To remove a room:** delete its whole block and its line in the theme file.

**Order:** rooms appear in the order they're listed.

**⚠ After launch,** adding or removing rooms is a **major** version change. Talk to HR L&D about learners who are part-way through.

## 5. Bonus rooms and easter eggs
**Bonus rooms** (`bonusRooms: [ … ]`) never affect score or completion. Their answers are still reported, with weight 0.

`unlock:` decides when one appears:

| `unlock:` | Opens when… |
|---|---|
| `"perfectScore"` | every required question is answered correctly |
| `"allRoomsComplete"` | every required room is finished |
| `"egg:egg1"` | the learner finds easter egg `egg1` |
| `"always"` | it's always open |

- **Remove all bonus rooms:** `bonusRooms: [],`
- **Add one:** copy a bonus block and give it a new id and question ids. Add its name and icon to the theme file.

**Easter eggs** are small hidden buttons with a surprise message:
```js
easterEggs: [
  { id: "egg1", location: "hub", label: "A loose floorboard", message: "You found a hidden note!" }
]
```
- `location:` is `"hub"` or a room id (`"room3"`).
- `label` is read aloud by screen readers, so describe the object.
- **Remove them all:** `easterEggs: [],`

## 6. Scoring and passing score
**File:** `course/settings.js`

```js
scoring: {
  passingPercent: null,   // or a number, e.g. 80
  keepScore: "best"       // or "latest"
}
```

| Setting | What happens |
|---|---|
| `passingPercent: null` (default) | **No pass/fail.** The course reports completion (all required rooms done) and the score. |
| `passingPercent: 80` | After the last question, the course also reports **passed** (80% or more) or **failed**. Learners who fail can choose **Start over**. |
| `keepScore: "best"` | After a retry, ADP keeps the learner's best score. |
| `keepScore: "latest"` | ADP gets the most recent score. |

How scoring works:
- The **score is sent only after the last required question** is answered.
- It's sent as raw (for example 11), maximum (12) and scaled (0.916). The scaled score is truncated to 3 decimals, never rounded up.
- **Completion** happens when every required room is finished, whatever the score.
- **Never reversed:** a "completed" or "passed" status is never changed back to incomplete or failed.
- **If ADP Learning has its own passing score** set for the course, the course uses ADP's number instead of `passingPercent`. Decide with HR L&D which one is the source of truth, and set only that one.
- **⚠** Changing the passing score after launch is a **major** version change.

## 7. What is reported to ADP Learning
**File:** `course/settings.js` → `tracking`

| Setting | `true` means |
|---|---|
| `recordAnswers` | Every answer is sent (needed for question-level reports) |
| `recordBonusAnswers` | Bonus answers are sent too (weight 0, no effect on score) |
| `recordRoomsAsObjectives` | Each room is reported as complete |

See the [SCORM and ADP reporting guide](07-scorm-and-adp-reporting.md) for the full list of data.

## 8. Optional survey
`survey:` asks unscored questions at the end, such as "How familiar were you with this topic?". The answers go to ADP Learning as answers with no right or wrong. **Never ask for names, emails or personal details:** ADP already knows who the learner is. To turn it off: `show: false`.

## 9. Room names
Room names come from the **theme file**, so a new theme can rename every room at once. See the [Theme and design guide](06-theme-and-design-guide.md). The `title:` in `content.js` is a fallback, used only when the theme has no name for that room.

## 10. Help contacts, designer credit and links
**Help window:**
```js
help: {
  heading: "Need help?",
  contacts: [
    { label: "Technical problems", detail: "[HELPDESK NAME] - [HELPDESK PHONE] - [HELPDESK EMAIL]" },
    { label: "Questions about the content", detail: "[LEARNING CENTER NAME] - [LEARNING CENTER EMAIL]" }
  ],
  resources: [
    { text: "AI Acceptable Use Policy", url: "[POLICY LINK]" },
    { text: "Quick reference (PDF)", file: "media/sample-job-aid.pdf" }
  ]
}
```

**Credits window:**
```js
credits: {
  heading: "Credits",
  lines: [
    "Designed by [DESIGNER NAME], [DESIGNER TEAM] ([DESIGNER EMAIL])",
    "Created with help from AI tools and reviewed by [TEAM]."
  ]
}
```
- **Fill in every `[PLACEHOLDER]`.** The packaging tool lists any left over.
- **Use shared mailboxes and service desks,** not a person's own email or phone, so the course doesn't go out of date when people change roles. Naming the designer in the credits is fine if they agree.
- **Keep the AI-assistance line** if AI helped create the content (AI policy, Section 7).
- **Routing:** technical problems go to the **Helpdesk**; curriculum questions go to the **Learning Center**.
- **Turn the buttons off** in `settings.js` → `features`: `showHelp: false` or `showCredits: false`.

## 11. Media and resources
Put files in `course-folder/media/` (or a subfolder), then point a lesson at them. The packaging tool adds every file to the package list automatically.

### Images
```js
image: { file: "media/forklift-check.png", alt: "Worker checking forklift tires before a shift" }
```
- **Alt text:** describe what matters in the picture in one sentence. For pure decoration use `alt: ""`.
- **Size:** keep images under about **300 KB**, about 1600 pixels wide at most. In Paint: **Resize** → 1600 px wide → **Save as** JPEG (photos) or PNG (diagrams).
- **Real people:** you need signed consent ([Approvals, roles and rights](11-approvals-roles-and-rights.md)). No AI-made images of real people.
- **Contrast:** don't put important text inside a picture. If you must, make it large and high-contrast, and repeat it in the alt text.

### Links to websites, policies, SharePoint or intranet pages
```js
link: { text: "Safety policy", url: "https://[INTRANET ADDRESS]/safety-policy" }
```
- Links open in a **new window** and say so to screen-reader users.
- **⚠ Sign-in catch:** pages that need sign-in (SharePoint, intranet, policies) may not open inside the ADP Learning player, or may ask learners to sign in again. **Test every link in ADP Learning**; the packaging report lists them for you.
- Link text says where it goes ("Safety policy"), never "click here."
- The course never *loads* anything from a website. It only offers links that learners choose to open.

### PDFs and job aids
| Option | How | Good for | Watch out |
|---|---|---|---|
| **Packaged** (in the ZIP) | `file: { text: "Job aid (PDF)", file: "media/job-aid.pdf" }` | Always available, no sign-in | Must re-package to update it |
| **Linked** | `link: { text: "Job aid", url: "https://[INTRANET]/job-aid.pdf" }` | One copy to update | Sign-in catch (above) |

**Accessibility:** make PDFs from Word with headings and **File → Save As → PDF**, and run Word's **Review → Check Accessibility** first.

### Videos
| Option | Good for | Watch out |
|---|---|---|
| **MP4 in the package** `video: { file: "media/intro.mp4", captions: "media/intro.vtt", transcript: "…" }` | Short clips (under ~2 minutes) | Package size limit; keep each video under ~20 MB |
| **Link to the video** (Stream, YouTube or intranet) `link: { text: "Watch: Lockout/tagout (4 min, captions)", url: "…" }` | Longer videos | Opens outside the course; sign-in catch |

- **Captions are required:** `.vtt` caption file for packaged video, or captions turned on at the source for linked video.
- **Transcript:** add `transcript:` text, which appears under a "Transcript" button.
- **Embedding** (playing a YouTube or Stream video *inside* the course screen) isn't supported. It would make the course connect to an outside service, which the security rules don't allow.

### Audio and music
- **Lesson audio:** `audio: { file: "media/tip.mp3", transcript: "…" }`. Always include a transcript.
- **Background music** belongs to the theme ([Theme and design guide](06-theme-and-design-guide.md)). It starts **muted** and learners switch it on, so it never surprises anyone. Keep it quiet (`volume: 0.3` or lower).

### Microsoft Forms or survey links
Prefer the **built-in survey** (section 8): its answers go to ADP Learning with the rest of the course data. If you must use a Form, add it as a `link`. Turn off "Record name" and collect no personal information. Note that the answers live in Forms, not ADP.

### Certificates and badges
- The **badge** on the finish screen comes from the theme (`images/badge.svg`).
- **Official certificates** come from ADP Learning on completion. Ask HR L&D. Don't build your own downloadable certificate.

### QR codes for mobile
To let learners open a job aid on their phones, put a QR code **image** in a lesson (`image:` with alt text that also gives the web address in words). Make QR codes with the tool IT approves. Point them only at pages anyone allowed can open, and test them on a phone.

## 12. Course ID, version and title
In `course/settings.js`:
- **`courseId`:** set once, before first upload. Don't change it after launch.
- **`version`:** raise it every time you package ([version rule](12-packaging-guide.md#version-rule)).
- **`courseTitle`:** also change the two `<title>` lines in `imsmanifest.xml`.
