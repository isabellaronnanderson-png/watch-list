import { useState } from 'react'
import TabNav from './components/TabNav'
import WatchTab from './components/WatchTab'
import ReadTab from './components/ReadTab'
import ListenTab from './components/ListenTab'

export default function App() {
  const [tab, setTab] = useState('watch')

  return (
    <div className="app-shell">
      <TabNav active={tab} onChange={setTab} />
      {tab === 'watch' && <WatchTab />}
      {tab === 'read' && <ReadTab />}
      {tab === 'listen' && <ListenTab />}
    </div>
  )
}
