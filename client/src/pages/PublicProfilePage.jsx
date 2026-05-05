import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import Navbar from '../components/layout/Navbar';

function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/${id}`);
        setProfile(res.data.data);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
            <div className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
        </main>
      </div>
    );
  }

  if (!profile || !profile.userId) {
     return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl text-gray-400 mb-4">👻</h1>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <Link to="/find-partners" className="btn-secondary">Go Back</Link>
        </div>
     );
  }

  const user = profile.userId; // Populated user object

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/find-partners" className="text-gray-500 hover:text-gray-900 text-sm font-medium mb-6 inline-block flex items-center gap-1">
          &larr; Back to Search
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-8 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-50 to-emerald-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="w-32 h-32 bg-gradient-to-br from-brand-100 to-emerald-100 rounded-[2rem] flex items-center justify-center text-5xl font-bold text-brand-700 shadow-inner shrink-0 rotate-3">
               {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-black text-gray-900 mb-2">{user.name}</h1>
                <p className="text-gray-600 mb-4 max-w-lg leading-relaxed text-[15px]">
                   {profile.bio || "Hi, I'm looking for local sports partners to play with!"}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="bg-gray-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                        📍 {profile.location?.area || 'Area not specified'}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                        ⭐ {profile.skillLevel || 'Beginner'}
                    </span>
                </div>
            </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Games Played</h3>
                <div className="flex flex-wrap gap-2">
                    {profile.preferredGames?.length > 0 ? (
                        profile.preferredGames.map(game => (
                            <span key={game} className="bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1 rounded flex items-center gap-1 text-sm font-medium">
                                🎾 {game}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm italic">No games listed</p>
                    )}
                </div>
            </div>

            <div className="card">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Availability</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Days</p>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.availability?.days?.length > 0 ? (
                                profile.availability.days.map(day => (
                                    <span key={day} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">{day}</span>
                                ))
                            ) : (
                                <p className="text-gray-400 text-xs">Flexible</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Time</p>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.availability?.slots?.length > 0 ? (
                                profile.availability.slots.map(slot => (
                                    <span key={slot} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium">{slot}</span>
                                ))
                            ) : (
                                <p className="text-gray-400 text-xs">Anytime</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

export default PublicProfilePage;
