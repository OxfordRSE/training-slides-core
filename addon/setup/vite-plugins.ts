import { defineVitePluginsSetup } from '@slidev/types'
import { readEvent } from '../../scripts/events.mjs'

// Defines __EVENT__ for the addon's components and layouts: the event YAML, with
// each session's `topic` filled in from its deck (see scripts/events.mjs), or {}
// in the generic build. The theme defines __EVENT_SCHEDULE__ too, but as written
// in the YAML, so without the topics that come from decks.
export default defineVitePluginsSetup(() => [{
  name: 'oxrse-event',
  config() {
    return {
      define: {
        __EVENT__: JSON.stringify(readEvent() ?? {}),
      },
    }
  },
}])
