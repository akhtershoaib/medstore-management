import { useState } from 'react';
import { api, money } from '../api.js';

export default function Reports() {
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  async function run(path, label) {
    setErr('');
    try { setResult({ label, ...(await api(path)) }); }
    catch (e) { setErr(e.message); setResult(null); }
  }

  return (
    <div>
      <h1>Sales reports</h1>
      {err && <div className="error">{err}</div>}
      <div className="grid">
        <div className="card form">
          <h3>Daily</h3>
          <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <button className="btn primary" onClick={() => run(`/reports/daily?date=${date}`, date)}>Show</button>
        </div>
        <div className="card form">
          <h3>Monthly</h3>
          <div className="row">
            <label>Year<input type="number" value={year} onChange={(e) => setYear(e.target.value)} /></label>
            <label>Month<input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
          </div>
          <button className="btn primary" onClick={() => run(`/reports/monthly?year=${year}&month=${month}`, `${year}-${String(month).padStart(2, '0')}`)}>Show</button>
        </div>
      </div>
      {result && (
        <div className="grid" style={{ marginTop: 16 }}>
          <div className="card stat"><span className="muted">Period</span><b>{result.label}</b></div>
          <div className="card stat"><span className="muted">Invoices</span><b>{result.invoices}</b></div>
          <div className="card stat"><span className="muted">Total sales</span><b>{money(result.totalSales)}</b></div>
        </div>
      )}
    </div>
  );
}
