# Now Showing — a ticket-stub watchlist

A film/TV watchlist styled like a box office: each title is a torn ticket stub with its
runtime printed like a duration, and a genre/runtime/streaming-service filter bar styled
like the ticket window. Built with React + Vite, using the TMDB API for search, genres,
runtime, and regional streaming availability (watch/providers).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env file and add your TMDB key:
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

- **Search & add** (`src/components/Header.jsx`): searches TMDB's multi-search endpoint,
  then on "Add" fetches runtime and regional watch-provider details and snapshots them
  into the watchlist entry.
- **Storage** (`src/hooks/useWatchlist.js`): the watchlist lives in `localStorage`, scoped
  to the browser you're using it in. No backend, no login.
- **Filtering** (`src/App.jsx`): genre, runtime bucket, and streaming provider filters are
  derived live from whatever's currently in your watchlist, so the filter bar never shows
  options that don't apply to anything you've added.
- **Styling** (`src/index.css`): plain CSS with a small set of custom properties at the top
  (`--ink`, `--paper`, `--marquee-red`, `--ticket-gold`, `--reel-teal`) — no CSS framework,
  so it's easy to reskin. The ticket-stub perforation effect is two circles matching the
  page background, punched into the card at the divider line.

## A note on the API key

This is a client-side-only app, which means your TMDB key ends up visible in the built
JavaScript bundle (anyone who opens dev tools on your deployed site could read it). TMDB's
free tier is rate-limited per key rather than tied to billing, so for a personal project
this is a common and low-risk tradeoff. If you ever want to hide the key, the fix is to add
a tiny serverless function (a single Vercel/Netlify function that proxies requests to TMDB)
so the key never reaches the browser — happy to help you add that later if you want it.

## Extending it

Some natural next steps, roughly in order of effort:
- Add a "notes" field per ticket (why you added it, who recommended it).
- Add a second list for "watched" as its own tab instead of a dimmed state.
- Swap `localStorage` for a small backend (e.g. Supabase) if you want it to sync across
  devices later — `useWatchlist.js` is the only file that would need to change.
- Add trailer links via TMDB's `/movie/{id}/videos` endpoint.
