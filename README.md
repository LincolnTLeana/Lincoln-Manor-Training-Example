# Gamified training toolkit

A plain-language toolkit and an unbranded game template for building game-style training with approved AI tools, following [ORGANIZATION]'s AI Acceptable Use Policy.

## Documents
| # | Document | Status |
|---|---|---|
| 0 | [Policy map](docs/00-policy-map.md): every rule, tied to the policy section that requires it | Draft |
| 1 | [AI rules for course builders](docs/01-ai-rules-for-course-builders.md) (one page) | Draft |
| 2 | [Prompt-planning template](docs/02-prompt-planning-template.md) with a worked example | Draft |
| 12 | [Packaging guide](docs/12-packaging-guide.md), [hand-off form](docs/templates/package-handoff-form.md) and the packaging tool in `tools/packaging/` | Draft (not yet tested on Windows) |
| 3–10 | Prompt library, case study, content update guide, theme guide, SCORM/ADP explainer, ADP testing, rollout kit, facilitator guide | Not started |
| 11 | Unbranded SCORM 2004 game template | Not started |

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
