import React from 'react';

export default function MessPlanList({ plans, onEdit, onDelete }) {
  return (
    <div className="card rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Mess Plans</h2>
        <div className="text-sm text-slate-300">Total: {plans.length}</div>
      </div>

      <div className="mt-3 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-300">
            <tr className="text-left">
              <th className="py-2">Plan</th>
              <th className="py-2">Cost</th>
              <th className="py-2">Meals</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p._id} className="border-t border-white/10">
                <td className="py-3">{p.planName}</td>
                <td className="py-3">{p.cost}</td>
                <td className="py-3">{Array.isArray(p.meals) ? p.meals.join(', ') : '-'}</td>
                <td className="py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button className="bg-white/10 hover:bg-white/15 px-3 py-1 rounded-lg" onClick={() => onEdit(p)}>
                      Edit
                    </button>
                    <button className="bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg" onClick={() => onDelete(p._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td className="py-6 text-slate-400" colSpan={4}>
                  No mess plans yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

