import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SmartGuide from './pages/SmartGuide'
import MallMap from './pages/MallMap'
import Analytics from './pages/Analytics'
import Experiment from './pages/Experiment'
import About from './pages/About'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="guide" element={<SmartGuide />} />
        <Route path="map" element={<MallMap />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="experiment" element={<Experiment />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}

export default App
