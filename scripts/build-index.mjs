#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import YAML from 'yaml'

const repoRoot = process.cwd()
const distDir = path.join(repoRoot, 'dist')
const presentationsDir = path.join(repoRoot, 'presentations')
const courseMetadataPath = path.join(repoRoot, 'presentations', 'index-metadata.yaml')
const logoSource = path.join(
  repoRoot,
  'node_modules',
  'slidev-theme-oxrse',
  'img',
  'logos',
  '2024_oxrse_next_to_oxford.svg',
)
const logoDir = path.join(distDir, 'assets')
const logoDest = path.join(logoDir, 'oxrse-logo.svg')
// Served at /favicon.svg, which is also where every deck's favicon points
const faviconSource = path.join(repoRoot, 'public', 'favicon.svg')
const faviconDest = path.join(distDir, 'favicon.svg')
// The same bundled fonts as the slides (latin subset only), served from dist/assets
const fontFiles = [
  ['noto-sans', 'noto-sans-latin-wght-normal.woff2'],
  ['noto-sans', 'noto-sans-latin-wght-italic.woff2'],
  ['jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2'],
]

async function readCourseMetadata() {
  const contents = await fs.readFile(courseMetadataPath, 'utf8')
  const parsed = YAML.parse(contents)
  return parsed && typeof parsed === 'object' ? parsed : {}
}

async function readPresentationFrontmatter(slug) {
  const file = path.join(presentationsDir, slug, 'slides.md')
  const contents = await fs.readFile(file, 'utf8')
  const frontmatterMatch = contents.match(/^---\n([\s\S]*?)\n---/)
  return frontmatterMatch ? (YAML.parse(frontmatterMatch[1]) ?? {}) : {}
}

// The session topic a deck stands for, from its orientation slide's `highlight:`
async function readPresentationHighlight(slug) {
  const file = path.join(presentationsDir, slug, 'slides.md')
  const contents = await fs.readFile(file, 'utf8')
  return contents.match(/^highlight:\s*(.+?)\s*$/m)?.[1] ?? ''
}

function humanize(slug) {
  return slug
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function getPresentationEntries() {
  const courseMetadata = await readCourseMetadata()
  const dirEntries = await fs.readdir(presentationsDir, { withFileTypes: true })
  const presentationDirs = new Set(
    dirEntries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name),
  )
  const metadataEntries = Object.entries(courseMetadata)
  const metadataSlugs = new Set(metadataEntries.map(([slug]) => slug))
  const slugs = [
    ...metadataEntries.map(([slug]) => slug),
    ...[...presentationDirs].filter(slug => !metadataSlugs.has(slug)).sort(),
  ]

  const entries = await Promise.all(slugs.map(async (slug) => {
    const metadata = courseMetadata?.[slug] ?? {}
    const hasSlides = presentationDirs.has(slug)
    const frontmatter = hasSlides ? await readPresentationFrontmatter(slug) : {}
    const highlight = hasSlides ? await readPresentationHighlight(slug) : ''
    const href = hasSlides ? `./${slug}/index.html` : (metadata.href || null)
    const available = metadata.available ?? Boolean(href)

    return {
      slug,
      number: metadata.number,
      title: metadata.title || frontmatter.title || humanize(slug),
      description: metadata.description || 'Course presentation',
      audience: metadata.audience || '',
      href,
      available,
      ctaLabel: available ? 'Open presentation' : 'Slides not available',
      highlight,
      // Decks that open an event without being a session, e.g. the introduction
      opensEvent: frontmatter.date === 'first-session',
    }
  }))
  return entries
}

async function readEventSchedule() {
  const trainingEvent = process.env.TRAINING_EVENT
  if (!trainingEvent)
    return null

  const eventPath = path.join(repoRoot, 'events', `${trainingEvent}.yaml`)
  try {
    const contents = await fs.readFile(eventPath, 'utf8')
    const parsed = YAML.parse(contents)
    return {
      name: humanize(trainingEvent.replace(/-/g, '_')),
      year: parsed?.year,
      sessions: Array.isArray(parsed?.sessions) ? parsed.sessions : [],
    }
  }
  catch {
    return null
  }
}

function buildPlausibleSnippet() {
  const domain = process.env.PLAUSIBLE_DOMAIN
  if (!domain)
    return ''

  const src = process.env.PLAUSIBLE_SRC || 'https://plausible.io/js/script.outbound-links.js'
  const api = process.env.PLAUSIBLE_API
  const apiAttribute = api ? ` data-api="${escapeHtml(api)}"` : ''
  return `  <script defer data-domain="${escapeHtml(domain)}"${apiAttribute} src="${escapeHtml(src)}"></script>\n`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

// "02 Nov" + year -> "Mon 02 Nov", matching the orientation slide
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function sessionDay(session, year) {
  const [day, month] = session.date.split(' ')
  const date = new Date(Date.UTC(year, MONTHS.indexOf(month), Number(day)))
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })
  return `${weekday} ${session.date}`
}

// "02 Nov" + "09:30" + year -> "2026-11-02T09:30", compared as a string in the browser
function sessionStart(session, year) {
  const [day, month] = session.date.split(' ')
  const mm = String(MONTHS.indexOf(month) + 1).padStart(2, '0')
  return `${year}-${mm}-${day.padStart(2, '0')}T${session.slot}`
}

// A deck's session is the one whose topic matches the deck's `highlight:`, which
// can differ from its title (e.g. "Continuous Integration (and Continuous Deployment)")
function sessionFor(presentation, eventSchedule) {
  if (!presentation.highlight)
    return undefined
  return eventSchedule?.sessions.find(s => s.topic === presentation.highlight)
}

// Highlights the current session and scrolls it into view. A session becomes
// current an hour before it starts (so early arrivals see it) and stays current
// until the next one takes over; before that, today's first session is shown.
// Times are Oxford local time; append ?now=2026-11-05T15:00 to preview a moment.
const CURRENT_SESSION_SCRIPT = `
  <script>
    (() => {
      const override = new URLSearchParams(location.search).get('now')
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London', hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
      }).formatToParts(new Date()).map(p => [p.type, p.value]))
      const now = override || \`\${parts.year}-\${parts.month}-\${parts.day}T\${parts.hour}:\${parts.minute}\`
      const today = now.slice(0, 10)

      const starts = [...new Set([...document.querySelectorAll('[data-start]')].map(c => c.dataset.start))]
        .filter(start => start.startsWith(today))
        .sort()
      if (!starts.length)
        return
      const minutes = t => Number(t.slice(11, 13)) * 60 + Number(t.slice(14, 16))
      const LEAD_MINUTES = 60
      const current = starts.filter(start => minutes(start) - LEAD_MINUTES <= minutes(now)).at(-1) ?? starts[0]

      const cards = document.querySelectorAll(\`[data-start="\${current}"]\`)
      cards.forEach(card => card.classList.add('current'))
      cards[0].scrollIntoView({ block: 'start' })
    })()
  </script>
`

// Above each title: in an event build, the session's date and start time; in the
// generic build, the course's category (`audience`). Every card has one such
// line, so that all cards are the same height.
function renderWhen(presentation, eventSchedule) {
  if (!eventSchedule)
    return `<p class="card-kicker">${escapeHtml(presentation.audience) || '&nbsp;'}</p>`
  const session = sessionFor(presentation, eventSchedule)
  if (!session)
    return '<p class="card-when card-when-empty" aria-hidden="true"><span class="time">&nbsp;</span></p>'
  return `<p class="card-when"><span class="day">${escapeHtml(sessionDay(session, eventSchedule.year))}</span><span class="time">${escapeHtml(session.slot)}</span></p>`
}

function renderCards(presentations, eventSchedule) {
  return presentations.map((presentation) => {
    const tagName = presentation.available && presentation.href ? 'a' : 'div'
    const hrefAttribute = presentation.available && presentation.href ? ` href="${presentation.href}"` : ''
    const availabilityClass = presentation.available ? '' : ' deck-card-unavailable'
    const session = sessionFor(presentation, eventSchedule)
    const startAttribute = session ? ` data-start="${sessionStart(session, eventSchedule.year)}"` : ''
    const statusMarkup = presentation.available
      ? `<span class="card-cta" aria-hidden="true">&rarr;</span>`
      : `<span class="card-cta card-cta-muted">${escapeHtml(presentation.ctaLabel)}</span>`

    return `
          <${tagName} class="deck-card${availabilityClass}"${hrefAttribute}${startAttribute}>
            <span class="card-index">${presentation.number ?? '?'}</span>
            <div class="card-copy">
              ${renderWhen(presentation, eventSchedule)}
              <h3>${escapeHtml(presentation.title)}</h3>
              <p>${escapeHtml(presentation.description)}</p>
            </div>
            ${statusMarkup}
          </${tagName}>`
  }).join('')
}

function renderHtml(presentations, eventSchedule) {
  const plausibleSnippet = buildPlausibleSnippet()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Oxford RSE Software Engineering Course</title>
  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
  <meta name="description" content="Browse the Oxford Research Software Engineering course presentations." />
${plausibleSnippet}  <style>
    @font-face {
      font-family: "Noto Sans";
      font-weight: 100 900;
      font-display: swap;
      src: url("./assets/noto-sans-latin-wght-normal.woff2") format("woff2");
    }

    @font-face {
      font-family: "Noto Sans";
      font-style: italic;
      font-weight: 100 900;
      font-display: swap;
      src: url("./assets/noto-sans-latin-wght-italic.woff2") format("woff2");
    }

    @font-face {
      font-family: "JetBrains Mono";
      font-weight: 100 800;
      font-display: swap;
      src: url("./assets/jetbrains-mono-latin-wght-normal.woff2") format("woff2");
    }

    :root {
      --oxrse-blue: #002147;
      --oxrse-blue-strong: #00152f;
      --oxrse-ink: #122033;
      --oxrse-muted: #536277;
      --oxrse-line: rgba(0, 33, 71, 0.12);
      --oxrse-highlight-strong: #78b3cf;
      --oxrse-wash: #edf4f8;
      --oxrse-shadow: 0 24px 80px rgba(0, 33, 71, 0.14);
      --oxrse-radius: 28px;
      --oxrse-max-width: 1200px;
    }

    * { box-sizing: border-box; }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      font-family: "Noto Sans", system-ui, sans-serif;
      color: var(--oxrse-ink);
      background:
        radial-gradient(circle at top left, rgba(120, 179, 207, 0.38), transparent 28rem),
        radial-gradient(circle at top right, rgba(0, 33, 71, 0.1), transparent 26rem),
        linear-gradient(180deg, #f7fafc 0%, #edf4f8 42%, #ffffff 100%);
      min-height: 100vh;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(0, 33, 71, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 33, 71, 0.03) 1px, transparent 1px);
      background-size: 28px 28px;
      mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.42), transparent 72%);
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .page-shell {
      width: min(calc(100% - 2rem), var(--oxrse-max-width));
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero {
      margin: 1rem auto 0;
      padding: 1rem;
    }

    .hero-panel {
      overflow: hidden;
      position: relative;
      background:
        linear-gradient(140deg, rgba(0, 33, 71, 0.98), rgba(0, 21, 47, 0.96)),
        var(--oxrse-blue);
      color: white;
      border-radius: calc(var(--oxrse-radius) + 6px);
      box-shadow: var(--oxrse-shadow);
      padding: clamp(1.25rem, 3vw, 2rem);
      isolation: isolate;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .hero-panel::before,
    .hero-panel::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      background: rgba(185, 217, 235, 0.16);
      z-index: -1;
    }

    .hero-panel::before {
      width: 28rem;
      height: 28rem;
      right: -8rem;
      top: -12rem;
    }

    .hero-panel::after {
      width: 16rem;
      height: 16rem;
      left: 46%;
      bottom: -9rem;
      background: rgba(255, 255, 255, 0.08);
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      min-width: 0;
    }

    .brand img {
      height: 3rem;
      width: auto;
      flex: 0 0 auto;
    }

    .brand span {
      display: block;
      font-size: 0.92rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      opacity: 0.82;
    }

    .brand strong {
      display: block;
      font-size: 1.15rem;
      line-height: 1.2;
      margin-top: 0.15rem;
    }

    .hero-title {
      margin: 0;
      font-size: clamp(1.8rem, 3.2vw, 2.8rem);
      line-height: 1.1;
      opacity: 0.92;
      text-align: right;
    }

    .content {
      padding: 1rem 1rem 3rem;
    }

    .content .page-shell {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .deck-card {
      scroll-margin-top: 1rem;
    }

    .deck-card.current {
      outline: 2.5px solid #e8a735;
      outline-offset: -1px;
    }

    .deck-card.current .card-when .time {
      color: #fff;
      background: #e8a735;
    }

    .cards {
      display: grid;
      gap: 0.75rem;
    }


    .card-kicker {
      margin: 0 0 0.4rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.75rem;
      color: #6b7b90;
    }

    .card-when {
      margin: 0 0 0.4rem;
      font-family: "JetBrains Mono", ui-monospace, monospace;
      white-space: nowrap;
    }

    .card-when-empty {
      visibility: hidden;
    }

    .card-when .day {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--oxrse-muted);
    }

    .card-when .time {
      margin-left: 0.6rem;
      padding: 0.1rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--oxrse-blue);
      background: var(--oxrse-wash);
    }

    .deck-card {
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: start;
      min-height: 100%;
      padding: 0.85rem 1.2rem;
      border-radius: var(--oxrse-radius);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.92));
      border: 1px solid var(--oxrse-line);
      box-shadow: 0 10px 30px rgba(0, 33, 71, 0.07);
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
    }

    .deck-card::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 7px;
      background: linear-gradient(180deg, var(--oxrse-highlight-strong), var(--oxrse-blue));
    }

    .deck-card:hover,
    .deck-card:focus-visible {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 33, 71, 0.12);
      border-color: rgba(0, 33, 71, 0.18);
    }

    .card-index {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.5rem;
      height: 2.5rem;
      border-radius: 18px;
      background: var(--oxrse-wash);
      color: var(--oxrse-blue);
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .card-copy {
      min-width: 0;
    }

    .card-copy h3 {
      margin: 0 0 0.2rem;
      font-size: 1.3rem;
      /* Tall enough that descenders are not clipped by the ellipsis overflow */
      line-height: 1.45;
      color: var(--oxrse-blue);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Every card reserves exactly two lines of description */
    .card-copy p:not(.card-when) {
      margin: 0;
      color: var(--oxrse-muted);
      line-height: 1.45;
      min-height: 2.9em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-cta {
      align-self: center;
      color: var(--oxrse-blue);
      font-size: 1.4rem;
      font-weight: 700;
      white-space: nowrap;
      transition: transform 180ms ease;
    }

    .deck-card:hover .card-cta,
    .deck-card:focus-visible .card-cta {
      transform: translateX(4px);
    }

    .deck-card-unavailable {
      background: linear-gradient(180deg, rgba(245, 248, 250, 0.98), rgba(240, 244, 247, 0.94));
    }

    .deck-card-unavailable:hover {
      transform: none;
      box-shadow: 0 10px 30px rgba(0, 33, 71, 0.07);
      border-color: var(--oxrse-line);
    }

    .deck-card-unavailable::before {
      background: linear-gradient(180deg, #a9b8c7, #74859a);
    }

    .deck-card-unavailable .card-index {
      background: #eef2f5;
      color: #5a6b7f;
    }

    .card-cta-muted {
      color: #5a6b7f;
    }

    .footer {
      padding: 0 1rem 2.5rem;
      color: var(--oxrse-muted);
      font-size: 0.95rem;
    }

    .footer-panel {
      border-top: 1px solid var(--oxrse-line);
      padding-top: 1.1rem;
    }

    @media (max-width: 980px) {
      .hero-panel {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .hero-title {
        text-align: left;
      }

    }

    @media (max-width: 640px) {
      .hero,
      .content,
      .footer {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }

      .hero-panel {
        border-radius: 24px;
      }

      /* On phones, let titles and descriptions wrap in full instead */
      .card-copy h3,
      .card-copy p:not(.card-when) {
        white-space: normal;
        min-height: 0;
        display: block;
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="page-shell hero-panel">
        <div class="brand">
          <img src="./assets/oxrse-logo.svg" alt="Oxford Research Software Engineering Group" />
          <div>
            <span>Oxford Research Software Engineering Group</span>
            <strong>Software Engineering Course</strong>
          </div>
        </div>
        <h1 class="hero-title">Course sessions</h1>
      </div>
    </section>

    <section class="content">
      <div class="page-shell">
        <div class="cards">${renderCards(presentations, eventSchedule)}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="page-shell footer-panel">
      <span>Oxford Research Software Engineering Group</span>
    </div>
  </footer>
${eventSchedule ? CURRENT_SESSION_SCRIPT : ''}</body>
</html>
`
}

async function main() {
  const eventSchedule = await readEventSchedule()
  let presentations = await getPresentationEntries()
  if (eventSchedule) {
    // The event's sessions in timetable order, after any deck that opens the event
    const start = p => sessionStart(sessionFor(p, eventSchedule), eventSchedule.year)
    presentations = [
      ...presentations.filter(p => p.opensEvent),
      ...presentations
        .filter(p => sessionFor(p, eventSchedule))
        .sort((a, b) => start(a).localeCompare(start(b))),
    ]
  }

  await fs.mkdir(logoDir, { recursive: true })
  await fs.copyFile(logoSource, logoDest)
  await fs.copyFile(faviconSource, faviconDest)
  for (const [pkg, file] of fontFiles)
    await fs.copyFile(path.join(repoRoot, 'node_modules', '@fontsource-variable', pkg, 'files', file), path.join(logoDir, file))
  await fs.writeFile(path.join(distDir, 'index.html'), renderHtml(presentations, eventSchedule))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
