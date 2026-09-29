import { useEffect, useState } from 'react';
import { getUsers } from '../services/adminService';
import { Spinner } from '../components/Loader';
import { formatDate } from '../utils/format';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading users..." />;

  return (
    <div>
      <h1 className="text-xl font-semibold">
        Users <span className="text-sm font-normal text-neutral-500">({users.length})</span>
      </h1>
      {error && <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-md border border-neutral-200 bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-neutral-100 text-neutral-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}