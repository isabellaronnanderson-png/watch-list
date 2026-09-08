import { useState } from 'react'
import { AuthProvider } from './hooks/AuthContext'
import AuthGate from './components/AuthGate'
import SiteHeader from './components/SiteHeader'
import TabNav from './components/TabNav'
import WatchTab from './components/WatchTab'
import ReadTab from './components/ReadTab'
import ListenTab from './components/ListenTab'
import AlbumsTab from './components/AlbumsTab'
import GamesTab from './components/GamesTab'
import WatchLaterTab from './components/WatchLaterTab'
import ArticlesTab from './components/ArticlesTab'

function AppShell() {
  const [tab, setTab] = useState('watch')

  return (
    <div className={`app-shell tab-${tab}`}>
      <SiteHeader />
      <TabNav active={tab} onChange={setTab} />
      {tab === 'watch' && <WatchTab />}
      {tab === 'read' && <ReadTab />}
      {tab === 'listen' && <ListenTab />}
      {tab === 'albums' && <AlbumsTab />}
      {tab === 'games' && <GamesTab />}
      {tab === 'watchlater' && <WatchLaterTab />}
      {tab === 'articles' && <ArticlesTab />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </AuthProvider>
  )
}
