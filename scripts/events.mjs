// Reads decks' titles and training events (events/<name>.yaml). Shared by the
// landing page (scripts/build-index.mjs) and the addon's build setup (addon/setup/).

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const presentationsDir = path.join(repoRoot, 'presentations')

export function humanize(slug) {
  return slug
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function readCourseMetadata() {
  const contents = fs.readFileSync(path.join(presentationsDir, 'index-metadata.yaml'), 'utf8')
  const parsed = YAML.parse(contents)
  return parsed && typeof parsed === 'object' ? parsed : {}
}

export function hasDeck(slug) {
  return fs.existsSync(path.join(presentationsDir, slug, 'slides.md'))
}

export function readDeckHeadmatter(slug) {
  const contents = fs.readFileSync(path.join(presentationsDir, slug, 'slides.md'), 'utf8')
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match ? (YAML.parse(match[1]) ?? {}) : {}
}

// A deck's title as the landing page shows it: a short `title` in
// presentations/index-metadata.yaml, else the deck's own title
export function deckTitle(slug, courseMetadata = readCourseMetadata()) {
  return courseMetadata[slug]?.title || readDeckHeadmatter(slug).title || humanize(slug)
}

// The event named by TRAINING_EVENT, or null in the generic build. A session's
// `deck` names its deck in presentations/, and its `topic` defaults to that
// deck's title; a session without slides (e.g. a drop-in) gives only a `topic`.
export function readEvent(name = process.env.TRAINING_EVENT) {
  if (!name)
    return null

  const file = `events/${name}.yaml`
  const event = YAML.parse(fs.readFileSync(path.join(repoRoot, file), 'utf8')) ?? {}
  const courseMetadata = readCourseMetadata()
  const sessions = (Array.isArray(event.sessions) ? event.sessions : []).map((session, i) => {
    const where = `${file}: session ${i + 1} (${session.date} ${session.slot})`
    if (session.deck && !hasDeck(session.deck))
      throw new Error(`${where} has deck "${session.deck}", but there is no presentations/${session.deck}/slides.md`)
    if (!session.deck && !session.topic)
      throw new Error(`${where} needs a deck or a topic`)
    return { ...session, topic: session.topic || deckTitle(session.deck, courseMetadata) }
  })
  return { ...event, sessions }
}

// The decks an event build includes: each session's deck, and any deck that
// opens the event (`date: first-session`, e.g. the introduction)
export function eventDecks(event) {
  const openers = fs.readdirSync(presentationsDir)
    .filter(slug => hasDeck(slug) && readDeckHeadmatter(slug).date === 'first-session')
  return [...new Set([...openers, ...event.sessions.map(s => s.deck).filter(Boolean)])]
}
