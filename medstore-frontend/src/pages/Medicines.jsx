import { useCallback, useEffect, useState } from 'react';
import { api, money } from '../api.js';
import { useAuth } from '../auth.jsx';
import Modal from '../components/Modal.jsx';

const EMPTY = { name: '', category: '', manufacturer: '', mrp: '', gstPercent: 12, reorderLevel: 10 };

export default function Medicines() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState(null);
  const [batchFor, setBatchFor] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await api(`/medicines?search=${encodeURIComponent(search)}`));
      setErr('');
    } catch (e) { setErr(e.message); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function remove(m) {
    if (!window.confirm(`Remove ${m.name}? Old invoices are kept.`)) return;
    try { await api(`/medicines/${m.id}`, { method: 'DELETE' }); load(); }
    catch (e) { setErr(e.message); }
  }

  return (
    <div>
      <div className="row between">
        <h1>Medicines</h1>
        {isAdmin && <button className="btn primary" onClick={() => setEditing(EMPTY)}>Add medicine</button>}
      </div>
      <input className="search" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {err && <div className="error">{err}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Category</th><th>Manufacturer</th><th className="num">MRP</th><th className="num">GST %</th><th className="num">Stock</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td><td>{m.category}</td><td>{m.manufacturer}</td>
                <td className="num">{money(m.mrp)}</td>
                <td className="num">{m.gstPercent}</td>
                <td className="num">
                  <span className={m.stock < m.reorderLevel ? 'pill danger' : 'pill ok'}>{m.stock}</span>
                </td>
                <td className="actions">
                  <button className="btn small" onClick={() => setBatchFor(m)}>Batches</button>
                  {isAdmin && <button className="btn small" onClick={() => setEditing(m)}>Edit</button>}
                  {isAdmin && <button className="btn small danger" onClick={() => remove(m)}>Delete</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="7" className="muted center">No medicines found</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <MedicineForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      {batchFor && <BatchPanel medicine={batchFor} onClose={() => setBatchFor(null)} onChanged={load} />}
    </div>
  );
}

function MedicineForm({ initial, onClose, onSaved }) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const body = {
      name: f.name, category: f.category, manufacturer: f.manufacturer,
      mrp: Number(f.mrp), gstPercent: Number(f.gstPercent), reorderLevel: Number(f.reorderLevel),
    };
    try {
      if (f.id) await api(`/medicines/${f.id}`, { method: 'PUT', body });
      else await api('/medicines', { method: 'POST', body });
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <Modal title={f.id ? 'Edit medicine' : 'Add medicine'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        {err && <div className="error">{err}</div>}
        <label>Name<input value={f.name} onChange={set('name')} required /></label>
        <label>Category<input value={f.category || ''} onChange={set('category')} placeholder="Tablet, Syrup..." /></label>
        <label>Manufacturer<input value={f.manufacturer || ''} onChange={set('manufacturer')} /></label>
        <div className="row">
          <label>MRP (incl. GST)<input type="number" step="0.01" min="0.01" value={f.mrp} onChange={set('mrp')} required /></label>
          <label>GST %<input type="number" step="0.01" min="0" value={f.gstPercent} onChange={set('gstPercent')} required /></label>
          <label>Reorder level<input type="number" min="0" value={f.reorderLevel} onChange={set('reorderLevel')} required /></label>
        </div>
        <button className="btn primary">Save</button>
      </form>
    </Modal>
  );
}

function BatchPanel({ medicine, onClose, onChanged }) {
  const { isAdmin } = useAuth();
  const [batches, setBatches] = useState([]);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ batchNo: '', expiryDate: '', quantity: '', purchasePrice: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = useCallback(async () => {
    try { setBatches(await api(`/medicines/${medicine.id}/batches`)); }
    catch (e) { setErr(e.message); }
  }, [medicine.id]);
  useEffect(() => { load(); }, [load]);

  async function add(e) {
    e.preventDefault(); setErr('');
    try {
      await api(`/medicines/${medicine.id}/batches`, {
        method: 'POST',
        body: { batchNo: f.batchNo, expiryDate: f.expiryDate, quantity: Number(f.quantity), purchasePrice: Number(f.purchasePrice) },
      });
      setF({ batchNo: '', expiryDate: '', quantity: '', purchasePrice: '' });
      load(); onChanged();
    } catch (ex) { setErr(ex.message); }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Modal title={`Batches: ${medicine.name}`} onClose={onClose} wide>
      {err && <div className="error">{err}</div>}
      <table>
        <thead><tr><th>Batch no</th><th>Expiry</th><th className="num">Qty left</th><th className="num">Purchase price</th></tr></thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.id}>
              <td>{b.batchNo}</td>
              <td>{b.expiryDate} {b.expiryDate < today && <span className="pill danger">expired</span>}</td>
              <td className="num">{b.quantity}</td>
              <td className="num">{money(b.purchasePrice)}</td>
            </tr>
          ))}
          {batches.length === 0 && <tr><td colSpan="4" className="muted center">No batches yet</td></tr>}
        </tbody>
      </table>
      {isAdmin && (
        <form onSubmit={add} className="form" style={{ marginTop: 16 }}>
          <h4>Add stock (new batch)</h4>
          <div className="row">
            <label>Batch no<input value={f.batchNo} onChange={set('batchNo')} required /></label>
            <label>Expiry date<input type="date" min={today} value={f.expiryDate} onChange={set('expiryDate')} required /></label>
            <label>Quantity<input type="number" min="1" value={f.quantity} onChange={set('quantity')} required /></label>
            <label>Purchase price<input type="number" step="0.01" min="0.01" value={f.purchasePrice} onChange={set('purchasePrice')} required /></label>
          </div>
          <button className="btn primary">Add batch</button>
        </form>
      )}
    </Modal>
  );
}
