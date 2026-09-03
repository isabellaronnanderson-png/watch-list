import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './Header'
import FilterBar from './FilterBar'
import TicketGrid, { EmptyState } from './TicketGrid'
import { useWatchlist } from '../hooks/useWatchlist'
import { getGenreMaps, getDetails } from '../api/tmdb'
import { RUNTIME_BUCKETS } from '../utils/format'

const EMPTY_FILTERS = {
  genres: new Set(),
  runtimes: new Set(),
  providers: new Set(),
  mediaTypes: new Set(),
  statuses: new Set(),
  tags: new Set(),
  ratings: new Set(),
  sort: 'title',
}

export default function WatchTab() {
  const {
    items,
    addItem,
    removeItem,
    setStatus,
    setRating,
    toggleSeason,
    updateSeasonCount,
    toggleTag,
    renameTag,
    deleteTag,
  } = useWatchlist()
  const [genreMaps, setGenreMaps] = useState(null)
  const [configError, setConfigError] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [justCompletedIds, setJustCompletedIds] = useState(new Set())
  const checkedForNewSeasons = useRef(false)

  useEffect(() => {
    getGenreMaps()
      .then(setGenreMaps)
      .catch((err) => setConfigError(err.message))
  }, [])

  // Once per app load, quietly re-check TMDB for TV shows to see if a new season
  // has aired since it was added. If so, extend the seasons array (unwatched) and
  // let the status fall back out of "watched" so it resurfaces in the main list.
  useEffect(() => {
    if (checkedForNewSeasons.current) return
    checkedForNewSeasons.current = true
    const tvItems = items.filter((i) => i.mediaType === 'tv' && Array.isArray(i.seasons))
    tvItems.forEach((item) => {
      getDetails('tv', item.tmdbId)
        .then((details) => {
          if (details.numberOfSeasons && details.numberOfSeasons > item.seasons.length) {
            updateSeasonCount(item.id, details.numberOfSeasons)
          }
        })
        .catch(() => {
          // Silently ignore - not worth surfacing an error banner for a background check.
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const existingIds = useMemo(() => new Set(items.map((i) => i.id)), [items])

  const allGenres = useMemo(() => {
    const s = new Set()
    items.forEach((i) => i.genres?.forEach((g) => s.add(g)))
    return Array.from(s).sort()
  }, [items])

  const allTags = useMemo(() => {
    const s = new Set()
    items.forEach((i) => i.tags?.forEach((t) => s.add(t)))
    return Array.from(s).sort()
  }, [items])

  const tagFilterOptions = useMemo(() => {
    const others = allTags.filter((t) => t !== 'Favorite')
    return ['Favorite', ...others]
  }, [allTags])

  function toggleSetValue(setName, value) {
    setFilters((prev) => {
      const next = new Set(prev[setName])
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return { ...prev, [setName]: next }
    })
  }

  // Marking something Watched removes it from the default view - but if it
  // just happened this session, keep it visible (dimmed) until the person
  // acts on the rating prompt, rather than yanking the card out from under them.
  function handleSetStatus(id, status) {
    if (status === 'watched') {
      setJustCompletedIds((prev) => new Set(prev).add(id))
    }
    setStatus(id, status)
  }

  function handleToggleSeason(id, seasonIndex) {
    const item = items.find((i) => i.id === id)
    if (item?.seasons) {
      const willComplete = !item.seasons[seasonIndex] && item.seasons.every((s, idx) => (idx === seasonIndex ? true : s))
      if (willComplete) {
        setJustCompletedIds((prev) => new Set(prev).add(id))
      }
    }
    toggleSeason(id, seasonIndex)
  }

  function handleSetRating(id, rating) {
    setJustCompletedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setRating(id, rating)
  }

  const hasActiveFilters =
    filters.genres.size > 0 ||
    filters.runtimes.size > 0 ||
    filters.providers.size > 0 ||
    filters.mediaTypes.size > 0 ||
    filters.statuses.size > 0 ||
    filters.tags.size > 0 ||
    filters.ratings.size > 0

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => {
      if (filters.mediaTypes.size > 0 && !filters.mediaTypes.has(item.mediaType)) {
        return false
      }
      if (filters.statuses.size > 0) {
        if (!filters.statuses.has(item.status)) return false
      } else if (
        item.status === 'watched' &&
        filters.tags.size === 0 &&
        !justCompletedIds.has(item.id)
      ) {
        // Finished titles stay out of the way by default; select "Watched" to see
        // them, or filter by a tag - tagged items (rewatch favorites etc.) stay
        // visible regardless of watched status. Items that JUST finished this
        // session stay visible too, until rated or the prompt is dismissed.
        return false
      }
      if (filters.genres.size > 0) {
        const hasGenre = item.genres?.some((g) => filters.genres.has(g))
        if (!hasGenre) return false
      }
      if (filters.tags.size > 0) {
        const hasTag = item.tags?.some((t) => filters.tags.has(t))
        if (!hasTag) return false
      }
      if (filters.runtimes.size > 0) {
        const bucketMatch = RUNTIME_BUCKETS.some(
          (b) => filters.runtimes.has(b.id) && b.test(item.runtimeMinutes)
        )
        if (!bucketMatch) return false
      }
      if (filters.providers.size > 0) {
        const hasProvider = item.providerIds?.some((pid) => filters.providers.has(pid))
        if (!hasProvider) return false
      }
      if (filters.ratings.size > 0 && !filters.ratings.has(item.rating)) return false
      return true
    })

    list = [...list].sort((a, b) => {
      if (filters.sort === 'title') return a.title.localeCompare(b.title)
      if (filters.sort === 'runtime')
        return (a.runtimeMinutes || 9999) - (b.runtimeMinutes || 9999)
      return b.addedAt - a.addedAt
    })

    return list
  }, [items, filters, justCompletedIds])

  const watchingItems = visibleItems.filter((i) => i.status === 'watching')
  const restItems = visibleItems.filter((i) => i.status !== 'watching')

  return (
    <>
      <Header onAdd={addItem} existingIds={existingIds} genreMaps={genreMaps} />

      {configError && (
        <div className="config-warning">
          {configError} — copy <code>.env.example</code> to <code>.env</code>, add your key, and
          restart the dev server.
        </div>
      )}

      <FilterBar
        allGenres={allGenres}
        allTags={tagFilterOptions}
        filters={filters}
        onToggleGenre={(g) => toggleSetValue('genres', g)}
        onToggleRuntime={(r) => toggleSetValue('runtimes', r)}
        onToggleProvider={(p) => toggleSetValue('providers', p)}
        onToggleMediaType={(t) => toggleSetValue('mediaTypes', t)}
        onToggleStatus={(s) => toggleSetValue('statuses', s)}
        onToggleTag={(t) => toggleSetValue('tags', t)}
        onRenameTag={renameTag}
        onDeleteTag={deleteTag}
        onToggleRating={(r) => toggleSetValue('ratings', r)}
        onSortChange={(sort) => setFilters((prev) => ({ ...prev, sort }))}
        onClear={() => setFilters(EMPTY_FILTERS)}
        hasActiveFilters={hasActiveFilters}
      />

      {watchingItems.length > 0 && (
        <>
          <p className="section-heading section-heading-highlight">
            Currently watching · {watchingItems.length}
          </p>
          <TicketGrid
            items={watchingItems}
            onSetStatus={handleSetStatus}
            onToggleSeason={handleToggleSeason}
            onRemove={removeItem}
            onToggleTag={toggleTag}
            onSetRating={handleSetRating}
            allTags={allTags}
            inWatchingSection
            dimDone={filters.tags.size === 0}
          />
          <div className="section-divider" />
        </>
      )}

      <p className="section-heading">
        {restItems.length} title{restItems.length === 1 ? '' : 's'} on the reel
      </p>

      {restItems.length > 0 ? (
        <TicketGrid
          items={restItems}
          onSetStatus={handleSetStatus}
          onToggleSeason={handleToggleSeason}
          onRemove={removeItem}
          onToggleTag={toggleTag}
          onSetRating={handleSetRating}
          allTags={allTags}
          dimDone={filters.tags.size === 0}
        />
      ) : (
        watchingItems.length === 0 && <EmptyState hasAnyItems={items.length > 0} />
      )}
    </>
  )
}
