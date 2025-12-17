import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MapPage } from './pages/MapPage';
import { SitePage } from './pages/SitePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/site/:siteId" element={<SitePage />} />
      </Routes>
    </Router>
  );
}

export default App
