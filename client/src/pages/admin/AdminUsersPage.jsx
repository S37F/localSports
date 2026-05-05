import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}/status`);
      toast.success(currentStatus ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 text-xl font-bold">←</Link>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{u.name}</td>
                      <td className="p-4 text-gray-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {u.isActive ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => toggleStatus(u._id, u.isActive)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              u.isActive 
                                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isActive ? 'Ban User' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUsersPage;
