import { useEffect, useState } from 'react';
import { api, money } from '../api.js';
import Invoice from '../components/Invoice.jsx';

export default function Billing() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [discount, setDiscount] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sale, setSale] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      try { setResults(await api(`/medicines?search=${encodeURIComponent(q)}`)); }
      catch (e) { setErr(e.message); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, sale]);

  function add(m) {
    setCart((c) => {
      const ex = c.find((i) => i.id === m.id);
      if (ex) return c.map((i) => (i.id === m.id ? { ...i, qty: Math.min(i.qty + 1, m.stock) } : i));
      return [...c, { id: m.id, name: m.name, mrp: m.mrp, stock: m.stock, qty: 1 }];
    });
  }
  const setQty = (id, v) =>
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(Number(v) || 1, i.stock)) } : i)));
  const remove = (id) => setCart((c) => c.filter((i) => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.mrp * i.qty, 0);
  const disc = Number(discount) || 0;
  const total = subtotal - disc;

  async function checkout() {
    setErr('');
    if (disc < 0 || disc > subtotal) { setErr('Discount must be between 0 and the bill amount'); return; }
    setBusy(true);
    try {
      const res = await api('/sales', {
        method: 'POST',
        body: { customerName: customer, discount: disc, items: cart.map((i) => ({ medicineId: i.id, quantity: i.qty })) },
      });
      setSale(res);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  function newBill() {
    setSale(null); setCart([]); setCustomer(''); setDiscount(''); setQ(''); setErr('');
  }

  if (sale) {
    return (
      <div>
        <div className="row no-print">
          <button className="btn primary" onClick={() => window.print()}>Print invoice</button>
          <button className="btn" onClick={newBill}>New bill</button>
        </div>
        <div className="card"><Invoice sale={sale} /></div>
      </div>
    );
  }

  return (
    <div>
      <h1>Billing</h1>
      {err && <div className="error">{err}</div>}
      <div className="two-col">
        <div>
          <input className="search" placeholder="Search medicine to add..." value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          <div className="card table-wrap">
            <table>
              <thead><tr><th>Medicine</th><th className="num">MRP</th><th className="num">Stock</th><th></th></tr></thead>
              <tbody>
                {results.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}<div className="muted small-text">{m.manufacturer}</div></td>
                    <td className="num">{money(m.mrp)}</td>
                    <td className="num">{m.stock}</td>
                    <td className="actions">
                      <button className="btn small primary" disabled={m.stock === 0} onClick={() => add(m)}>
                        {m.stock === 0 ? 'Out of stock' : 'Add'}
                      </button>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && <tr><td colSpan="4" className="muted center">No medicines found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card cart">
          <h3>Current bill</h3>
          {cart.length === 0 && <p className="muted">Add medicines from the list.</p>}
          {cart.map((i) => (
            <div className="cart-line" key={i.id}>
              <div>
                <div>{i.name}</div>
                <div className="muted small-text">{money(i.mrp)} each &middot; max {i.stock}</div>
              </div>
              <input type="number" min="1" max={i.stock} value={i.qty} onChange={(e) => setQty(i.id, e.target.value)} />
              <b>{money(i.mrp * i.qty)}</b>
              <button className="btn small danger" onClick={() => remove(i.id)}>x</button>
            </div>
          ))}
          <label>Customer name (optional)
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </label>
          <label>Discount (₹)
            <input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </label>
          <div className="totals">
            <div><span>Subtotal (incl. GST)</span><span>{money(subtotal)}</span></div>
            <div><span>Discount</span><span>- {money(disc)}</span></div>
            <div className="grand"><span>Total</span><span>{money(total)}</span></div>
          </div>
          <button className="btn primary" disabled={cart.length === 0 || busy} onClick={checkout}>
            {busy ? 'Saving...' : 'Generate invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
