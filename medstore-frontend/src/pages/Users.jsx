import { useState } from 'react';
import { api } from '../api.js';

export default function Users() {
  const empty = { username: '', password: '', fullName: '', role: 'STAFF' };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr(''); setOk('');
    try {
      const u = await api('/users', { method: 'POST', body: f });
      setOk(`User "${u.username}" created as ${u.role}.`);
      setF(empty);
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <div>
      <h1>Users</h1>
      <form className="card form" style={{ maxWidth: 420 }} onSubmit={submit}>
        <h3>Create user</h3>
        {err && <div className="error">{err}</div>}
        {ok && <div className="success">{ok}</div>}
        <label>Full name<input value={f.fullName} onChange={set('fullName')} required /></label>
        <label>Username<input value={f.username} onChange={set('username')} required /></label>
        <label>Password (min 6)<input type="password" minLength="6" value={f.password} onChange={set('password')} required /></label>
        <label>Role
          <select value={f.role} onChange={set('role')}>
            <option value="STAFF">Staff (billing, view stock)</option>
            <option value="ADMIN">Admin (full access)</option>
          </select>
        </label>
        <button className="btn primary">Create user</button>
      </form>
    </div>
  );
}
