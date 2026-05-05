import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/requests/history');
        setHistory(res.data.data);
      } catch (err) {
        toast.error('Failed to load match history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>🏆</span> Match History
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="card animate-pulse h-24 bg-gray-100 border-none"></div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3 opacity-50">🕹️</div>
            <h3 className="text-gray-900 font-medium text-lg">No past matches found</h3>
            <p className="text-gray-500 text-sm mt-1">
              Once you accept a request and the play date passes, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {history.map(match => {
              const otherUser = match.senderId._id === user._id 
                ? match.receiverId 
                : match.senderId;
              const date = new Date(match.proposedTime);

              return (
                <div key={match._id} className="card flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    {otherUser?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{otherUser?.name}</h3>
                    <div className="text-sm text-gray-600 mt-0.5">
                      Played <span className="font-semibold text-gray-900">{match.gameId}</span>
                    </div>
                    <div className="text-xs text-brand-600 font-medium mt-1 uppercase tracking-wider">
                      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
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

export default HistoryPage;
