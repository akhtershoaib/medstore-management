import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Alerts() {
  const [days, setDays] = useState(60);
  const [low, setLow] = useState([]);
  const [soon, setSoon] = useState([]);
  const [expired, setExpired] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [l, e] = await Promise.all([api('/alerts/low-stock'), api('/alerts/expired')]);
        setLow(l); setExpired(e);
      } catch (ex) { setErr(ex.message); }
    })();
  }, []);

  useEffect(() => {
    api(`/alerts/expiring?days=${Number(days) || 60}`).then(setSoon).catch((e) => setErr(e.message));
  }, [days]);

  return (
    <div>
      <h1>Alerts</h1>
      {err && <div className="error">{err}</div>}

      <h3>Low stock ({low.length})</h3>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Medicine</th><th className="num">In stock</th><th className="num">Reorder level</th></tr></thead>
          <tbody>
            {low.map((m) => (
              <tr key={m.medicineId}><td>{m.medicine}</td><td className="num">{m.stock}</td><td className="num">{m.reorderLevel}</td></tr>
            ))}
            {low.length === 0 && <tr><td colSpan="3" className="muted center">Nothing low on stock</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="row between" style={{ marginTop: 24 }}>
        <h3>Expiring soon ({soon.length})</h3>
        <label className="inline">Within
          <input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} style={{ width: 70 }} /> days
        </label>
      </div>
      <BatchTable rows={soon} empty="No batches expiring in this period" />

      <h3 style={{ marginTop: 24 }}>Expired, still in stock ({expired.length})</h3>
      <BatchTable rows={expired} empty="No expired stock" />
    </div>
  );
}

function BatchTable({ rows, empty }) {
  return (
    <div className="card table-wrap">
      <table>
        <thead><tr><th>Medicine</th><th>Batch</th><th>Expiry</th><th className="num">Quantity</th></tr></thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.batchId}><td>{b.medicine}</td><td>{b.batchNo}</td><td>{b.expiryDate}</td><td className="num">{b.quantity}</td></tr>
          ))}
          {rows.length === 0 && <tr><td colSpan="4" className="muted center">{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
