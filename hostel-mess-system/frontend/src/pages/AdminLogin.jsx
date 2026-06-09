import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('change-me');
  const [error, setError] = useState('');
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api.loginAdmin({ username, password });
      localStorage.setItem('adminToken', data.token);
      nav('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card2 rounded-2xl p-6">
        <h1 className="text-xl font-bold">Admin Login</h1>
        <p className="text-slate-300 text-sm mt-1">JWT protected dashboard</p>

        <form onSubmit={handleSubmit} className="mt-5">
          <div>
            <label className="text-sm text-slate-300">Username</label>
            <input className="input w-full rounded-lg px-3 py-2 mt-1" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mt-3">
            <label className="text-sm text-slate-300">Password</label>
            <input className="input w-full rounded-lg px-3 py-2 mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <div className="mt-3 text-red-300 text-sm">{error}</div>}

          <button type="submit" className="mt-5 w-full bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg py-2 font-semibold">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

