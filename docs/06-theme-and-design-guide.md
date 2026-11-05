# Theme and design guide

*Change the course's look without an AI tool: one theme file, plus swapping pictures and sounds in its folders.*

## How themes work
Each theme is a folder in `course-folder/themes/`:

```
themes/
  manor/              ← "Mystery Manor" (sample)
    theme.js          ← names, colors, fonts, wording, which pictures and music
    images/           ← backgrounds, room icons, badge, logo, easter egg picture
    audio/            ← background music (optional)
  workshop/           ← "Trades Workshop" (sample)
    theme.js
    images/
```

**To switch themes,** change one line in `course/settings.js`:
```js
theme: "workshop",
```
The same questions now appear in a workshop where the rooms are **CNC & Welding, Automotive & Diesel, Electrical & Electronics** and **HVAC & Plumbing**. This was tested: no content changes were needed.

## Make your own theme
1. Copy a theme folder (for example `workshop`) and rename the copy, for example `campus-trades`. Use lowercase letters and dashes only.
2. In `settings.js`, set `theme: "campus-trades",`.
3. Edit the new folder's `theme.js` in Notepad, as described below.
4. Swap pictures in its `images/` folder.
5. Preview, and click **Content check**.

## What you can change in `theme.js`
| Part | What it controls | Example |
|---|---|---|
| `name`, `tagline` | Theme name and the line on the start screen | `name: "Trades Workshop"` |
| `labels` | Button and heading wording | `start: "Clock in"`, `hub: "Shop Floor"`, `next: "Next"`, `back: "Back"` |
| `colors` | Every color | `accent: "#a8501a"` |
| `fonts` | Heading and body fonts | `heading: "Arial, sans-serif"` |
| `images` | Backgrounds, logo, badge, easter egg picture | `badge: "images/badge.svg"` |
| `music` | Background track, volume, starts muted | `music: null` for none |
| `rooms` | **Room names and icons** (one line per room id) | `room1: { name: "CNC & Welding", icon: "images/room1.svg" }` |
| `credits` | Artwork and music credits in the Credits window | |

**Keep "Next" and "Back"** as the navigation words unless there's a strong reason to change them. Learners expect them.

### Room names and icons
- Each line's id (`room1`, `bonus1` …) must match a room id in `course/content.js`.
- **Add a room in content → add a line here.** If you forget, the course uses the room's `title` from `content.js`, and Content check reminds you.
- An icon can be any square SVG or PNG in `images/`, about 64 × 64 pixels.

### Colors
Colors are hex codes like `#6b3fa0`. In Word, **Font Color → More Colors → Custom** shows the hex code for any color you pick.

| Name | Used for |
|---|---|
| `background` | Behind the pages (shows when there's no background picture) |
| `surface` | The white page cards |
| `text`, `muted` | Main and small text |
| `accent`, `accentText` | Buttons, and the text on them |
| `correct`, `incorrect` | Answer feedback |
| `focus` | The outline that shows keyboard users where they are |
| `onBackground` | Toolbar buttons that sit on the background |

**Contrast:** text must be easy to read. Check each pair (`text` on `surface`, `accentText` on `accent`, `onBackground` on `background`) with a contrast checker IT approves, or ask IT. The target is **4.5 to 1** or higher. Brand colors that are too light for text can be used for backgrounds and icons instead.

### Fonts
- Use fonts already on staff computers (Segoe UI, Arial, Calibri, Georgia, Cambria).
- To use a brand font file, put it in the theme folder (for example `fonts/brand.woff2`) and list it:
  `files: [ { family: "Brand Sans", file: "fonts/brand.woff2" } ]`, then `heading: "'Brand Sans', Arial, sans-serif"`. Check the font's license allows it to be built into e-learning.
- **No web fonts** (such as fonts loaded from a website). The course can't connect to outside services.

### Pictures
| Picture | File | Tips |
|---|---|---|
| Start screen background | `images/title-bg.svg` | Wide (1600 × 900), not busy; text sits on a white card |
| Hub and room backgrounds | `hub-bg.svg`, `room-bg.svg` | Subtle patterns work best |
| Logo | `logo-placeholder.svg` → your logo | Use the approved logo file from Marketing; set `logoAlt` |
| Badge or seal | `badge.svg` | Square, about 140 × 140 |
| Easter egg | `egg.svg` | Small, square |

**Swap a picture** by replacing the file with one of the **same name**, or change the file name in `theme.js`. PNG and JPG work too. Keep each picture under about 300 KB.

**A room can have its own background:** `room2: { name: "…", icon: "…", background: "images/vault.jpg" }`.

### Music
`music: { file: "audio/ambient.wav", volume: 0.3, startMuted: true }`
- Keep `startMuted: true`, so learners switch music on themselves with the **Music** button.
- Keep volume low (0.2–0.3).
- Use music you have the right to use ([Approvals, roles and rights](11-approvals-roles-and-rights.md)).
- `music: null` removes the Music button.

## Example: from Halloween manor to a trades theme
| Element | Mystery Manor | Trades Workshop |
|---|---|---|
| Start button | Enter the manor | Clock in |
| Hub name | Grand Hall | Shop Floor |
| Room 1 | The Library | CNC & Welding |
| Room 2 | The Data Vault | Automotive & Diesel |
| Room 3 | The Hall of Mirrors | Electrical & Electronics |
| Room 4 | The Lantern Room | HVAC & Plumbing |
| Bonus | The Secret Study | The Tool Crib |
| Colors | Purple and gold on midnight | Steel blue and safety orange |
| Music | Soft ambient loop, muted at start | None |

Everything in the table is in `theme.js` and the `images/` folder. No other files change.

## What still needs a designer, technical staff or an AI tool
| Change | Who |
|---|---|
| **New artwork** (illustrations, custom icons, photos) | A designer. AI-generated images only with an approved tool, licensed for this use, and never of real people. |
| **New layouts** (moving parts of the screen, new screen types) | Technical staff (changes to `css/style.css` or `js/engine.js`) |
| **New game mechanics** (timers, drag-and-drop, branching stories, new question types) | Technical staff, using approved tools, then a security review |
| **Brand approval** (logo, colors) | Marketing or brand owner |

Any change to files outside `course/`, `themes/` and `media/` needs the full test checklist again ([Testing in ADP Learning](08-testing-in-adp-learning.md)).
