import { useState } from 'react'
import SiteHeader from './components/SiteHeader'
import TabNav from './components/TabNav'
import WatchTab from './components/WatchTab'
import ReadTab from './components/ReadTab'
import ListenTab from './components/ListenTab'
import GamesTab from './components/GamesTab'
import WatchLaterTab from './components/WatchLaterTab'
import ArticlesTab from './components/ArticlesTab'

export default function App() {
  const [tab, setTab] = useState('watch')

  return (
    <div className="app-shell">
      <SiteHeader />
      <TabNav active={tab} onChange={setTab} />
      {tab === 'watch' && <WatchTab />}
      {tab === 'read' && <ReadTab />}
      {tab === 'listen' && <ListenTab />}
      {tab === 'games' && <GamesTab />}
      {tab === 'watchlater' && <WatchLaterTab />}
      {tab === 'articles' && <ArticlesTab />}
    </div>
  )
}
