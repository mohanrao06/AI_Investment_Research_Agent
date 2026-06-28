import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('northstar-theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('northstar-theme', theme)
  }, [theme])

  return (
    <BrowserRouter>
      <Layout theme={theme} onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}