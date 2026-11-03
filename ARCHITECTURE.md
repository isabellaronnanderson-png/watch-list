# Ultimate Media List: architecture guide

A personal media tracker. React 18 + Vite 5, plain CSS, deployed on Vercel from a GitHub repo.
Data lives in `localStorage` and syncs to Supabase behind an email/password login.

**Read this first in any new chat, then work from the freshly attached copy of the code.**
This file describes the patterns; the code is the source of truth.

## Tabs

Seven media tabs, in this order, plus the Diary view (see below). Every tab follows the same shape: **Header** (search/add) → **filters** → optional
"Currently ..." section → main grid of **tickets**.

| Tab | id | Accent | Data source | Card |
|---|---|---|---|---|
| Watch | `watch` | blue | TMDB (key + region) | `TicketCard` (horizontal) |
| Read | `read` | yellow | Google Books | `BookTicket` (horizontal) |
| Articles | `articles` | green | Microlink (no key), paste a link | `ArticleTile` (vertical) |
| Listen | `listen` | light blue | Google Books audiobooks + manual add | `ListenTile` (horizontal) |
| Albums | `albums` | orange | Last.fm (key), no release year available | `AlbumTicket` (horizontal, square art) |
| Play | `games` | purple | RAWG (key) | `GameTicket` (vertical) |
| YouTube | `watchlater` | red | YouTube oEmbed (no key), paste a link | `WatchLaterTile` (vertical) |

- `src/App.jsx`: auth wrapper, always opens on Watch (tab choice is not persisted on purpose).
- `src/components/TabNav.jsx`: tab list and accent colors. `src/index.css` has matching `.tab-<id>` classes setting
  `--tab-accent` and `--tab-accent-rgb`. Most coloured UI reads those variables.
- Each tab has `XTab.jsx` + `XHeader.jsx` + a card component + a hook in `src/hooks/`.
- `useWatchlist.js` is the oldest hook (inline tag functions, season logic). The other six use the shared factories.

## Data

- Each list hook keeps `items` in React state, mirrored to `localStorage` key `marquee-watchlist:<name>`
  (`items`, `books`, `listen`, `albums`, `games`, `youtube`, `articles`).
- Common item fields: `id`, `title`, `status`, `tags[]`, `rating` (0-5), `addedAt`. Plus per-tab fields.
- Each hook has a `migrateItem` that fills in missing fields when loading old data. Add new fields there.
- Statuses: Want → In progress → Done. Labels/values live in `src/utils/format.js`
  (`WATCH_STATUSES`, `READ_STATUSES`, `LISTEN_STATUSES` (also used by Albums), `GAME_STATUSES`).
- Shared factories: `hooks/tagHelpers.js` (toggle/rename/delete tags), `hooks/ratingHelpers.js` (setRating).
- Tags are per tab. "Favorite" is built in and protected.
- **TV shows** (Watch only): `seasons` is a boolean array. Status is derived from it. On load the app re-checks TMDB
  for new seasons and extends the array. The "Watching" section uses `SeasonStatusControl`, the library
  uses `TvStatusControl`.

## Cloud sync (Supabase)

- `api/supabaseClient.js` exports `supabase` and `supabaseEnabled`. Without the two env vars the app runs
  local-only with no login screen.
- `AuthContext.jsx` / `useAuth.js` / `AuthGate.jsx`: email + password, dedicated "check your email" screen after signup.
- One table, `lists(user_id, list_key, items jsonb, updated_at)`, with RLS so users only touch their own rows.
  The SQL is in `README.md`. **One row per user per tab**, the whole array as JSON.
- `hooks/useCloudSync.js` is called inside every list hook with its `list_key`
  (`watch`, `read`, `listen`, `albums`, `games`, `youtube`, `articles`):
  - On login it loads the cloud copy and adopts it. If the cloud has nothing but local data exists, it pushes local up.
  - After that, every change is upserted (debounced 600ms). Errors are logged to the console only.
- Limits worth knowing: sync is last-write-wins per tab, so two devices open at once can overwrite each other.
  There is no conflict handling.
- Free Supabase tier: projects pause after about a week of inactivity, and there are no automatic backups.
  `BackupPanel.jsx` / `utils/backup.js` export and restore every tab as JSON. **Add new tabs' storage keys to
  `backup.js`.**

## Behaviors that span tabs

**Completion + rating** (Watch, Read, Listen, Play, Albums; not Articles/YouTube)
- Marking something done fires confetti (`utils/confetti.js`, called from `StatusStub`, `SeasonStatusControl`,
  `TvStatusControl`).
- Each tab wraps `setStatus`/`setRating` in `handleSetStatus`/`handleSetRating`/`handleSkipRating` and tracks two sets:
  `justCompletedIds` (keeps the finished card visible instead of hiding it) and `pendingWasInProgress`
  (keeps it in the "Currently ..." section). Both clear when the person rates or skips. There is deliberately **no timeout**.
- Cards receive `isPendingRating` and swap the status buttons for `InlineRatingPrompt` (animated stars, confetti,
  commits the rating about 0.8s after a tap so the animation can play). Pending cards get the `.is-rating` glow.
- Finished items are hidden by default unless a status or tag filter is active.
- Articles and YouTube have **no rating UI** (removed on purpose). The `rating` field still exists but is unused.

**Pick for me**
- `MobileFilterToggle` renders a row with the mobile "Filters" toggle and `PickForMe`. Each tab passes
  `pickItems={visibleItems}` (Watch passes it via `FilterBar`), so the pool is whatever the filters leave.
- `utils/pickStore.js` holds the picked id (via `useSyncExternalStore`). Cards read it directly, add `.is-picked`
  and render `PickPrompt` (Start / Dismiss) inline. `PickForMe` adds `body.has-pick`, which dims every other card.
- Cards need `id={item.id}` on the `<article>` for scroll-to to work (`utils/scrollToItem.js`).

**Filters**: `TagFilterGroup` (with Manage modal), `RatingFilterGroup` (exact star match, 1-5), plus per-tab chips.
Search headers show an × clear button once text is entered.

## Mobile (max-width 640px, all CSS in `src/index.css`)

- Tab nav stays on one row (shrinks, scrolls as a fallback). Grids are two columns.
- Cards collapse to compact tiles: cover, title, status pill. A chevron (`.mobile-expand-toggle`) expands the card.
- Cards wrap their detail in `<div className="media-card-detail">`. On desktop that wrapper is `display: contents`,
  so desktop layout is unchanged. On mobile it is hidden until `.is-expanded`.
- Expanded horizontal cards switch back to a compact row (small image beside the controls); expanded cards span both columns.
- The delete (×) button is hidden on mobile until a card is expanded, to avoid accidental taps.
- Filters collapse behind a "Filters ▾" button (`MobileFilterToggle`).

## Design language

White background, near-black text, Archivo (display) + Inter (body). Cards look like movie tickets: dashed perforation,
barcode strip, "Admit One · No. XXXXX". Flat design: no 3D effects. Each tab's accent colour appears in hover borders,
the active nav tab, highlights and the pick/rating glow. Restrained overall; the lively moments are the pick spotlight,
the rating prompt and confetti.

## Diary

An eighth nav button (`Diary`, right-aligned) that shows everything finished, grouped by month, newest first. It is a
view over the existing lists, not a new data store, so there is **no new storage key and nothing to add to `backup.js`**.

- `utils/completion.js`: `stampCompletion(before, after)` sets `completedAt` (a timestamp) when an item moves into a done
  status (`watched`, `read`, `listened`, `played`) and removes it when it moves back out. Used by `setStatus` in the
  Watch, Read, Listen, Albums and Play hooks, and by TV `toggleSeason` / `updateSeasonCount`.
- Each of those hooks also exposes `setCompletedAt(id, ts)` so the Diary can correct a date (tap the day number).
- `components/DiaryTab.jsx` mounts the five hooks, collects items that have `completedAt`, groups by month, filters by type.
- Items finished **before** the Diary existed have no `completedAt` and are not shown. This is deliberate (the diary starts
  from the day it shipped). Articles and YouTube are not included (no done/rating flow).
- Adding a new tab that has a done status: add its status to `DONE_STATUSES`, use `stampCompletion` in its `setStatus`,
  expose `setCompletedAt`, and register it in `DiaryTab.jsx` (`KINDS`, `sources`, `setters`, `describe`).

## Adding a new tab (checklist)

1. `src/api/<name>.js` (search/lookup), with a key in `.env.example` if one is needed.
2. `src/hooks/use<Name>.js`, copied from `useAlbums.js`: new `STORAGE_KEY`, a `useCloudSync('<key>', ...)` call, `migrateItem`.
3. `<Name>Header.jsx` (search + "Add manually"), `<Name>Ticket.jsx` (copy `AlbumTicket.jsx` for the mobile scaffolding,
   `isPicked`/`PickPrompt`, rating), `<Name>Tab.jsx` (copy `AlbumsTab.jsx`).
4. Register it in `TabNav.jsx` and `App.jsx`; add a `.tab-<id>` accent block in `index.css`.
5. Add its storage key to `utils/backup.js`.
6. Give the card `id={item.id}` and wrap its detail in `.media-card-detail`.
7. Update this file and `README.md`.

## Deploying

- Workflow: change code → upload to the GitHub repo (contents, not the outer folder) → commit → Vercel redeploys.
- `VITE_*` env vars are baked in at build time. After adding or changing one in Vercel, **redeploy**.
- Env vars: `VITE_TMDB_API_KEY`, `VITE_TMDB_REGION` (GB), `VITE_RAWG_API_KEY`, `VITE_GOOGLE_BOOKS_API_KEY`,
  `VITE_LASTFM_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (the publishable key; safe in a browser).
- Vercel **Deployment Protection** must be off, or other people hit a Vercel login wall.
- Supabase **Site URL / Redirect URLs** must be the live Vercel domain, or signup confirmation links break.
  Optionally turn off "Confirm email" for friends-only use.

## Known gaps and gotchas

- **Games (RAWG) outage**: RAWG went down in Aug 2026. Check whether it has recovered. IGDB isn't usable from the
  browser (no CORS), so switching would need a small serverless proxy on Vercel.
- `README.md`'s intro still describes the older five-tab version; its Supabase section is current.
- When scripting the same edit across many tab files, verify each one afterwards (`grep`). The tabs differ slightly
  (for example `WatchLaterTab` uses its own filter-toggle function names) and bulk edits have missed files before.
- The preview tool's generic styling doesn't match the real app. Use it for layout ideas only.
