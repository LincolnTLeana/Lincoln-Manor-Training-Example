/* =====================================================================
   COURSE SETTINGS  (edit in Notepad; keep the quotes and commas)
   Lines starting with // are notes and are ignored.
   ===================================================================== */
window.COURSE_SETTINGS = {
  // ID used by ADP Learning and in the ZIP name. Letters, numbers, - and _ only.
  // Don't change it after launch: ADP treats a new ID as a different course.
  courseId: "sample-course-001",

  // Raise this every time you re-package (see the packaging guide's version rule).
  version: "1.0.0",

  // Title shown on the start screen and the browser tab.
  courseTitle: "Using AI Safely at Work",

  // Which look to use: the name of a folder inside "themes".
  // Included: "manor" (mystery house) and "workshop" (trades).
  theme: "manor",

  scoring: {
    // Passing score as a percent (for example 80), or null for no pass/fail.
    // With null, the course only reports completion and score.
    passingPercent: null,

    // If a learner retries, keep their best score ("best") or the latest ("latest").
    keepScore: "best"
  },

  tracking: {
    // Send each answer to ADP Learning (SCORM "interactions"). Needed for
    // question-level reports.
    recordAnswers: true,
    // Also send answers to bonus-room questions (they never affect score).
    recordBonusAnswers: true,
    // Send each room as a SCORM "objective" (shows room progress in some reports).
    recordRoomsAsObjectives: true
  },

  limits: {
    // Preview mode warns when a lesson screen is longer than this.
    maxWordsPerScreen: 100,
    maxBulletsPerScreen: 3
  },

  features: {
    // Show a "Credits" button (designer credit, AI disclosure).
    showCredits: true,
    // Show a "Help" button (support contacts from content.js).
    showHelp: true,
    // Greet the learner by first name from ADP Learning (stays on screen only).
    greetByName: false
  }
};
