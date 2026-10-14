import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [low, soon, expired, daily] = await Promise.all([
          api('/alerts/low-stock'),
          api('/alerts/expiring?days=30'),
          api('/alerts/expired'),
          isAdmin ? api('/reports/daily') : Promise.resolve(null),
        ]);
        setData({ low: low.length, soon: soon.length, expired: expired.length, daily });
      } catch (e) { setErr(e.message); }
    })();
  }, [isAdmin]);

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      {err && <div className="error">{err}</div>}
      {!data && !err && <p className="muted">Loading...</p>}
      {data && (
        <div className="grid">
          {data.daily && (
            <>
              <div className="card stat"><span className="muted">Today's sales</span><b>{money(data.daily.totalSales)}</b></div>
              <div className="card stat"><span className="muted">Invoices today</span><b>{data.daily.invoices}</b></div>
            </>
          )}
          <Link to="/alerts" className="card stat warn"><span className="muted">Low stock medicines</span><b>{data.low}</b></Link>
          <Link to="/alerts" className="card stat warn"><span className="muted">Expiring in 30 days</span><b>{data.soon}</b></Link>
          <Link to="/alerts" className="card stat danger"><span className="muted">Expired batches in stock</span><b>{data.expired}</b></Link>
        </div>
      )}
      <div className="row" style={{ marginTop: 24 }}>
        <Link className="btn primary" to="/billing">New bill</Link>
        <Link className="btn" to="/medicines">Manage medicines</Link>
      </div>
    </div>
  );
}
