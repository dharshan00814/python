import React from 'react';

export default function StudentList({ students, onEdit, onDelete }) {
  return (
    <div className="card rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Students</h2>
        <div className="text-sm text-slate-300">Total: {students.length}</div>
      </div>

      <div className="mt-3 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-300">
            <tr className="text-left">
              <th className="py-2">Name</th>
              <th className="py-2">Roll No</th>
              <th className="py-2">Room</th>
              <th className="py-2">Mess</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-t border-white/10">
                <td className="py-3">{s.name}</td>
                <td className="py-3">{s.rollNo}</td>
                <td className="py-3">{s.roomNo || '-'}</td>
                <td className="py-3">{s.messPlan?.planName || '-'}</td>
                <td className="py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button className="bg-white/10 hover:bg-white/15 px-3 py-1 rounded-lg" onClick={() => onEdit(s)}>
                      Edit
                    </button>
                    <button className="bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg" onClick={() => onDelete(s._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td className="py-6 text-slate-400" colSpan={5}>
                  No students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

