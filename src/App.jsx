import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Groups from './pages/Groups'
import Fixtures from './pages/Fixtures'
import Prizes from './pages/Prizes'
import BadBoyRankings from './pages/BadBoyRankings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="groups" element={<Groups />} />
        <Route path="fixtures" element={<Fixtures />} />
        <Route path="prizes" element={<Prizes />} />
        <Route path="prizes/bad-boys" element={<BadBoyRankings />} />
      </Route>
    </Routes>
  )
}

export default App
