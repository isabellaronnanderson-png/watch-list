import { useState } from 'react'
import SiteHeader from './components/SiteHeader'
import TabNav from './components/TabNav'
import WatchTab from './components/WatchTab'
import ReadTab from './components/ReadTab'
import ListenTab from './components/ListenTab'
import GamesTab from './components/GamesTab'
import WatchLaterTab from './components/WatchLaterTab'
import ArticlesTab from './components/ArticlesTab'

const VALID_TABS = ['watch', 'read', 'listen', 'games', 'watchlater', 'articles']
const STORAGE_KEY = 'marquee-watchlist:active-tab'

function loadTab() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return VALID_TABS.includes(saved) ? saved : 'watch'
  } catch {
    return 'watch'
  }
}

export default function App() {
  const [tab, setTab] = useState(loadTab)

  function handleChange(next) {
    setTab(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage unavailable - tab just won't persist, not worth surfacing an error for.
    }
  }

  return (
    <div className={`app-shell tab-${tab}`}>
      <SiteHeader />
      <TabNav active={tab} onChange={handleChange} />
      {tab === 'watch' && <WatchTab />}
      {tab === 'read' && <ReadTab />}
      {tab === 'listen' && <ListenTab />}
      {tab === 'games' && <GamesTab />}
      {tab === 'watchlater' && <WatchLaterTab />}
      {tab === 'articles' && <ArticlesTab />}
    </div>
  )
}
