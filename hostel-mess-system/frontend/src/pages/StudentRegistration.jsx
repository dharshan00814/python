import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import StudentForm from '../components/StudentForm.jsx';
import StudentList from '../components/StudentList.jsx';

export default function StudentRegistration() {
  const [students, setStudents] = useState([]);
  const [messPlans, setMessPlans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    const [s, m] = await Promise.all([api.getStudents(), api.getMessPlans()]);
    setStudents(s);
    setMessPlans(m);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateOrUpdate(payload) {
    setError('');
    if (editing?._id) {
      await api.updateStudent(editing._id, payload);
    } else {
      await api.createStudent(payload);
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this student?')) return;
    setError('');
    await api.deleteStudent(id);
    await load();
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Student Registration</h1>
          </div>
          {error && <div className="mt-2 text-red-300 text-sm">{error}</div>}
          <div className="mt-4">
            <StudentForm
              messPlans={messPlans}
              initialValue={editing}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>

        <div>
          <StudentList
            students={students}
            onEdit={(s) => setEditing(s)}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

