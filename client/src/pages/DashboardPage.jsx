import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import api from '../lib/api';

function DashboardPage() {
  const { user, isProfileComplete } = useAuth();

  const [pendingReceived, setPendingReceived] = useState(null);
  const [acceptedMatches, setAcceptedMatches] = useState(null);
  const [nearbyCount, setNearbyCount] = useState(null);

  const firstName = user?.name?.split(' ')[0] || 'Player';

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [pendingRes, acceptedRes] = await Promise.all([
          api.get('/requests/me?type=received&status=pending'),
          api.get('/requests/me?status=accepted'),
        ]);
        setPendingReceived(pendingRes.data.count ?? 0);
        setAcceptedMatches(acceptedRes.data.count ?? 0);
      } catch {
        setPendingReceived(0);
        setAcceptedMatches(0);
      }

      if (isProfileComplete) {
        try {
          const params = new URLSearchParams({
            lat: '19.0760',
            lng: '72.8777',
            radius: '5000',
            limit: '50',
          });
          const near = await api.get(`/players/nearby?${params.toString()}`);
          setNearbyCount(near.data.count ?? near.data.data?.length ?? 0);
        } catch {
          setNearbyCount(null);
        }
      }
    };

    load();
  }, [user, isProfileComplete]);

  const statCards = [
    {
      label: 'Nearby players',
      value: !isProfileComplete ? '—' : nearbyCount == null ? '—' : String(nearbyCount),
      icon: '🧑‍🤝‍🧑',
      hint: !isProfileComplete ? 'Finish your profile to see matches' : 'Within ~5 km of your area',
    },
    {
      label: 'Pending requests',
      value: pendingReceived == null ? '—' : String(pendingReceived),
      icon: '📩',
      hint: 'Waiting for your response',
    },
    {
      label: 'Confirmed games',
      value: acceptedMatches == null ? '—' : String(acceptedMatches),
      icon: '🏆',
      hint: 'Accepted play requests',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 pb-24 md:pb-8">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="card mb-8 bg-gradient-to-r from-brand-600 to-emerald-500 text-white border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              👋
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Welcome, {firstName}!</h2>
              <p className="text-brand-100 mt-1">
                {isProfileComplete
                  ? 'Discover partners, manage requests, and keep the games going.'
                  : 'Complete your profile so others can find you and you can browse nearby players.'}
              </p>
              {!isProfileComplete && (
                <Link
                  to="/setup-profile"
                  className="inline-flex mt-4 px-5 py-2.5 rounded-xl bg-white text-brand-700 font-semibold text-sm shadow-md hover:bg-brand-50 transition-colors"
                >
                  Finish profile setup →
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-2 leading-snug">{stat.hint}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/find-partners"
            className="card border-2 transition-all hover:border-brand-400 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">🔍</span>
              <div>
                <h3 className="font-semibold text-gray-900">Find partners</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Search nearby players by game and skill level.
                </p>
              </div>
            </div>
          </Link>
          <Link
            to="/requests"
            className="card border-2 border-transparent hover:border-brand-400 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">📬</span>
              <div>
                <h3 className="font-semibold text-gray-900">Requests</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Send invites and respond to incoming play requests.
                </p>
              </div>
            </div>
          </Link>
          <Link
            to="/communities"
            className="card border-2 border-transparent hover:border-brand-400 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">🏘️</span>
              <div>
                <h3 className="font-semibold text-gray-900">Communities</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Browse society groups and open play nearby.
                </p>
              </div>
            </div>
          </Link>
          <Link
            to="/messages"
            className="card border-2 border-transparent hover:border-brand-400 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">💬</span>
              <div>
                <h3 className="font-semibold text-gray-900">Messages</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Chat after you&apos;ve connected with someone.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
