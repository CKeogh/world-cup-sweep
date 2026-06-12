import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/groups">Groups</NavLink>
          <NavLink to="/fixtures">Fixtures</NavLink>
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
