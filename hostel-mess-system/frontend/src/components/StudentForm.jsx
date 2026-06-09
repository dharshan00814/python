import React, { useEffect, useState } from 'react';

export default function StudentForm({ messPlans, initialValue, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValue?.name || '');
  const [rollNo, setRollNo] = useState(initialValue?.rollNo || '');
  const [roomNo, setRoomNo] = useState(initialValue?.roomNo || '');
  const [messPlanId, setMessPlanId] = useState(initialValue?.messPlan?._id || initialValue?.messPlan || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialValue?.name || '');
    setRollNo(initialValue?.rollNo || '');
    setRoomNo(initialValue?.roomNo || '');
    setMessPlanId(initialValue?.messPlan?._id || initialValue?.messPlan || '');
  }, [initialValue]);

  function validate() {
    if (!name.trim()) return 'Name is required.';
    if (!rollNo.trim()) return 'Roll No is required.';
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    onSubmit({
      name: name.trim(),
      rollNo: rollNo.trim(),
      roomNo: roomNo.trim(),
      messPlan: messPlanId || null
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card2 rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-300">Name</label>
          <input className="input w-full rounded-lg px-3 py-2 mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-300">Roll No</label>
          <input className="input w-full rounded-lg px-3 py-2 mt-1" value={rollNo} onChange={(e) => setRollNo(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-300">Room No</label>
          <input className="input w-full rounded-lg px-3 py-2 mt-1" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-300">Mess Plan</label>
          <select className="input w-full rounded-lg px-3 py-2 mt-1" value={messPlanId} onChange={(e) => setMessPlanId(e.target.value)}>
            <option value="">None</option>
            {messPlans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.planName} ({p.cost})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="mt-3 text-red-300 text-sm">{error}</div>}

      <div className="mt-4 flex gap-2">
        <button type="submit" className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg">
          {initialValue?._id ? 'Update Student' : 'Add Student'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

