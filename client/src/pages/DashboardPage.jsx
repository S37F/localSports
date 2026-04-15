import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const GAME_ICONS = ['🏸', '♟️', '🎯', '🏓', '🎱', '🃏'];

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const firstName = user?.name?.split(' ')[0] || 'Player';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50">
      {/* Nav */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-sm">
              🏸
            </div>
            <span className="font-bold text-gray-900">LocalSports</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost text-sm">
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Welcome hero */}
        <div className="card mb-8 bg-gradient-to-r from-brand-600 to-emerald-500 text-white border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              👋
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Welcome, {firstName}!
              </h2>
              <p className="text-brand-100 mt-1">
                You're logged in. Complete your profile to start finding game partners.
              </p>
            </div>
          </div>
        </div>

        {/* Quick stats placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Nearby Players', value: '—', icon: '🧑‍🤝‍🧑' },
            { label: 'Play Requests', value: '—', icon: '📩' },
            { label: 'Games Played', value: '—', icon: '🏆' },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Supported games */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Supported Games</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { name: 'Badminton', icon: '🏸' },
              { name: 'Chess', icon: '♟️' },
              { name: 'Carrom', icon: '🎯' },
              { name: 'Table Tennis', icon: '🏓' },
              { name: 'Cards', icon: '🃏' },
              { name: 'Ludo', icon: '🎲' },
            ].map((game) => (
              <div
                key={game.name}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-default"
              >
                <span className="text-2xl">{game.icon}</span>
                <span className="text-xs font-medium text-gray-600">{game.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            More features coming in the next phases 🚀
          </p>
          <div className="text-xs text-gray-400">
            Phase 1 complete — Authentication ✅
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
