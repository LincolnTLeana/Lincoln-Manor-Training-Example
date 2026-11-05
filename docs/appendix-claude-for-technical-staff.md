# Appendix: Claude (technical staff and software developers only)

*AI policy Appendix A approves Claude for **technical staff and software developers**, in addition to the general-staff tools. General staff use Microsoft Copilot.*

**Open questions for the Chief Information Officer** ([policy map](00-policy-map.md)): who counts as "technical staff," and whether "Claude" includes its coding version (Claude Code) and the code-hosting service it works with.

## When technical staff use it
- Changing the template's code (`js/`, `css/`, `index.html`): new layouts, new question types, bug fixes.
- Writing or updating tests and the packaging tool.

## Rules (same as everyone, plus these)
1. **Work account, work device** (Section 5).
2. **No personal information, learner data or credentials,** ever. The template repository holds only unbranded templates and placeholders (rule R20).
3. **Internal documents go into Copilot only** (R21), not Claude.
4. **One change per request.** Run `node tools/test/run-tests.js` after every change; read the code diff yourself.
5. **No outside calls:** never add code that contacts a website or service. The packaging tool and the Content Security Policy enforce this.
6. **Keep a change log** and update the version.
7. **Security review** by [REVIEWER ROLE] of every code change before any package goes to ADP Learning.
8. Code is verified before deployment (Section 3: "develop or debug code, verify before deployment").
