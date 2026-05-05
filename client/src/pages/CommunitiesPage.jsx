import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

function CommunitiesPage() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      // For Phase 1 demo, hardcoded lat/lng around Mumbai
      const res = await api.get('/communities?lat=19.0760&lng=72.8777&radius=15000');
      setCommunities(res.data.data);
    } catch (err) {
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleJoin = async (id) => {
    try {
      await api.post(`/communities/${id}/join`);
      toast.success('Joined community successfully!');
      fetchCommunities();
    } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to join community');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>🏘️</span> Local Communities
            </h1>
            <p className="text-gray-500 text-sm mt-1">Join a community to find open games near you.</p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary py-2 px-6 shadow-sm"
          >
            Create Community
          </button>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-48 animate-pulse bg-gray-100 border-none"></div>
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
            <div className="text-5xl mb-4 opacity-50">🏟️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No communities nearby</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Be the first to start a sports community in your area!
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create One
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map(c => {
               const isMember = c.members?.includes(user?._id) || c.createdBy?._id === user?._id;

               return (
                <div key={c._id} className="card-hover flex flex-col pt-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{c.name}</h3>
                    {c.isVerified && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider shrink-0">
                        <span>✓</span> Verified
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {c.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded">📍 {c.area}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">👥 {c.members?.length || 1} members</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                    <Link 
                      to={`/communities/${c._id}`}
                      className="flex-1 btn-secondary py-2 text-sm text-center"
                    >
                      View Posts
                    </Link>
                    {!isMember && (
                      <button 
                        onClick={() => handleJoin(c._id)}
                        className="flex-1 btn-primary py-2 text-sm"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
               );
            })}
          </div>
        )}
      </main>

      {/* Simple inline modal for creating a community */}
      {showCreateModal && (
        <CreateCommunityModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchCommunities} 
        />
      )}
    </div>
  );
}

// Sub-component for simplicity
function CreateCommunityModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !area) return toast.error('Name and Area are required');

    setLoading(true);
    try {
      await api.post('/communities', {
        name,
        description,
        area,
        // Hardcoded coords for demo, in prod would use google maps autocomplete
        location: { coordinates: [72.8777, 19.0760] } 
      });
      toast.success('Community created!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold">Create Community</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="input-label">Community Name</label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)}
              className="input-field" placeholder="e.g. Andheri Badminton Club" maxLength={100} required
            />
          </div>
          <div>
            <label className="input-label">Area</label>
            <input 
              type="text" value={area} onChange={e => setArea(e.target.value)}
              className="input-field" placeholder="e.g. Andheri West" required
            />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)}
              className="input-field py-2" placeholder="Tell people what this group is about..." maxLength={500} rows={3}
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommunitiesPage;
