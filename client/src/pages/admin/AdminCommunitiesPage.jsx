import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';

function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/communities');
      setCommunities(res.data.data);
    } catch (err) {
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const toggleVerification = async (id, isCurrentlyVerified) => {
    try {
      await api.put(`/admin/communities/${id}/verify`);
      toast.success(isCurrentlyVerified ? 'Verification removed' : 'Community verified!');
      fetchCommunities();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update community status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard" className="text-gray-400 hover:text-gray-600 text-xl font-bold">←</Link>
          <h1 className="text-2xl font-bold text-gray-900">Manage Communities</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Creator</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading communities...</td></tr>
                ) : communities.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No communities found.</td></tr>
                ) : (
                  communities.map(c => (
                    <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{c.name}</td>
                      <td className="p-4 text-gray-600">{c.area}</td>
                      <td className="p-4 text-gray-600">{c.createdBy?.name || 'Unknown'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${c.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                          {c.isVerified ? '✓ Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleVerification(c._id, c.isVerified)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            c.isVerified 
                              ? 'text-gray-600 bg-gray-100 hover:bg-gray-200' 
                              : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          {c.isVerified ? 'Remove Badge' : 'Grant Verification'}
                        </button>
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

export default AdminCommunitiesPage;
