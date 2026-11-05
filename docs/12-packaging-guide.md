# Packaging guide: turning your course folder into a SCORM ZIP

*For course builders. No AI tool and no coding needed.*

> **SCORM ZIP:** the single file ADP Learning needs to run your course. It holds every course file, plus a list of them (`imsmanifest.xml`).

## Who does what
| Step | Who |
|---|---|
| Write and check the content | **Subject expert** (you know the topic) |
| Check rules, required wording and disclosures | **Compliance reviewer** |
| Build the ZIP with the packaging tool | **Course builder** |
| Security review of every ZIP before upload | **[REVIEWER ROLE]** (Training and Development) |
| Upload to a private ADP Learning catalog folder for testing | **HR Learning & Development** |

## Where the tool lives
`[NETWORK SHARE PATH]\Build Course Package\`

| File or folder | What it is |
|---|---|
| `Build Course Package.cmd` | The file you double-click |
| `Build-CoursePackage.ps1` | The checking and building steps (don't edit) |
| `Ready for review\` | Where your ZIP and check report appear |

## Steps
1. **Raise the version number.** Open `course\settings.js` in Notepad and change `version`. *(See the version rule below.)*
2. **Preview your course.** Double-click `index.html` in your course folder and click through every screen.
3. **Run the tool.** Go to `[NETWORK SHARE PATH]\Build Course Package\` and double-click **Build Course Package.cmd**.
   - A window asks you to choose a folder. Choose your **course folder** (the one with `imsmanifest.xml` in it), then click **OK**.
   - *Shortcut:* drag your course folder onto **Build Course Package.cmd**.
4. **Read the result** in the black window. It's also saved as a `…check-report.txt` file in `Ready for review`.
   - **NOT BUILT:** fix everything under **MUST FIX**, then run the tool again.
   - **BUILT:** your ZIP is in `Ready for review`.
5. **Work through "PLEASE CHECK"** (for example, placeholders you forgot to fill in, or email addresses that should be shared mailboxes).
6. **Send for review.** Email **[REVIEWER ROLE]** the ZIP's name and attach the check report and the [hand-off form](templates/package-handoff-form.md). Don't email the ZIP itself; it stays on the network share.

## What the tool checks
- **Required files:** `imsmanifest.xml`, `index.html`, `course\settings.js`.
- **Course ID and version** are filled in correctly.
- **No document or data files** (Word, Excel, CSV, PowerPoint, logs). Those could hold internal or personal data.
- **No outside connections.** Code may not contact any outside website or service. Web addresses are allowed only as learner links in `course\content.js`, and the report lists them so you can test each one in ADP Learning.
- **Personal information:** numbers shaped like Social Security numbers stop the build. Email addresses are flagged for checking.
- **Size** stays under the ADP Learning limit.
- **Manifest:** it's SCORM 2004 4th Edition, and every file is listed. The tool updates this list for you.
- **The ZIP is built correctly:** `imsmanifest.xml` at the top level, and forward slashes in all file paths.

**Your course folder is never changed.** The tool works on a temporary copy.

## Version rule
`COURSEID_vMAJOR.MINOR.PATCH_YYYY-MM-DD.zip`, for example `safety-basics_v1.2.0_2026-11-05.zip`

| Change | Raise | Example |
|---|---|---|
| Typo or wording fix | PATCH | 1.2.0 → 1.2.1 |
| New or changed questions, lessons, media, theme | MINOR | 1.2.1 → 1.3.0 |
| Rooms added or removed, scoring or passing score changed | MAJOR | 1.3.0 → 2.0.0 (talk to L&D: learners may need re-enrolling) |

The tool won't build the same version twice.

## Without the tool (backup method)
1. Open your course folder.
2. Press **Ctrl+A** to select everything **inside** it. Don't select the folder itself.
3. Right-click → **Send to** → **Compressed (zipped) folder**.
4. Rename the ZIP using the version rule.

The backup method runs **none** of the checks above. Say so on the hand-off form.

---

> **For IT: script security**
> - **Why it might be blocked.** Windows controls which PowerShell scripts may run through the *execution policy*, which is often set by Group Policy. Scripts from a network share are usually treated as "remote," so they must be **digitally signed** by a trusted publisher. AppLocker, Windows Defender Application Control (WDAC) or antivirus may also block unsigned scripts.
> - **What we ask.** Sign `Build-CoursePackage.ps1` with the organization's code-signing certificate, and publish it to a share where builders can **read and run** it but **not edit** it. Re-sign after any change.
> - **What we don't do.** Don't tell staff to run it with `-ExecutionPolicy Bypass` or to change their execution policy. That would be getting around a security control, which AI AUP Section 4 forbids.
> - **What the script does.** It runs on built-in Windows PowerShell 5.1 and .NET. It makes no network calls, reads only the chosen folder, and writes only to `Ready for review` and the user's temp folder.
> - **Not yet tested on Windows.** It was written for Windows PowerShell 5.1 but hasn't been run on a Windows PC yet. Test it on a staff PC before rollout.
