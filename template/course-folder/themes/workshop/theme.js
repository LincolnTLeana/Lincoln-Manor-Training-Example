/* =====================================================================
   THEME: Trades Workshop  (edit in Notepad)
   A second theme that shows a re-theme is just a file swap: same content,
   different names, colors, pictures and wording.
   ===================================================================== */
window.COURSE_THEME = {
  name: "Trades Workshop",
  tagline: "Work through every shop to earn your safety seal.",

  labels: {
    start: "Clock in",
    resume: "Back to work",
    hub: "Shop Floor",
    toHub: "Back to the Shop Floor",
    next: "Next",
    back: "Back",
    finish: "See your results",
    retry: "Start over",
    review: "Review shops"
  },

  colors: {
    background: "#23313a",
    surface: "#ffffff",
    text: "#1f2a30",
    muted: "#4a5a63",
    accent: "#a8501a",
    accentText: "#ffffff",
    correct: "#1e6b45",
    incorrect: "#a3263a",
    focus: "#f2d492",
    onBackground: "#ffffff"
  },

  fonts: {
    heading: "'Arial Narrow', Arial, sans-serif",
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
    badgeAlt: "Safety seal",
    egg: "images/egg.svg"
  },

  // No music in this theme.
  music: null,

  // Sample program groupings: rename to match your programs.
  rooms: {
    room1: { name: "CNC & Welding", icon: "images/room1.svg" },
    room2: { name: "Automotive & Diesel", icon: "images/room2.svg" },
    room3: { name: "Electrical & Electronics", icon: "images/room3.svg" },
    room4: { name: "HVAC & Plumbing", icon: "images/room4.svg" },
    bonus1: { name: "The Tool Crib", icon: "images/bonus1.svg" }
  },

  credits: ["Theme artwork: placeholder files made for this template (free to reuse and replace)."]
};
