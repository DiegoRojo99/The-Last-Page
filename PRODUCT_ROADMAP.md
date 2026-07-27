# The Last Page - Product Roadmap Checklist

This checklist breaks down the redesign and feature roadmap into small, trackable tasks.

## Phase 0 - Planning and Baseline

- [x] Confirm product goals for v2 (modern UI, cleaner UX, series tracking)
- [x] Confirm what to reduce/simplify in current UX
- [x] Define launch scope (MVP vs later enhancements)
- [x] Create implementation branches strategy
- [x] Capture before screenshots for all major pages
- [x] Record baseline UX issues in a short audit

## Phase 1 - Design System and Visual Direction

### 1.1 Brand and style foundation
- [x] Choose a visual direction (editorial, cinematic, minimalist, etc.)
- [x] Select primary display font
- [x] Select body font
- [x] Define core color palette
- [x] Define semantic colors (success, warning, danger, info)
- [x] Define neutral scale for text/surfaces/borders
- [x] Define spacing scale tokens
- [x] Define border radius scale
- [x] Define shadow scale
- [x] Define motion durations and easing tokens

### 1.2 Global CSS and tokens
- [x] Add CSS variables for colors
- [x] Add CSS variables for typography sizes
- [x] Add CSS variables for spacing
- [x] Add CSS variables for radius
- [x] Add CSS variables for shadows
- [x] Add utility classes for gradients/background textures
- [x] Add utility classes for animation primitives

### 1.3 Reusable UI primitives
- [x] Create base Button component variants
- [x] Create Card component variants
- [x] Create Badge component variants
- [x] Create Tabs primitive component
- [x] Create Modal primitive component
- [x] Create EmptyState component
- [x] Create Skeleton loading components
- [x] Create Toast/feedback component

## Phase 2 - Core Layout and Navigation Refresh

### 2.1 App shell updates
- [x] Redesign top navigation layout
- [x] Add clearer active route styling
- [x] Improve mobile menu interactions
- [x] Add responsive container and spacing consistency
- [x] Add reusable page header pattern

### 2.2 Home page redesign
- [x] Redesign hero section
- [x] Add dynamic "continue reading" section
- [x] Add "next actions" quick panel
- [x] Refresh feature highlight section
- [x] Improve footer visual style

## Phase 3 - Bookshelf Experience Redesign

### 3.1 Bookshelf overview
- [x] Redesign bookshelf header area
- [x] Redesign status summary cards
- [x] Replace/refresh tab styles
- [x] Add better empty states per tab
- [x] Improve loading states with skeletons

### 3.2 Book cards and interactions
- [x] Redesign BookCard layout
- [x] Improve progress overlay visibility
- [x] Standardize status badges style
- [x] Add clearer CTA hierarchy on cards
- [x] Improve wishlist card visuals
- [x] Add hover/focus motion polish

### 3.3 Add book flow
- [x] Redesign Add Book modal layout
- [x] Improve modal close/escape behavior UX copy
- [x] Add loading and success feedback states
- [x] Improve error handling visuals for add flow

## Phase 4 - Search and Book Details Refresh

### 4.1 Search page and results
- [x] Redesign search page header
- [x] Redesign search bar visual treatment
- [x] Add clear loading skeletons for search
- [x] Improve no-results state
- [x] Add optional results view toggle (grid/list)
- [x] Improve result card readability

### 4.2 Book details page
- [x] Redesign book hero section
- [x] Improve title/subtitle/author hierarchy
- [x] Redesign metadata cards (pages, publisher, genre, etc.)
- [x] Redesign description/content section
- [x] Add stronger primary actions (add to shelf/wishlist)
- [x] Improve responsive layout on mobile

## Phase 5 - New Feature: Series Tracking

### 5.1 Data model and types
- [ ] Define `Series` type
- [ ] Define `SeriesBook` type (book order in series)
- [ ] Define `UserSeriesProgress` type
- [ ] Add all new types to shared type files
- [ ] Document data model in markdown

### 5.2 Backend/API structure
- [ ] Create endpoint to list user series
- [ ] Create endpoint to create a series
- [ ] Create endpoint to update series metadata
- [ ] Create endpoint to delete a series
- [ ] Create endpoint to attach a book to a series
- [ ] Create endpoint to remove a book from a series
- [ ] Create endpoint to reorder books in a series
- [ ] Create endpoint to fetch single series details
- [ ] Add auth verification to all new endpoints
- [ ] Add validation and error responses for all new endpoints

### 5.3 Series UI
- [ ] Add "Series" entry point in navigation or bookshelf tabs
- [ ] Create series list page
- [ ] Create series card component
- [ ] Show per-series progress bar
- [ ] Show "book x of y" indicators
- [ ] Create series detail page
- [ ] Add ordered series timeline/list UI
- [ ] Add completion state indicators per book
- [ ] Add create/edit series modal
- [ ] Add attach existing book to series flow

### 5.4 Series progress logic
- [ ] Compute read count per series
- [ ] Compute percent completion per series
- [ ] Compute current active book in series
- [ ] Auto-update series progress when a linked book changes status
- [ ] Add manual override for current series book (optional)

### 5.5 Series quality checks
- [ ] Add tests for series API handlers
- [ ] Add UI tests for series flows
- [ ] Add edge-case handling (duplicate attachments, missing order)

## Phase 6 - Reading Goals and Streaks

### 6.1 Goals
- [ ] Define goals data model (books/pages/minutes)
- [ ] Create API to create/update goals
- [ ] Create API to fetch goal progress
- [ ] Add goals widget to home/bookshelf
- [ ] Add monthly and yearly goal views

### 6.2 Streaks
- [ ] Define streak calculation rules
- [ ] Implement streak calculator from reading sessions
- [ ] Show current streak and longest streak
- [ ] Add streak milestone badges
- [ ] Add optional streak-protection behavior

### 6.3 Motivation UX
- [ ] Add celebratory feedback for milestones
- [ ] Add reminders/nudges copy blocks
- [ ] Add actionable recommendation cards based on goal progress

## Phase 7 - Stats Page Modernization (Actionable Insights)

### 7.1 Simplify existing stats
- [ ] Keep only high-value KPIs in top section
- [ ] Remove or hide low-value/noisy stats
- [ ] Improve KPI card visual hierarchy

### 7.2 Add insight-driven modules
- [ ] Add "series closest to completion" insight
- [ ] Add "best reading day/time" insight
- [ ] Add "most paused book" insight
- [ ] Add "pace vs goals" insight

### 7.3 Improve visualizations
- [ ] Add weekly reading activity heatmap
- [ ] Add monthly reading trend chart
- [ ] Improve author/genre distribution display
- [ ] Add empty-state/fallback charts when data is low

## Phase 8 - Workflow Simplification and Friction Reduction

### 8.1 Reduce duplicate controls
- [ ] Audit all progress/session entry points
- [ ] Remove redundant progress controls
- [ ] Keep one primary quick action pattern
- [ ] Standardize progress update UX across pages

### 8.2 Bulk actions and organization
- [ ] Add multi-select mode for books
- [ ] Add bulk status update action
- [ ] Add bulk move to wishlist action
- [ ] Add bulk remove action with confirmation
- [ ] Add custom shelves or tags
- [ ] Add saved sort/filter presets

## Phase 9 - Reliability, QA, and Performance

### 9.1 Code quality and reliability
- [ ] Add stronger API error handling consistency
- [ ] Add client-side error boundary or safe fallbacks
- [ ] Add optimistic updates where beneficial
- [ ] Add retry strategy for transient API failures

### 9.2 Performance
- [ ] Audit large client components for split opportunities
- [ ] Optimize image loading behavior
- [ ] Add memoization where rerenders are expensive
- [ ] Reduce unnecessary network refetches

### 9.3 Testing and verification
- [ ] Add/update unit tests for new logic
- [ ] Add integration tests for critical flows
- [ ] Validate mobile responsiveness on major pages
- [ ] Run lint and type checks cleanly
- [ ] Perform final regression pass

## Phase 10 - Release and Iteration

- [ ] Prepare release notes for v2 changes
- [ ] Create rollout checklist
- [ ] Soft launch and gather user feedback
- [ ] Prioritize post-launch improvements

## Suggested MVP Cut (first milestone)

- [ ] Complete design system foundation
- [ ] Ship redesigned nav, home, bookshelf, search, and book details
- [ ] Ship basic series tracking (create/list/detail + progress)
- [ ] Ship simplified, actionable stats v1
- [ ] Ship baseline tests and responsive QA
