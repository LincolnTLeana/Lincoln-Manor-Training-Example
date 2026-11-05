/* =====================================================================
   COURSE CONTENT  (edit in Notepad; keep the quotes, commas and brackets)
   - Text goes between "double quotes". To use a quote mark inside text, type \"
   - Every room, question and choice needs its own unique id.
   - Room NAMES and pictures come from the theme file (themes/<name>/theme.js).
   - See the Content update guide for step-by-step instructions.
   ===================================================================== */
window.COURSE_CONTENT = {

  /* ---------- Start screen ---------- */
  intro: {
    heading: "Welcome",
    text: "Explore each room, learn the key points and answer three questions. Finish every room to complete the course.",
    tip: "Your progress is saved when you choose Save & exit."
  },

  /* ---------- Required rooms (count toward completion and score) ----------
     To ADD a room: copy one whole { ... } block, paste it after the last one,
     add a comma between blocks, and give it a new id (for example "room5").
     Then add the room's name and picture to the theme file.
     To REMOVE a room: delete its whole { ... } block (and the extra comma). */
  rooms: [
    {
      id: "room1",
      title: "What an AI assistant is",
      lessons: [
        {
          heading: "Meet your AI assistant",
          summary: "An AI assistant writes text in response to the requests you type, called prompts.",
          bullets: [
            "It predicts likely words; it doesn't know facts the way a person does.",
            "It can draft, summarize and brainstorm quickly.",
            "It can be confidently wrong, so a person checks everything."
          ],
          image: { file: "media/sample-diagram.svg", alt: "Diagram: you type a prompt, the assistant returns a draft, and a person reviews it." }
        },
        {
          heading: "Use the approved tool",
          summary: "Use only the AI tool your organization approves, on a work device, signed in with your work account.",
          bullets: [
            "Check for the Protected label before you paste anything.",
            "Other tools need approval first.",
            "Read the policy: see the link below."
          ],
          link: { text: "AI Acceptable Use Policy", url: "[POLICY LINK]" }
        }
      ],
      questions: [
        {
          id: "room1_q1",
          prompt: "What is a prompt?",
          choices: [
            { id: "a", text: "A reminder the assistant sends you" },
            { id: "b", text: "The request you type into the assistant" },
            { id: "c", text: "A setting that turns the assistant on" },
            { id: "d", text: "A report of what the assistant did" }
          ],
          correct: "b",
          feedbackCorrect: "Right. A prompt is the request you type.",
          feedbackIncorrect: "Not quite. A prompt is the request you type into the assistant."
        },
        {
          id: "room1_q2",
          prompt: "An AI assistant gives you a confident, polished answer. What should you do?",
          choices: [
            { id: "a", text: "Use it as is, because it sounds right" },
            { id: "b", text: "Check it before you use it" },
            { id: "c", text: "Ask a different AI tool to confirm it" },
            { id: "d", text: "Delete it" }
          ],
          correct: "b",
          feedbackCorrect: "Yes. Polished doesn't mean correct, so a person checks every output.",
          feedbackIncorrect: "Polished doesn't mean correct. A person checks every output before it's used."
        },
        {
          id: "room1_q3",
          prompt: "Before you paste anything, what should you see in the approved AI tool?",
          choices: [
            { id: "a", text: "The Protected label" },
            { id: "b", text: "A green background" },
            { id: "c", text: "Your manager's name" },
            { id: "d", text: "Nothing in particular" }
          ],
          correct: "a",
          feedbackCorrect: "Correct. The Protected label shows you're signed in with your work account.",
          feedbackIncorrect: "Look for the Protected label. It shows you're signed in with your work account."
        }
      ],
      practice: {
        prompt: "Write a one-sentence prompt asking an AI assistant to draft a welcome email for new staff. Use placeholders instead of real names.",
        modelAnswer: "Draft a friendly 100-word welcome email for new staff joining [TEAM], signed by [MANAGER], with placeholders for the start date and first-day location."
      }
    },

    {
      id: "room2",
      title: "What is safe to share",
      lessons: [
        {
          heading: "Personal information stays out",
          summary: "Never paste personal information into any AI tool.",
          bullets: [
            "Student records, grades and IDs",
            "Employee details and HR matters",
            "Learner results from the learning system"
          ]
        },
        {
          heading: "Swap details for placeholders",
          summary: "Replace names and numbers with placeholders, then put the real details back yourself, outside the AI tool.",
          bullets: [
            "Names become [LEARNER] or [MANAGER].",
            "IDs and contact details become [ID] or [EMAIL].",
            "Real cases become made-up examples."
          ]
        }
      ],
      questions: [
        {
          id: "room2_q1",
          prompt: "A coworker asks you to paste a student's grade report into an AI tool to summarize it. What should you do?",
          choices: [
            { id: "a", text: "Paste it, since the tool is approved" },
            { id: "b", text: "Remove the student's name first, then paste the grades" },
            { id: "c", text: "Don't paste it: student records never go into an AI tool" },
            { id: "d", text: "Paste it in a private browser window" }
          ],
          correct: "c",
          feedbackCorrect: "Right. Student records never go into any AI tool.",
          feedbackIncorrect: "Student records never go into any AI tool, even with the name removed."
        },
        {
          id: "room2_q2",
          prompt: "Which of these is safe to type into the approved AI tool?",
          choices: [
            { id: "a", text: "An employee's home address" },
            { id: "b", text: "A made-up scenario using [LEARNER]" },
            { id: "c", text: "A password you keep forgetting" },
            { id: "d", text: "A list of learners who didn't finish a course" }
          ],
          correct: "b",
          feedbackCorrect: "Yes. Made-up scenarios with placeholders are safe.",
          feedbackIncorrect: "Only the made-up scenario is safe. The others are personal or secret information."
        },
        {
          id: "room2_q3",
          prompt: "Copilot drafted your message using [LEARNER]. When do you add the real name?",
          choices: [
            { id: "a", text: "In your next prompt, so Copilot can finish it" },
            { id: "b", text: "Yourself, after you copy the draft out of the AI tool" },
            { id: "c", text: "Never: send it with the placeholder" },
            { id: "d", text: "Ask the learner to fill it in" }
          ],
          correct: "b",
          feedbackCorrect: "Correct. Real details go back in outside the AI tool.",
          feedbackIncorrect: "Add real details yourself, after the draft is out of the AI tool."
        }
      ]
    },

    {
      id: "room3",
      title: "Checking the output",
      lessons: [
        {
          heading: "Read every word",
          summary: "AI tools can invent facts, rules and links that sound real.",
          bullets: [
            "Check facts against a trusted source.",
            "Delete anything you can't confirm.",
            "Can't verify it? Your manager approves it first."
          ]
        },
        {
          heading: "One fix at a time",
          summary: "Ask for one specific change per request, then check the result.",
          bullets: [
            "Good: \"Shorten bullet 2 to under 12 words.\"",
            "Too vague: \"Make it better.\"",
            "Note each change in your change log."
          ]
        }
      ],
      questions: [
        {
          id: "room3_q1",
          prompt: "The AI tool's draft quotes a rule you have never heard of. What do you do?",
          choices: [
            { id: "a", text: "Keep it, because the AI tool must know" },
            { id: "b", text: "Check the real policy; remove the rule if you can't confirm it" },
            { id: "c", text: "Reword it so it sounds less certain" },
            { id: "d", text: "Ask the AI tool if it's sure" }
          ],
          correct: "b",
          feedbackCorrect: "Right. Confirm it against the real source, or remove it.",
          feedbackIncorrect: "AI tools can invent rules. Check the real source, and remove it if you can't confirm it."
        },
        {
          id: "room3_q2",
          prompt: "Which request is most likely to get a useful fix?",
          choices: [
            { id: "a", text: "Make this better." },
            { id: "b", text: "Fix everything that's wrong." },
            { id: "c", text: "Rewrite question 2 so only choice B is correct." },
            { id: "d", text: "Try again." }
          ],
          correct: "c",
          feedbackCorrect: "Yes. One specific change is easiest to check.",
          feedbackIncorrect: "Ask for one specific change at a time, like option C."
        },
        {
          id: "room3_q3",
          prompt: "You can't confirm an AI-drafted fact is right. What happens before it's used?",
          choices: [
            { id: "a", text: "Your manager reviews and approves it" },
            { id: "b", text: "Nothing, if the deadline is close" },
            { id: "c", text: "A second AI tool checks it" },
            { id: "d", text: "You add a question mark" }
          ],
          correct: "a",
          feedbackCorrect: "Correct. Your manager reviews it before it's used.",
          feedbackIncorrect: "If you can't verify it, your manager reviews and approves it first."
        }
      ]
    },

    {
      id: "room4",
      title: "Being open about AI",
      lessons: [
        {
          heading: "Say when AI helped",
          summary: "Published training says when AI tools helped create it.",
          bullets: [
            "Add a short line, such as \"Created with help from AI tools and reviewed by [TEAM].\"",
            "Not needed for spell-checks or brainstorming.",
            "AI never decides anything about a person."
          ]
        }
      ],
      questions: [
        {
          id: "room4_q1",
          prompt: "You used an AI tool to draft a course that will be published. What do you add?",
          choices: [
            { id: "a", text: "Nothing" },
            { id: "b", text: "A line saying AI tools helped and people reviewed it" },
            { id: "c", text: "The full chat history" },
            { id: "d", text: "The AI tool's logo" }
          ],
          correct: "b",
          feedbackCorrect: "Right. A short AI-assistance line is enough.",
          feedbackIncorrect: "Add a short line saying AI tools helped and people reviewed it."
        },
        {
          id: "room4_q2",
          prompt: "Which use needs NO disclosure?",
          choices: [
            { id: "a", text: "Spell-checking your own email" },
            { id: "b", text: "A published course drafted with AI help" },
            { id: "c", text: "A report used to make a decision" },
            { id: "d", text: "A graded assessment drafted with AI" }
          ],
          correct: "a",
          feedbackCorrect: "Correct. Routine spell-checks don't need disclosure.",
          feedbackIncorrect: "Routine tasks like spell-checking don't need disclosure; published or evaluated work does."
        },
        {
          id: "room4_q3",
          prompt: "May an AI tool decide which learners pass a course?",
          choices: [
            { id: "a", text: "Yes, it's faster" },
            { id: "b", text: "Yes, if the tool is approved" },
            { id: "c", text: "No. AI doesn't make decisions about people" },
            { id: "d", text: "Only on weekends" }
          ],
          correct: "c",
          feedbackCorrect: "Right. People make decisions about people.",
          feedbackIncorrect: "No. AI tools don't make decisions about learners or staff."
        }
      ]
    }
  ],

  /* ---------- Bonus rooms (never affect score or completion) ----------
     unlock can be:
       "perfectScore"      - opens when every required question is correct
       "allRoomsComplete"  - opens when every required room is finished
       "egg:<egg id>"      - opens when the learner finds that easter egg
       "always"            - always open
     To remove the bonus room, delete its { ... } block (leave: bonusRooms: [] ). */
  bonusRooms: [
    {
      id: "bonus1",
      title: "The secret room",
      unlock: "perfectScore",
      lessons: [
        {
          heading: "You found the secret room",
          summary: "A perfect score unlocks this room. It's just for fun and doesn't change your score.",
          bullets: ["Try one last challenge below."]
        }
      ],
      questions: [
        {
          id: "bonus1_q1",
          prompt: "Which three words sum up safe AI use?",
          choices: [
            { id: "a", text: "Fast, fancy, final" },
            { id: "b", text: "Approved, protected, reviewed" },
            { id: "c", text: "Copy, paste, send" },
            { id: "d", text: "Secret, silent, solo" }
          ],
          correct: "b",
          feedbackCorrect: "Perfect. Approved tool, protected data, reviewed output.",
          feedbackIncorrect: "The answer: approved tool, protected data, reviewed output."
        }
      ]
    }
  ],

  /* ---------- Easter eggs (small hidden surprises) ----------
     location: "hub" (main screen) or a room id such as "room2".
     label: read aloud by screen readers, so describe it.
     To remove all easter eggs: easterEggs: [] */
  easterEggs: [
    { id: "egg1", location: "hub", label: "A loose floorboard", message: "You found a hidden note: \"Check every output!\"" }
  ],

  /* ---------- Optional survey (not scored; answers go to ADP Learning) ----------
     Set show to false to skip it. Never ask for names, emails or personal details:
     ADP Learning already knows who the learner is. */
  survey: {
    show: true,
    heading: "Two quick questions",
    questions: [
      {
        id: "survey_familiarity",
        prompt: "How familiar were you with AI assistants before this course?",
        choices: [
          { id: "beginner", text: "Beginner" },
          { id: "intermediate", text: "Intermediate" },
          { id: "advanced", text: "Advanced" }
        ]
      },
      {
        id: "survey_interest",
        prompt: "Would you like more training on this topic?",
        choices: [
          { id: "yes", text: "Yes" },
          { id: "no", text: "No" }
        ]
      }
    ]
  },

  /* ---------- Finish screen ---------- */
  finish: {
    heading: "You did it!",
    completeText: "You've finished every room. Your completion has been recorded.",
    passText: "You passed.",
    failText: "You didn't reach the passing score yet. Choose Start over to try again; your completion is kept.",
    perfectText: "Perfect score! A secret room is now open."
  },

  /* ---------- Help (support contacts) ----------
     Add, remove or change rows. Use shared mailboxes or service desks, not a
     person's own email. */
  help: {
    heading: "Need help?",
    contacts: [
      { label: "Technical problems (course won't load, progress not saved)", detail: "[HELPDESK NAME] - [HELPDESK PHONE] - [HELPDESK EMAIL]" },
      { label: "Questions about the course content", detail: "[LEARNING CENTER NAME] - [LEARNING CENTER EMAIL]" }
    ],
    resources: [
      { text: "AI Acceptable Use Policy", url: "[POLICY LINK]" },
      { text: "Quick reference (PDF)", file: "media/sample-job-aid.pdf" }
    ]
  },

  /* ---------- Credits ---------- */
  credits: {
    heading: "Credits",
    lines: [
      "Designed by [DESIGNER NAME], [DESIGNER TEAM] ([DESIGNER EMAIL])",
      "Subject expert review: [SUBJECT EXPERT TEAM]",
      "Created with help from AI tools and reviewed by [TEAM].",
      "Version shown below the title."
    ]
  }
};
