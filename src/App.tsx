import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/Navbar/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import MainPage from './pages/MainPage'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<MainPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
