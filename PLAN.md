# Portfolio — Plan

A one-page portfolio for **Lakshay Kumar · Frontend Engineer**, told as a life story. You scroll,
and a red spark travels along a glowing path across a dark 3D board. The camera glides and zooms
into each stop of the story in order, like getmaxim.ai/edge. The story ends at the kickboxer.

## The story (6 stops)

| # | Stop | What's on the board | Links |
|---|------|---------------------|-------|
| 01 | College (2020–24) | 1 node: B.Tech CSE, Chandigarh University | — |
| 02 | SenseHQ intern (Oct 2024 – Mar 2025) | 2 nodes: i18n (20+ customers) · AST codemod | — |
| 03 | SenseHQ SDE-1 (Sept 2025 – now) | 3 nodes: Recruiter Chrome extension (15+ customers) · Chart wrapper · Legacy → new UI migration (35+ customers) | — |
| 04 | Hackathons | 3 nodes: Agentic Career Site Builder · AI Recruiter · Aegis | — |
| 05 | Side projects | 2 detailed 3D models: **React-Learn** · **FocusGuard** | React-Learn: live + GitHub · FocusGuard: GitHub |
| 06 | Finale | Kickboxer render on its stand, "Discipline builds freedom." | Email · LinkedIn · GitHub · Resume |

**Nodes:** a dark block with glowing red edges, an icon on top and the project name in 3D. A
node only explains the project. The text is on the card, not in the 3D.

**React-Learn model:** a floating monitor showing a real screenshot of the app, and a 3D React
component tree beside it. As you scroll, its parts light up in order: click → render → compare →
update screen.

**FocusGuard model:** a 3D browser window under a red shield. Plain site tiles with text labels
(no real brand logos) fly at it and bounce off, and the extension popup floats beside it with a
countdown running.

## How it works

- **Opening screen:** name, title, one line about you, `[ SCROLL TO FOLLOW MY STORY ]` and a
  "Skip to projects" link.
- **Scroll:** the 3D view stays pinned on screen. Scrolling moves the spark along the path, and
  the camera follows from a fixed angle above. There is no free-flying camera.
- **Cards:** each stop gets a numbered card (`01`…`06`) with year, title, 2 lines of text, tech
  tags and links. It sits on the left on desktop and is a sheet at the bottom on phones.
- **Progress bar:** a thin bar on the right edge shows all 6 stops. Clicking a stop jumps to it.
- **Finale:** the spark lands on the stand and the kickboxer card lights up. It tilts and shifts
  in depth as the mouse moves. It's built so a 3D model of the figure can replace it later.

## Look

Dark "night gym" style: near-black background, red neon for the path and highlights, and the
crown symbol used throughout. Taken from the kickboxer render so the ending fits the rest of the
site.

## Tech

Vite · React 19 · TypeScript · React Three Fiber + drei · Lenis (smooth scroll) · GSAP
ScrollTrigger · Tailwind v4 · Vercel (hosting + Web Analytics).

- **Phones:** the same scene with lighter effects and a lower rendering resolution.
- **Reduce motion:** anyone with "reduce motion" turned on gets a simple scrolling page of
  sections with still images.
- **Link preview:** when the link is shared, the preview card shows the kickboxer render with name
  and title.

## Content sources

- Resume: `~/Downloads/Lakshay_Resume.pdf`. It's offered for download as-is, phone number included. The site's contact
  section itself does not show the phone number.
- React-Learn: `~/React-Learn` (github.com/lakshaykundu/react-learn)
- FocusGuard: `~/my-ai-app/Focus-mode` (github.com/lakshaykundu/Focus-mode),
  `docs/screenshots/`
- Kickboxer: `~/Downloads/KICKBOXER Crown_ Collectible Fighter in the Ring.png` (1122×1402)

Claude writes all card text from these. Lakshay edits it afterwards.

## Build order (you check each step before the next)

1. ✅ Basic project setup, the board, the path, the moving spark and the camera, with placeholder
   nodes
2. ✅ The 9 nodes and the text cards (plus the progress bar)
3. ✅ The React-Learn and FocusGuard 3D models
4. ✅ The kickboxer ending, contact links and resume download
5. ✅ Phone and reduced-motion versions, link preview, analytics · ⏳ deploy to Vercel

Version control is set up locally. Nothing is pushed or deployed until Lakshay says so.

## Open items for Lakshay

- [ ] Turn off Vercel Deployment Protection for React-Learn production (Lakshay is doing this).
      The live link will be `react-learn-workwithlakshay.vercel.app`; `react-learn.vercel.app` is
      someone else's site.
- [ ] Optional: a 3D model of the kickboxer (via Meshy or Tripo) to replace the 2D card.
- [ ] Optional: a custom domain.
