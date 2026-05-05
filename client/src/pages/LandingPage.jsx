import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
  const { isAuthenticated, authReady } = useAuth();

  if (authReady && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Basic Nav for guests */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-black tracking-tight text-gray-900">LocalSports</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Log In</Link>
            <Link to="/register" className="btn-primary py-2 px-5 text-sm shadow-sm ring-2 ring-brand-500/20">Sign Up</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 text-center overflow-hidden min-h-[85vh]">
          {/* Decorative background blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-600 mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Over 5,000 matches played locally</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Find your perfect game <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-emerald-500">partner nearby</span>.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether you are a badminton pro or a weekend board gamer, connect with local players, join communities, and hit the court.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-4 text-lg w-full sm:w-auto shadow-lg shadow-brand-500/30 hover:-translate-y-1 transform transition-all">
              Start Playing Now
            </Link>
            <a href="#how-it-works" className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto bg-white border-gray-200 hover:bg-gray-50">
              How it works
            </a>
          </div>

          {/* Social Proof / Game Icons */}
          <div className="mt-20 pt-10 border-t border-gray-200/60 w-full max-w-5xl mx-auto">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Supported Games</p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex flex-col items-center gap-2"><span className="text-4xl">🏸</span><span className="text-xs font-bold text-gray-500">Badminton</span></div>
               <div className="flex flex-col items-center gap-2"><span className="text-4xl">🎾</span><span className="text-xs font-bold text-gray-500">Tennis</span></div>
               <div className="flex flex-col items-center gap-2"><span className="text-4xl">♟️</span><span className="text-xs font-bold text-gray-500">Chess</span></div>
               <div className="flex flex-col items-center gap-2"><span className="text-4xl">🏏</span><span className="text-xs font-bold text-gray-500">Cricket</span></div>
               <div className="flex flex-col items-center gap-2"><span className="text-4xl">🏓</span><span className="text-xs font-bold text-gray-500">Table Tennis</span></div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-white py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">You're 3 steps away from the game</h2>
              <p className="text-gray-500 text-lg">We handle the matchmaking, you bring the energy.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative cursor-default">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center text-3xl font-bold mb-6 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-brand-500/20 transition-all duration-300">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Set Preferences</h3>
                <p className="text-gray-600">Tell us what games you love, your skill level, and when you're free.</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-3xl font-bold mb-6 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-purple-500/20 transition-all duration-300">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Find & Connect</h3>
                <p className="text-gray-600">Browse nearby players dynamically matching your exact criteria.</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl font-bold mb-6 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-emerald-500/20 transition-all duration-300">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Chat & Play</h3>
                <p className="text-gray-600">Send an invite, use the real-time chat to coordinate, and have fun!</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm px-4">
        <p>© {new Date().getFullYear()} LocalSports Platform. Created for the community.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
