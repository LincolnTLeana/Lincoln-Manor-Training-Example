# Gamified training toolkit

A plain-language toolkit and an unbranded game template for building game-style training with approved AI tools, following our organization's AI Acceptable Use Policy.

## Documents
| # | Document | What it's for |
|---|---|---|
| 0 | [Policy map](docs/00-policy-map.md) | Every rule, tied to the AI policy section that requires it |
| 1 | [AI rules for course builders](docs/01-ai-rules-for-course-builders.md) | One page: what may and may never go into an AI tool |
| 2 | [Prompt-planning template](docs/02-prompt-planning-template.md) | 10 questions to answer before prompting, with a worked example |
| 3 | [Prompt library](docs/03-prompt-library.md) | Copy-and-fill prompts for every step of a course |
| 4 | [Case study](docs/04-case-study-build-walkthrough.md) | Idea to rollout, including how the game was built |
| 5 | [Content update guide](docs/05-content-update-guide.md) | Change text, questions, rooms, bonus rooms, easter eggs, scoring, contacts, credits, media |
| 6 | [Theme and design guide](docs/06-theme-and-design-guide.md) | Change names, colors, fonts, pictures and music; second sample theme |
| 7 | [SCORM and ADP reporting](docs/07-scorm-and-adp-reporting.md) | What data goes to ADP Learning and how to build the shared report |
| 8 | [Testing in ADP Learning](docs/08-testing-in-adp-learning.md) | Testing checklist, notes, version naming |
| 9 | [Rollout and communication kit](docs/09-rollout-and-communication-kit.md) | Emails, talking points, FAQ, support routing, launch and review |
| 10 | [Facilitator guide](docs/10-facilitator-guide.md) | Trainer material for the staff session (not part of the participant toolkit) |
| 11 | [Approvals, roles and rights](docs/11-approvals-roles-and-rights.md) | Workflow, disclosure, consent for images of people, licensing, ownership |
| 12 | [Packaging guide](docs/12-packaging-guide.md) | Build the SCORM ZIP with the packaging tool |
| A | [Microsoft Copilot](docs/appendix-microsoft-copilot.md) · [Claude for technical staff](docs/appendix-claude-for-technical-staff.md) | One appendix per approved tool |
| T | [Hand-off form](docs/templates/package-handoff-form.md) · [Change log](docs/templates/change-log-template.md) · [Test notes](docs/templates/test-notes-template.md) | Fill-in templates |

Word copies of every document are in `exports/word/`.

## Game template
[`template/`](template/README.md): a working, unbranded SCORM 2004 (4th Edition) course. Content, settings and themes are plain text files; two sample themes (manor and trades workshop). Tested with 55 automated checks against a mock LMS (`node tools/test/run-tests.js`).

## Tools
- `tools/packaging/`: packaging tool for Windows, run by the Training and Development reviewer (not yet run on a Windows PC)
- `tools/mock-lms/`, `tools/test/`: mock learning system and automated tests (for IT)
- `tools/check-strip-list.sh`: pre-commit check for words that must never be committed

See [CHANGELOG.md](CHANGELOG.md) for the history of changes.

## What may go into this repository (GitHub)
This repository is stored on GitHub, outside the internal network. **Never upload:**
- personal information (PII) about students, employees or anyone else;
- confidential information or anything sensitive to the organization (internal processes, data, reports, credentials, unreleased content);
- learner data or test records from ADP Learning.

Only unbranded template files, placeholder content and the reference documents listed below belong here. Organization-specific versions of a course are built and stored on the internal network.

## Reference documents
- [AI Acceptable Use Policy (PDF)](reference/AI_Acceptable_Use_Policy.pdf): the source for every rule in the [policy map](docs/00-policy-map.md). Added with the project owner's approval.

## Before every commit or push
Run `tools/check-strip-list.sh` (see the "For IT" note inside the script).
