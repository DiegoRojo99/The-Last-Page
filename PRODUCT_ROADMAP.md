# The Last Page - Product Roadmap

This roadmap includes planned work only. Completed items were removed to keep focus on what is next.

## Product goals

- Expand from a personal reading tracker into a complete reading operating system.
- Deliver deeper progress intelligence through series, goals, and actionable insights.
- Keep the experience lightweight, fast, and motivation-oriented.

## Phase 1 - Workflow upgrades

- [x] Add bulk actions for books (multi-select, status updates, archive)
- [x] Add custom shelves or tags
- [x] Add saved sort and filter presets
- [x] Add search quality controls (language, category, sort)
- [x] Add similar books and recommendation blocks

## Phase 2 - Reading depth

- [x] Add edit and delete actions for reading sessions
- [x] Add reading notes history and highlights
- [x] Add quick session and quick progress entry from more pages
- [x] Add session templates (short sprint, deep focus, audiobook)

## Phase 3 - Series tracking (core feature)

### Data model
- [ ] Define Series entity
- [ ] Define SeriesBook ordering model
- [ ] Define UserSeriesProgress model
- [ ] Add migration strategy and fixtures

### Backend
- [ ] Add list series endpoint
- [ ] Add create series endpoint
- [ ] Add update series metadata endpoint
- [ ] Add delete series endpoint
- [ ] Add attach and detach book endpoints
- [ ] Add reorder series books endpoint
- [ ] Add series details endpoint

### Frontend
- [ ] Add Series entry point in main navigation or bookshelf
- [ ] Add series list page
- [ ] Add series cards with completion
- [ ] Add series detail page with ordered reading flow
- [ ] Add create and edit series modal

### Progress logic and quality
- [ ] Auto-sync series progress from linked book status
- [ ] Add duplicate and ordering safeguards
- [ ] Add unit and integration coverage for series flows

## Phase 4 - Goals, streaks, motivation

- [ ] Add goals model (books, pages, minutes)
- [ ] Add goals create and update flows
- [ ] Add monthly and yearly goal tracking
- [ ] Add current streak and longest streak logic
- [ ] Add milestone celebrations
- [ ] Add contextual nudges and motivation cards

## Phase 5 - Stats v2

- [ ] Modernize stats visual design to match the rest of the app
- [ ] Reduce noisy KPIs and improve hierarchy
- [ ] Add weekly reading heatmap
- [ ] Add monthly trend visualization
- [ ] Improve author and genre distribution views
- [ ] Add insight cards (pace vs goal, near completion, pause risk)

## Phase 6 - Reliability and quality

- [ ] Add route-level error boundaries for major pages
- [ ] Add end-to-end checks for critical journeys
- [ ] Add rendering and data-fetch performance pass
- [ ] Improve caching and refetch strategy
- [ ] Run complete accessibility pass (keyboard, focus, contrast)

## Phase 7 - Data portability and user control

- [ ] Add export of bookshelf, sessions, and stats (CSV or JSON)
- [ ] Add import flow from a CSV template
- [ ] Add backup and restore strategy
- [ ] Add account-level data reset controls

## Phase 8 - Notifications and retention

- [ ] Add configurable reading reminders
- [ ] Add goal checkpoint notifications
- [ ] Add in-app activity feed
- [ ] Add weekly digest summary

## Phase 9 - Integrations

- [ ] Add import assistant from Goodreads or StoryGraph
- [ ] Add Kindle highlights import
- [ ] Add calendar sync for planned reading blocks
- [ ] Add optional cloud sync enhancements

## Phase 10 - Optional expansion tracks

### Social and community
- [ ] Add shareable reading snapshots
- [ ] Add public profile mode
- [ ] Add reading circles and buddy challenges
- [ ] Add reactions or comments on shared updates

### AI-assisted experiences
- [ ] Add natural language discovery assistant
- [ ] Add personalized reading plan generator
- [ ] Add session recap from notes
- [ ] Add recommendation engine from user reading patterns

## Milestones

### Milestone A
- [ ] Ship series tracking foundation and first UI

### Milestone B
- [ ] Ship goals and streak baseline

### Milestone C
- [ ] Ship stats v2 insight modules

### Milestone D
- [ ] Ship quality, portability, and integration baseline
