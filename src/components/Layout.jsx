import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

function Layout() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="layout">
      <header className={`header${navOpen ? ' nav-open' : ''}`}>
        <button className="hamburger" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation">
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>
        <nav onClick={() => setNavOpen(false)}>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/groups">Groups</NavLink>
          <NavLink to="/fixtures">Fixtures</NavLink>
          <NavLink to="/prizes">Prizes</NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} World Cup 2026 Sweepstake</p>
      </footer>
    </div>
  )
}

export default Layout
