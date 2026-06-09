import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import MessPlanForm from '../components/MessPlanForm.jsx';
import MessPlanList from '../components/MessPlanList.jsx';

export default function MessPlanManagement() {
  const [plans, setPlans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    const data = await api.getMessPlans();
    setPlans(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateOrUpdate(payload) {
    setError('');
    if (editing?._id) {
      await api.updateMessPlan(editing._id, payload);
    } else {
      await api.createMessPlan(payload);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this mess plan?')) return;
    setError('');
    await api.deleteMessPlan(id);
    await load();
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mess Plan Management</h1>
          {error && <div className="mt-2 text-red-300 text-sm">{error}</div>}
          <div className="mt-4">
            <MessPlanForm initialValue={editing} onSubmit={handleCreateOrUpdate} onCancel={() => setEditing(null)} />
          </div>
        </div>
        <div>
          <MessPlanList plans={plans} onEdit={setEditing} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}

