import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'

import Home from './pages/Home'
import DonorProfileSetup from './pages/DonarProfileSetup'
import NGOProfileSetup from './pages/NgoProfileSetup'
import DonorDashboard from './pages/DonarDashboard'
import NGODashboard from './pages/NGODashboard'
import NGORequestPage from './pages/NGORequestPage'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/donor-profile" element={<DonorProfileSetup />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/ngo-profile" element={<NGOProfileSetup />} />
          <Route path="/ngo-dashboard" element={<NGODashboard />} />
          <Route path="/ngo-request" element={<NGORequestPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
