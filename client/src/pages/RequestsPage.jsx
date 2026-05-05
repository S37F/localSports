import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import api from '../lib/api';

function RequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/me?type=${activeTab}`);
      setRequests(res.data.data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAction = async (id, action) => {
    try {
      if (action === 'accept') {
        await api.put(`/requests/${id}/accept`);
        toast.success('Match accepted! 🎉');
      } else if (action === 'decline') {
        await api.put(`/requests/${id}/decline`);
        toast.success('Request declined.');
      } else if (action === 'cancel') {
        await api.put(`/requests/${id}/cancel`);
        toast.success('Request cancelled.');
      }
      // Refresh list
      fetchRequests();
    } catch (err) {
      toast.error(err.message || `Failed to ${action} request`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      declined: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>📬</span> Play Requests
        </h1>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'received' 
                ? 'bg-brand-50 text-brand-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'sent' 
                ? 'bg-brand-50 text-brand-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Sent
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse h-32 bg-gray-100 border-none"></div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3 opacity-50">💨</div>
            <h3 className="text-gray-900 font-medium text-lg">No {activeTab} requests</h3>
            <p className="text-gray-500 text-sm mt-1">
              {activeTab === 'received' 
                ? "You haven't received any requests yet. Keep your profile updated!"
                : "You haven't sent any play requests. Find partners nearby and say hi!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const isReceived = activeTab === 'received';
              const otherUser = isReceived ? req.senderId : req.receiverId;
              const date = new Date(req.proposedTime);
              
              const isPast = date < new Date() && req.status === 'pending';

              return (
                <div key={req._id} className="card flex flex-col md:flex-row gap-5 items-start md:items-center">
                  
                  {/* User Info */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-emerald-100 rounded-full flex items-center justify-center text-xl font-bold text-brand-700 flex-shrink-0">
                      {otherUser?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                        {isReceived ? 'From' : 'To'}
                      </div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{otherUser?.name}</h3>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 w-full bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {req.gameId}
                        <span className="text-xs font-normal text-gray-500 px-2 py-0.5 bg-white border border-gray-200 rounded-md">
                          {req.location.replace('_', ' ')}
                        </span>
                      </div>
                      {getStatusBadge(isPast ? 'cancelled' : req.status)}
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-2 flex items-center gap-1.5 font-medium">
                      <span className="text-brand-600">📅</span> 
                      {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {req.message && (
                      <div className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 mt-2">
                        "{req.message}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="w-full md:w-auto flex md:flex-col gap-2 shrink-0 md:min-w-[120px]">
                    {isReceived && req.status === 'pending' && !isPast && (
                      <>
                        <button 
                          onClick={() => handleAction(req._id, 'accept')}
                          className="flex-1 btn-primary py-2 text-sm"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleAction(req._id, 'decline')}
                          className="flex-1 btn-secondary py-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    
                    {!isReceived && req.status === 'pending' && !isPast && (
                      <button 
                        onClick={() => handleAction(req._id, 'cancel')}
                        className="w-full btn-secondary py-2 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                    
                    {req.status === 'accepted' && (
                      <div className="w-full text-center p-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg text-sm border border-emerald-100">
                        Match Confirmed!
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default RequestsPage;
