#!/usr/bin/env node

// Prints the slugs of the decks in the event named by TRAINING_EVENT, one per
// line, for build_all.sh to build only those

import process from 'node:process'
import { eventDecks, readEvent } from './events.mjs'

const event = readEvent()
if (!event) {
  console.error('TRAINING_EVENT is not set')
  process.exit(1)
}
for (const slug of eventDecks(event))
  console.log(slug)
