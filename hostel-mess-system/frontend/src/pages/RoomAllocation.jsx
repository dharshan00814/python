import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export default function RoomAllocation() {
  const [students, setStudents] = useState([]);
  const [roomNo, setRoomNo] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    api
      .getStudents()
      .then(setStudents)
      .catch((e) => setError(e.message));
  }, []);

  const selectedStudent = useMemo(
    () => students.find((s) => s._id === selectedStudentId),
    [students, selectedStudentId]
  );

  useEffect(() => {
    setRoomNo(selectedStudent?.roomNo || '');
  }, [selectedStudent]);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setOk('');

    if (!selectedStudentId) return setError('Select a student.');
    const rn = roomNo.trim();
    await api.updateStudent(selectedStudentId, { roomNo: rn });
    const fresh = await api.getStudents();
    setStudents(fresh);
    setOk('Room allocation updated.');
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card2 rounded-2xl p-5">
          <h1 className="text-2xl font-bold">Room Allocation</h1>
          {error && <div className="mt-2 text-red-300 text-sm">{error}</div>}
          {ok && <div className="mt-2 text-emerald-300 text-sm">{ok}</div>}

          <form onSubmit={handleSave} className="mt-4">
            <div>
              <label className="text-sm text-slate-300">Student</label>
              <select
                className="input w-full rounded-lg px-3 py-2 mt-1"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Select...</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <label className="text-sm text-slate-300">Room No</label>
              <input
                className="input w-full rounded-lg px-3 py-2 mt-1"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
              />
            </div>

            <button className="mt-4 w-full bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg py-2 font-semibold" type="submit">
              Save Allocation
            </button>
          </form>
        </div>

        <div className="card rounded-2xl p-5">
          <h2 className="font-semibold">Current Allocations</h2>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-300">
                <tr className="text-left">
                  <th className="py-2">Name</th>
                  <th className="py-2">Roll No</th>
                  <th className="py-2">Room</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-t border-white/10">
                    <td className="py-3">{s.name}</td>
                    <td className="py-3">{s.rollNo}</td>
                    <td className="py-3">{s.roomNo || '-'}</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td className="py-6 text-slate-400" colSpan={3}>
                      No students.
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

