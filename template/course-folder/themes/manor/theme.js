/* =====================================================================
   THEME: Mystery Manor  (edit in Notepad)
   Pictures and sounds live in this theme's "images" and "audio" folders.
   To swap a picture, replace the file with a new one of the SAME name, or
   change the file name below. Paths are relative to this theme folder.
   ===================================================================== */
window.COURSE_THEME = {
  name: "Mystery Manor",
  tagline: "Explore every room to uncover the secrets of safe AI use.",

  // Button and heading wording.
  labels: {
    start: "Enter the manor",
    resume: "Return to the manor",
    hub: "Grand Hall",
    toHub: "Back to the Grand Hall",
    next: "Next",
    back: "Back",
    finish: "See your results",
    retry: "Start over",
    review: "Review rooms"
  },

  // Colors (hex codes). Keep text readable: check contrast before you change these.
  colors: {
    background: "#1b1430",   // behind the pages
    surface: "#ffffff",      // page cards
    text: "#1f1a2e",         // main text
    muted: "#4f4766",        // small text
    accent: "#6b3fa0",       // buttons and highlights
    accentText: "#ffffff",   // text on buttons
    correct: "#1e6b45",
    incorrect: "#a3263a",
    focus: "#f0c869",        // keyboard focus outline
    onBackground: "#ffffff"  // toolbar buttons on the dark background
  },

  // Fonts: use fonts already on staff computers, or add font files to this
  // theme folder and list them under "files" (no web fonts).
  fonts: {
    heading: "Georgia, 'Times New Roman', serif",
    body: "'Segoe UI', Arial, sans-serif",
    files: []
  },

  images: {
    titleBackground: "images/title-bg.svg",
    hubBackground: "images/hub-bg.svg",
    roomBackground: "images/room-bg.svg",
    logo: "images/logo-placeholder.svg",
    logoAlt: "[ORGANIZATION] logo",
    badge: "images/badge.svg",
    badgeAlt: "Completion seal",
    egg: "images/egg.svg"
  },

  // Background music (optional). Set to null for no music.
  // startMuted: true means learners switch it on themselves.
  music: { file: "audio/ambient.wav", volume: 0.3, startMuted: true },

  // Room names and pictures. Each id must match a room id in course/content.js.
  rooms: {
    room1: { name: "The Library", icon: "images/room1.svg" },
    room2: { name: "The Data Vault", icon: "images/room2.svg" },
    room3: { name: "The Hall of Mirrors", icon: "images/room3.svg" },
    room4: { name: "The Lantern Room", icon: "images/room4.svg" },
    bonus1: { name: "The Secret Study", icon: "images/bonus1.svg" }
  },

  // Shown in the Credits window.
  credits: ["Theme artwork and music: placeholder files made for this template (free to reuse and replace)."]
};
