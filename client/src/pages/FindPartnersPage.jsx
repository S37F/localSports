import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Navbar from '../components/layout/Navbar';
import RequestModal from '../components/requests/RequestModal';

function FindPartnersPage() {
  const navigate = useNavigate();
  
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  
  // Filters
  const [filterGame, setFilterGame] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [radius, setRadius] = useState(5000); // 5km
  
  // Modal state
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      // For phase 1 we use a hardcoded default lat/lng near Mumbai if the user hasn't
      // provided one via true GPS. We will use 72.8777, 19.0760
      const params = new URLSearchParams({
        lat: 19.0760,
        lng: 72.8777,
        radius,
        limit: 50
      });
      
      if (filterGame) params.append('game', filterGame);
      if (filterSkill) params.append('skillLevel', filterSkill);

      const res = await api.get(`/players/nearby?${params.toString()}`);
      setPlayers(res.data.data);
    } catch (err) {
      toast.error('Failed to load nearby players');
    } finally {
      setLoading(false);
    }
  }, [filterGame, filterSkill, radius]);

  useEffect(() => {
    // Load games for filter dropdown
    api.get('/games').then(res => setGames(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleSendRequestClick = (player) => {
    setSelectedPlayer(player.userId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎛️</span> Filters
              </h2>

              <div className="space-y-5">
                {/* Game filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Game
                  </label>
                  <select 
                    value={filterGame}
                    onChange={(e) => setFilterGame(e.target.value)}
                    className="input-field py-2 bg-gray-50"
                  >
                    <option value="">All Games</option>
                    {games.map(g => (
                      <option key={g.id} value={g.name}>{g.name} {g.icon}</option>
                    ))}
                  </select>
                </div>

                {/* Skill filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Skill Level
                  </label>
                  <select 
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                    className="input-field py-2 bg-gray-50"
                  >
                    <option value="">Any Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Radius filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Distance</span>
                    <span className="text-brand-600">{radius / 1000} km</span>
                  </label>
                  <input 
                    type="range" 
                    min="1000" 
                    max="20000" 
                    step="1000"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1km</span>
                    <span>20km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Nearby Players</h1>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {players.length} found
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="card animate-pulse h-64 bg-gray-100 border-none"></div>
                ))}
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                <div className="text-5xl mb-4 opacity-50">🧭</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No players found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Try expanding your search radius or changing the filters to find more players near you.
                </p>
                <button 
                  onClick={() => { setFilterGame(''); setFilterSkill(''); setRadius(10000); }}
                  className="btn-ghost mt-4"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {players.map(player => (
                  <div key={player._id} className="card-hover flex flex-col pt-5">
                    
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-emerald-100 rounded-full flex items-center justify-center text-xl font-bold text-brand-700 flex-shrink-0">
                        {player.userId?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1">{player.userId?.name}</h3>
                        <p className="text-xs flex items-center gap-1 text-gray-500 mt-0.5">
                          <span>📍</span> {player.location?.area || 'Nearby'}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3 flex-1">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Games</div>
                        <div className="flex flex-wrap gap-1.5">
                          {player.preferredGames?.slice(0, 3).map(game => (
                            <span key={game} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                              {game}
                            </span>
                          ))}
                          {player.preferredGames?.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md">
                              +{player.preferredGames.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div>
                          <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Skill</div>
                          <div className="text-sm capitalize text-gray-800">{player.skillLevel || 'Any'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Availability</div>
                          <div className="text-sm text-gray-800">
                            {player.availability?.days?.length || 0} days / wk
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => handleSendRequestClick(player)}
                        className="w-full btn-primary py-2 text-sm"
                      >
                        Send Request
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>

      <RequestModal 
        isOpen={!!selectedPlayer}
        receiver={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onSuccess={() => {
          // Future: Maybe visually indicate request was sent on the card
        }}
      />
    </div>
  );
}

export default FindPartnersPage;
