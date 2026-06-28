import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Layout({ children, theme, onToggleTheme }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand__mark">✦</span>
          <span>InvestClear</span>
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
        <span>InvestClear</span>
        <span>Investment Research Agent</span>
        <span>© 2026 Mohan</span>
      </footer>
    </div>
  )
}
