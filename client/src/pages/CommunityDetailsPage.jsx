import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

function CommunityDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [commRes, postsRes, gamesRes] = await Promise.all([
        api.get(`/communities/${id}`),
        api.get(`/communities/${id}/posts`),
        api.get('/games')
      ]);
      setCommunity(commRes.data.data);
      setPosts(postsRes.data.data);
      setGames(gamesRes.data.data);
    } catch (err) {
      toast.error('Failed to load community details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoinPost = async (postId) => {
    try {
      await api.post(`/communities/posts/${postId}/join`);
      toast.success('Joined the session!');
      fetchData(); // refresh posts
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join session');
    }
  };

  const handleJoinCommunity = async () => {
      try {
          await api.post(`/communities/${id}/join`);
          toast.success('Joined community!');
          fetchData();
      } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to join community');
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="h-40 bg-gray-200 animate-pulse rounded-2xl mb-8"></div>
            <div className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!community) return null;

  const isMember = community.members?.some(m => m._id === user?._id) || community.createdBy?._id === user?._id;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/communities" className="text-gray-500 hover:text-gray-900 text-sm font-medium mb-4 inline-block flex items-center gap-1">
          &larr; Back to Communities
        </Link>

        {/* Community Header */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            {/* Banner decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-50 to-emerald-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>

            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-gray-900">{community.name}</h1>
                    {community.isVerified && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        ✓ Verified
                    </span>
                    )}
                </div>
                <p className="text-gray-600 mb-4 max-w-xl">{community.description}</p>
                <div className="flex gap-3 text-sm font-medium text-gray-500">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg">📍 {community.area}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-lg">👥 {community.members?.length} Members</span>
                </div>
            </div>

            {!isMember ? (
                <button onClick={handleJoinCommunity} className="btn-primary shrink-0 px-8 py-3 w-full md:w-auto">
                    Join Community
                </button>
            ) : (
                <button onClick={() => setShowCreatePost(true)} className="btn-primary shrink-0 px-6 py-3 w-full md:w-auto flex items-center justify-center gap-2">
                    <span>➕</span> Host a Game
                </button>
            )}
        </div>

        {/* Open Play Posts */}
        <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Open Play Sessions</h2>
        </div>

        <div className="space-y-4">
            {posts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="text-4xl mb-3 opacity-50">🗓️</div>
                    <h3 className="text-gray-900 font-medium text-lg">No sessions scheduled</h3>
                    <p className="text-gray-500 text-sm mt-1 mb-4">
                        Members can create open play posts that anyone in the community can join.
                    </p>
                    {isMember && <button onClick={() => setShowCreatePost(true)} className="btn-secondary">Host a Game</button>}
                </div>
            ) : (
                posts.map(post => {
                    const date = new Date(post.scheduledTime);
                    const isFull = post.participants?.length >= post.maxParticipants;
                    const didJoin = post.participants?.some(p => p._id === user?._id);
                    const gameInfo = games.find(g => g.name === post.gameId);

                    return (
                        <div key={post._id} className="card flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="bg-brand-50 w-full sm:w-20 h-20 rounded-xl flex sm:flex-col items-center justify-center shrink-0 border border-brand-100 px-4 sm:px-0 gap-2 sm:gap-0">
                                <span className="text-brand-600 font-bold text-lg sm:text-base">{date.getDate()}</span>
                                <span className="text-brand-500 text-sm sm:text-xs font-semibold uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                    {gameInfo?.icon} {post.gameId} 
                                    {post.status === 'closed' || isFull ? (
                                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Full</span>
                                    ) : null}
                                </h3>
                                <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                    <span className="flex items-center gap-1">⏰ {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="flex items-center gap-1">📍 {post.location}</span>
                                    <span className="flex items-center gap-1 truncate max-w-[200px]">👤 Hosted by {post.createdBy?.name}</span>
                                </div>
                                
                                {/* Avatar stack */}
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="flex -space-x-2">
                                        {post.participants?.slice(0, 5).map((p, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[10px] font-bold text-gray-600 z-10" style={{ zIndex: 10 - i }}>
                                                {p.name?.charAt(0)}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">
                                        {post.participants?.length} / {post.maxParticipants} joined
                                    </span>
                                </div>
                            </div>

                            <div className="w-full sm:w-auto mt-4 sm:mt-0">
                                {didJoin ? (
                                    <button className="w-full btn-secondary text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-50 cursor-default">
                                        Joined ✓
                                    </button>
                                ) : post.status === 'open' && !isFull ? (
                                    <button onClick={() => handleJoinPost(post._id)} className="w-full btn-primary px-8">
                                        Join
                                    </button>
                                ) : (
                                    <button disabled className="w-full btn-secondary opacity-50 cursor-not-allowed px-8">
                                        Closed
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreatePost && (
          <CreatePostModal 
            communityId={id} 
            games={games}
            onClose={() => setShowCreatePost(false)} 
            onSuccess={fetchData} 
          />
      )}
    </div>
  );
}

function CreatePostModal({ communityId, games, onClose, onSuccess }) {
    const [gameId, setGameId] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [maxParticipants, setMaxParticipants] = useState(4);
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!gameId || !date || !time || !location) return toast.error('All fields required');
  
      setLoading(true);
      try {
        const scheduledTime = new Date(`${date}T${time}`).toISOString();
        await api.post(`/communities/${communityId}/posts`, {
          gameId,
          scheduledTime,
          location,
          maxParticipants
        });
        toast.success('Session created!');
        onSuccess();
        onClose();
      } catch (err) {
        toast.error('Failed to create session');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold">Host Open Play Session</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="input-label">Game</label>
              <select value={gameId} onChange={e => setGameId(e.target.value)} className="input-field" required>
                  <option value="" disabled>Select a game</option>
                  {games.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="input-label">Date</label>
                    <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} className="input-field" required />
                </div>
                <div>
                    <label className="input-label">Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field" required />
                </div>
            </div>

            <div>
              <label className="input-label">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input-field" placeholder="e.g. Building B Ground" required />
            </div>

            <div>
              <label className="input-label">Total Players Needed (including you)</label>
              <input type="number" min="2" max="20" value={maxParticipants} onChange={e => setMaxParticipants(parseInt(e.target.value))} className="input-field" required />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Host Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

export default CommunityDetailsPage;
