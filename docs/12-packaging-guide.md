# Packaging guide: from course folder to SCORM ZIP

> **SCORM ZIP:** the single file ADP Learning needs to run your course. It holds every course file, plus a list of them (`imsmanifest.xml`).

## How it works
**Course builders don't need to package anything.** You send your course folder; the **Training and Development reviewer** runs the packaging tool, does the security review and arranges the upload.

| Step | Who |
|---|---|
| Write and check the content | **Subject expert** |
| Check rules, required wording and disclosures | **Compliance reviewer** |
| Edit the template, preview, run **Content check** | **Course builder** |
| **Send the course folder** with the hand-off form | **Course builder** |
| **Run the packaging tool** and do the security review | **Training and Development reviewer** |
| Upload to a private ADP Learning folder for testing | **HR Learning & Development** |

## For course builders: sending your course folder
1. **Raise the version number.** Open `course\settings.js` in Notepad and change `version` (see the version rule below).
2. **Preview** (double-click `index.html`), click through every screen, and click **Content check**: it should say **(0)**.
3. **Zip the folder for sending:** right-click your course folder → **Send to** → **Compressed (zipped) folder**.
4. **Send it** to the Training and Development reviewer through the usual internal channel (shared folder, Teams or SharePoint), with the [hand-off form](templates/package-handoff-form.md).
   Use internal channels only. Don't use personal email or outside file-sharing sites.

## For the reviewer: running the packaging tool
**Where it lives:** `\\training-share\Course Tools\Build Course Package\` (or anywhere on your own computer).

| File or folder | What it is |
|---|---|
| `Build Course Package.cmd` | The file you double-click |
| `Build-CoursePackage.ps1` | The checking and building steps |
| `Ready for review\` | Where the ZIP and check report appear |

1. **Unzip** the builder's folder (right-click → **Extract All**).
2. **Double-click `Build Course Package.cmd`** and choose the course folder (the one with `imsmanifest.xml` in it). *Shortcut:* drag the folder onto the `.cmd` file.
3. **Read the result.** It's also saved as a `…check-report.txt` in `Ready for review`.
   - **NOT BUILT:** send the **MUST FIX** list back to the builder.
   - **BUILT:** the ZIP is in `Ready for review`.
4. **Work through "PLEASE CHECK"**, for example made-up sample contacts (`example.org`, 555-0100) that were never replaced.
5. Finish the security review, then send the ZIP to HR L&D for upload to the private test folder.

### What the tool checks
- **Required files:** `imsmanifest.xml`, `index.html`, `course\settings.js`.
- **Course ID and version** are filled in correctly.
- **No document or data files** (Word, Excel, CSV, PowerPoint, logs). Those could hold internal or personal data.
- **No outside connections.** Code may not contact any outside website or service. Web addresses are allowed only as learner links in `course\content.js`, and the report lists them so they can be tested in ADP Learning.
- **Personal information:** numbers shaped like Social Security numbers stop the build. Email addresses are flagged for checking.
- **Leftover sample details,** such as text in [BRACKETS], are flagged.
- **Size** stays under the upload limit (100 MB unless changed in the script).
- **Manifest:** it's SCORM 2004 4th Edition, and every file is listed. The tool updates this list.
- **The ZIP is built correctly:** `imsmanifest.xml` at the top level, and forward slashes in all file paths.

**The builder's folder is never changed.** The tool works on a temporary copy.

### If Windows won't run the tool
Some computers are set to block scripts. **If the tool runs, nothing else is needed.**
- **If a message says scripts are disabled or the file isn't signed,** ask IT to allow it on your computer (for example, by signing the script).
- **Don't** switch off or bypass the security setting yourself. That would be getting around a security control, which AI policy Section 4 forbids.
- **In the meantime,** use the backup method below.

## Version rule
`COURSEID_vMAJOR.MINOR.PATCH_YYYY-MM-DD.zip`, for example `using-ai-safely_v1.2.0_2026-11-05.zip`

| Change | Raise | Example |
|---|---|---|
| Typo or wording fix | PATCH | 1.2.0 → 1.2.1 |
| New or changed questions, lessons, media, theme | MINOR | 1.2.1 → 1.3.0 |
| Rooms added or removed, scoring or passing score changed | MAJOR | 1.3.0 → 2.0.0 (talk to L&D: learners may need re-enrolling) |

The tool won't build the same version twice.

## Backup method (without the tool)
1. Open the course folder.
2. Press **Ctrl+A** to select everything **inside** it. Don't select the folder itself.
3. Right-click → **Send to** → **Compressed (zipped) folder**.
4. Rename the ZIP using the version rule.

The backup method runs **none** of the checks above, so review the files by hand. Note it on the hand-off form.

---

> **For IT**
> - The tool runs on built-in Windows PowerShell 5.1 and .NET. It makes no network calls, reads only the chosen folder, and writes only to `Ready for review` and the user's temp folder.
> - Whether it runs depends on the PowerShell execution policy set for the computer. If it's blocked, signing it with the organization's code-signing certificate is the usual fix.
> - **Not yet run on Windows.** It was written for Windows PowerShell 5.1; run it once on a staff PC before relying on it.
