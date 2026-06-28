import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Layout({ children, theme, onToggleTheme }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand__mark">✦</span>
          <span>Northstar Research</span>
        </Link>
        <nav className="topnav" aria-label="Primary navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label="Toggle color theme">
            <span>{theme === 'dark' ? '☀︎' : '☾'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </nav>
      </header>
      {children}
      <footer className="footer">
        <span>Northstar Research</span>
        <span>AI-Powered Investment Research</span>
        <span>© 2026 mohan</span>
      </footer>
    </div>
  )
}
