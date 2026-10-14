import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <h2>MedStore</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/billing">Billing</NavLink>
          <NavLink to="/medicines">Medicines</NavLink>
          <NavLink to="/alerts">Alerts</NavLink>
          {isAdmin && <NavLink to="/reports">Reports</NavLink>}
          {isAdmin && <NavLink to="/users">Users</NavLink>}
        </nav>
        <div className="sidebar-foot">
          <div>{user.username} <span className="badge">{user.role}</span></div>
          <button className="btn small" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
  );
}
