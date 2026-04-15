import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

function MessagesListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data.data);
      } catch (err) {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>💬</span> Messages
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse h-24 bg-gray-100 border-none"></div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
            <div className="text-5xl mb-4 opacity-50">👋</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              When you accept a play request or send one that gets accepted, you can chat with the player here.
            </p>
            <Link to="/find-partners" className="btn-primary">
              Find Partners
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {conversations.map(conv => {
              const otherUser = conv.participants.find(p => p._id !== user._id);
              const lastMsg = conv.lastMessage;
              const date = new Date(conv.updatedAt);
              const isUnread = lastMsg && lastMsg.senderId !== user._id && !lastMsg.readBy.some(r => r.user === user._id);

              return (
                <Link 
                  key={conv._id} 
                  to={`/messages/${conv._id}`}
                  className="flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-emerald-100 rounded-full flex items-center justify-center text-xl font-bold text-brand-700 flex-shrink-0 relative">
                    {otherUser?.name?.charAt(0)}
                    {isUnread && (
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-bold text-base truncate pr-4 ${isUnread ? 'text-gray-900' : 'text-gray-800'}`}>
                        {otherUser?.name}
                      </h3>
                      <span className={`text-xs whitespace-nowrap ${isUnread ? 'font-bold text-brand-600' : 'text-gray-400 font-medium'}`}>
                        {date.toLocaleDateString() === new Date().toLocaleDateString() 
                          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {lastMsg ? (
                        lastMsg.senderId === user._id ? `You: ${lastMsg.text}` : lastMsg.text
                      ) : (
                        <span className="italic text-gray-400">Say hi to start the conversation!</span>
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MessagesListPage;
