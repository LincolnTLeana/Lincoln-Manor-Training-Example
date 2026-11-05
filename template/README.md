# Game template: start here

`course-folder/` is a complete, working SCORM 2004 (4th Edition) course with placeholder branding and sample content. Everything you normally change is a plain text file you can open in **Notepad**.

| To change… | Open this file | Guide |
|---|---|---|
| Lesson text, questions, answers, feedback, practice, bonus rooms, easter eggs, survey, help contacts, credits | `course-folder/course/content.js` | [Content update guide](../docs/05-content-update-guide.md) |
| Course ID, version, title, theme, passing score, what gets reported | `course-folder/course/settings.js` | [Content update guide](../docs/05-content-update-guide.md) |
| Room names, colors, fonts, pictures, music, button wording | `course-folder/themes/<theme>/theme.js` and that theme's `images/` and `audio/` folders | [Theme and design guide](../docs/06-theme-and-design-guide.md) |
| Pictures, PDFs, videos used in lessons | put files in `course-folder/media/` | [Content update guide](../docs/05-content-update-guide.md) |

**Preview:** double-click `course-folder/index.html`. A yellow "Preview mode" bar appears; click **Content check** to find mistakes (wrong answer keys, too many words, missing alt text).

**Package:** use the packaging tool ([Packaging guide](../docs/12-packaging-guide.md)).

**Don't edit** `js/`, `css/`, `index.html` or `exit.html` unless you're technical staff making an approved change.

> **For IT**
> - `js/scorm-api.js` is the only file that talks to the learning system. It uses the SCORM 2004 API the player provides and nothing else. `index.html` has a Content Security Policy that blocks any outside connection.
> - Tests: `node tools/test/run-tests.js` runs 52 checks against a mock LMS (`tools/mock-lms/`) with every outside request blocked. Requires Node.js and Playwright.
> - Manual testing: `node tools/mock-lms/serve.js`, then open `http://127.0.0.1:8123/tools/mock-lms/mock-lms.html` (add `?passing=0.8` to simulate a passing score set in the LMS).
