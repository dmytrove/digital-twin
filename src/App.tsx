import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages for better performance
const MapPage = lazy(() => import('./pages/MapPage').then(module => ({ default: module.MapPage })));
const SitePage = lazy(() => import('./pages/SitePage').then(module => ({ default: module.SitePage })));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading BIM Viewer...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/site/:siteId" element={<SitePage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App
