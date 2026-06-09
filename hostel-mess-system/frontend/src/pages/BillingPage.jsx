import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export default function BillingPage() {
  const [students, setStudents] = useState([]);
  const [billing, setBilling] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    api.getStudents().then(setStudents).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedStudent = useMemo(() => students.find((s) => s._id === studentId), [students, studentId]);

  useEffect(() => {
    if (!studentId) return;
    api
      .getBillingByStudent(studentId)
      .then(setBilling)
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setOk('');

    if (!studentId) return setError('Select a student.');
    const n = Number(amount);
    if (Number.isNaN(n) || n <= 0) return setError('Amount must be > 0.');

    await api.createBilling({ studentId, amount: n, date });
    setAmount('');
    const fresh = await api.getBillingByStudent(studentId);
    setBilling(fresh);
    setOk('Billing record added.');
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card2 rounded-2xl p-5">
          <h1 className="text-2xl font-bold">Billing</h1>
          {error && <div className="mt-2 text-red-300 text-sm">{error}</div>}
          {ok && <div className="mt-2 text-emerald-300 text-sm">{ok}</div>}

          <form onSubmit={handleAdd} className="mt-4">
            <div>
              <label className="text-sm text-slate-300">Student</label>
              <select
                className="input w-full rounded-lg px-3 py-2 mt-1"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select...</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="mt-3 text-sm text-slate-200/90">
                Room: <span className="text-slate-100">{selectedStudent.roomNo || '-'}</span>
              </div>
            )}

            <div className="mt-3">
              <label className="text-sm text-slate-300">Amount</label>
              <input className="input w-full rounded-lg px-3 py-2 mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>

            <div className="mt-3">
              <label className="text-sm text-slate-300">Date</label>
              <input type="date" className="input w-full rounded-lg px-3 py-2 mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg py-2 font-semibold">
              Add Billing Record
            </button>
          </form>
        </div>

        <div className="card rounded-2xl p-5">
          <h2 className="font-semibold">Billing History</h2>
          <div className="mt-2 text-sm text-slate-300">
            {selectedStudent ? `For ${selectedStudent.name}` : 'Select a student to view history.'}
          </div>

          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-300">
                <tr className="text-left">
                  <th className="py-2">Date</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {billing.map((b) => (
                  <tr key={b._id} className="border-t border-white/10">
                    <td className="py-3">{new Date(b.date).toISOString().slice(0, 10)}</td>
                    <td className="py-3">{b.amount}</td>
                  </tr>
                ))}
                {billing.length === 0 && (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={2}>
                      No billing records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

