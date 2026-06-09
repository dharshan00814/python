import React, { useEffect, useState } from 'react';

export default function MessPlanForm({ initialValue, onSubmit, onCancel }) {
  const [planName, setPlanName] = useState(initialValue?.planName || '');
  const [cost, setCost] = useState(initialValue?.cost ?? '');
  const [meals, setMeals] = useState(Array.isArray(initialValue?.meals) ? initialValue.meals.join(', ') : '');
  const [error, setError] = useState('');

  useEffect(() => {
    setPlanName(initialValue?.planName || '');
    setCost(initialValue?.cost ?? '');
    setMeals(Array.isArray(initialValue?.meals) ? initialValue.meals.join(', ') : '');
  }, [initialValue]);

  function validate() {
    if (!planName.trim()) return 'Plan name is required.';
    const n = Number(cost);
    if (Number.isNaN(n) || n < 0) return 'Cost must be a valid number >= 0.';
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    const mealsArr = meals
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    onSubmit({
      planName: planName.trim(),
      cost: Number(cost),
      meals: mealsArr
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card2 rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-300">Plan Name</label>
          <input className="input w-full rounded-lg px-3 py-2 mt-1" value={planName} onChange={(e) => setPlanName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-300">Cost</label>
          <input className="input w-full rounded-lg px-3 py-2 mt-1" value={cost} onChange={(e) => setCost(e.target.value)} />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-sm text-slate-300">Meals (comma separated)</label>
        <input className="input w-full rounded-lg px-3 py-2 mt-1" value={meals} onChange={(e) => setMeals(e.target.value)} />
      </div>

      {error && <div className="mt-3 text-red-300 text-sm">{error}</div>}

      <div className="mt-4 flex gap-2">
        <button type="submit" className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg">
          {initialValue?._id ? 'Update Mess Plan' : 'Add Mess Plan'}
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

