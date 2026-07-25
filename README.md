# Now Showing — a ticket-stub watchlist, reading list & listen queue

A media tracker styled like a box office: three tabs — **Watch**, **Read**, **Listen** —
each themed to its content. Watch keeps the original ticket-stub design (TMDB search,
genre/runtime/type/streaming-service filters, per-season watched tracking for TV). Read
is a library-card styled book list (Open Library search, no API key needed). Listen is a
grid of square Audible-style tiles for audiobooks, plus a manual "add your own" form for
podcast episodes or anything without a good public API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env file and add your TMDB key (only needed for the Watch tab — Read and
   Listen use Open Library, which requires no key):
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set:
   - `VITE_TMDB_API_KEY` — your TMDB v3 API key (from https://www.themoviedb.org/settings/api)
   - `VITE_TMDB_REGION` — two-letter region code for streaming availability, e.g. `GB`, `SE`, `US`

3. Run it locally:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
   This outputs static files to `dist/`, which you can deploy to Netlify, Vercel, GitHub
   Pages, Cloudflare Pages, or any static host. Set the two env vars above as build-time
   environment variables in whatever host you use (they get baked into the build).

## How it works

- **Tabs** (`src/App.jsx`, `src/components/TabNav.jsx`): a simple state switch between
  three independent tab components — `WatchTab.jsx`, `ReadTab.jsx`, `ListenTab.jsx`. Each
  tab has its own search header, its own storage key, and its own filters.
- **Watch** (`WatchTab.jsx`, `Header.jsx`, `FilterBar.jsx`, `TicketCard.jsx`): searches
  TMDB, snapshots runtime + streaming providers on add, filters by genre/runtime/type/
  provider. TV shows track watched status per season — the season dots fill in gold as
  you check them off, and the whole ticket dims once every season is watched.
- **Read** (`ReadTab.jsx`, `ReadHeader.jsx`, `BookTicket.jsx`): searches Open Library
  (`src/api/openLibrary.js`), a free/keyless book database. Filter by genre and read
  status.
- **Listen** (`ListenTab.jsx`, `ListenHeader.jsx`, `ListenTile.jsx`): audiobooks are
  searched via the same Open Library API and rendered as square cover tiles. Anything
  without a good API — podcast episodes, one-off tracks — gets added through a small
  manual form (title, show/artist, notes) instead.
- **Storage** (`src/hooks/useWatchlist.js`, `useReadlist.js`, `useListenlist.js`): each
  tab's list lives in its own `localStorage` key, scoped to the browser you're using.
  No backend, no login.
- **Streaming providers** (`src/utils/providers.js`): TMDB returns many near-duplicate
  provider names (e.g. "Netflix" vs "Netflix Standard with Ads"). This file collapses
  them into a fixed, curated set of chips — Netflix, Disney+, HBO Max, Apple TV,
  Crunchyroll, BBC iPlayer, NOW, ITVX, Mubi, Channel 4, plus a "Rent / Buy" catch-all —
  shown even when nothing in your list currently uses them.
- **Styling** (`src/index.css`): plain CSS with a small set of custom properties at the
  top (`--ink`, `--paper`, `--marquee-red`, `--ticket-gold`, `--reel-teal`) — no CSS
  framework, so it's easy to reskin.

## A note on the API keys

This is a client-side-only app, which means your TMDB key ends up visible in the built
JavaScript bundle (anyone who opens dev tools on your deployed site could read it). TMDB's
free tier is rate-limited per key rather than tied to billing, so for a personal project
this is a common and low-risk tradeoff. Open Library requires no key at all, so the Read
and Listen tabs don't have this consideration. If you ever want to hide the TMDB key, the
fix is to add a tiny serverless function that proxies requests to TMDB so the key never
reaches the browser — happy to help you add that later if you want it.

Note on Goodreads: their public API stopped issuing new developer keys in December 2020
and hasn't reopened since, which is why Read/Listen use Open Library instead.

## Extending it

Some natural next steps, roughly in order of effort:
- Add a "notes" field per ticket (why you added it, who recommended it).
- Add trailer links via TMDB's `/movie/{id}/videos` endpoint.
- Add a YouTube "long videos" list — would need a YouTube Data API v3 key (free tier,
  quota-limited) via Google Cloud Console.
- Swap `localStorage` for a small backend (e.g. Supabase) if you want it to sync across
  devices later — the three hooks in `src/hooks/` are the only files that would need to
  change.

