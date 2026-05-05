import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['morning', 'afternoon', 'evening'];
const LOCATIONS = ['home', 'clubhouse', 'local_ground'];

function SetupProfilePage() {
  const navigate = useNavigate();
  const { user, markProfileComplete, isProfileComplete } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  
  // Form State
  const [selectedGames, setSelectedGames] = useState([]);
  const [skillLevel, setSkillLevel] = useState('');
  const [availability, setAvailability] = useState({ days: [], slots: [] });
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [area, setArea] = useState('');
  
  useEffect(() => {
    // If already complete, maybe redirect them, but for now just let them edit
    if (isProfileComplete && step === 1) {
      toast('You can update your existing profile here.', { icon: 'ℹ️' });
    }
    
    // Fetch available games
    const fetchGames = async () => {
      try {
        const res = await api.get('/games');
        setGames(res.data.data);
      } catch (err) {
        toast.error('Failed to load games. Please refresh.');
      }
    };
    
    // Fetch existing profile if modifying
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/me');
        if (res.data.data) {
          const p = res.data.data;
          setSelectedGames(p.preferredGames || []);
          setSkillLevel(p.skillLevel || '');
          setAvailability({
            days: p.availability?.days || [],
            slots: p.availability?.slots || []
          });
          setPreferredLocations(p.preferredLocations || []);
          setArea(p.location?.area || '');
        }
      } catch (err) {
        // Ignored, might be a brand new profile
      }
    };

    fetchGames();
    fetchProfile();
  }, [isProfileComplete]);

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const toggleGame = (gameId) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const toggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const toggleSlot = (slot) => {
    setAvailability(prev => ({
      ...prev,
      slots: prev.slots.includes(slot) ? prev.slots.filter(s => s !== slot) : [...prev.slots, slot]
    }));
  };

  const toggleLocation = (loc) => {
    setPreferredLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const handleSubmit = async () => {
    if (!area.trim()) {
      toast.error('Please enter your area/locality');
      return;
    }

    setLoading(true);
    try {
      await api.put('/profile/me', {
        preferredGames: selectedGames,
        skillLevel: skillLevel || null,
        availability,
        preferredLocations,
        // Mock coordinates for phase 1 unless we add a real geocoder
        location: { area: area.trim(), coordinates: [72.8777, 19.0760] } 
      });
      
      markProfileComplete();
      toast.success('Profile saved successfully! 🎉');
      navigate('/find-partners', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Check if current step is valid to proceed
  const canProceed = () => {
    if (step === 1) return selectedGames.length > 0;
    if (step === 2) return !!skillLevel;
    if (step === 3) return availability.days.length > 0 && availability.slots.length > 0;
    if (step === 4) return preferredLocations.length > 0;
    if (step === 5) return area.trim().length > 2;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-10 px-4">
      <div className="max-w-2xl w-full mx-auto">
        
        {/* Progress Bar */}
        <div className="mb-8 relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 transition-all duration-300 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs font-semibold text-gray-500 text-right">
            Step {step} of 5
          </div>
        </div>

        <div className="card shadow-md p-8 min-h-[400px] flex flex-col">
          
          {/* Step 1: Games */}
          {step === 1 && (
            <div className="flex-1 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you like to play?</h2>
              <p className="text-gray-500 mb-6">Select all the games you are interested in playing.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {games.map(g => (
                  <button
                    key={g.id}
                    onClick={() => toggleGame(g.name)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedGames.includes(g.name)
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-gray-100 hover:border-brand-200 bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">{g.icon}</div>
                    <div className="font-semibold">{g.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{g.type}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Skill */}
          {step === 2 && (
            <div className="flex-1 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What is your general skill level?</h2>
              <p className="text-gray-500 mb-6">This helps us match you with similar players.</p>
              
              <div className="space-y-3">
                {[
                  { id: 'beginner', label: 'Beginner', desc: 'Just starting out or playing for pure fun' },
                  { id: 'intermediate', label: 'Intermediate', desc: 'Know the rules well, play occasionally' },
                  { id: 'advanced', label: 'Advanced', desc: 'Play regularly, highly competitive' },
                ].map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => setSkillLevel(lvl.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      skillLevel === lvl.id
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-gray-100 hover:border-brand-200 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-lg capitalize">{lvl.label}</div>
                    <div className="text-sm text-gray-500">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="flex-1 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">When are you usually free?</h2>
              <p className="text-gray-500 mb-6">Select your preferred days and times.</p>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Days</h3>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                        availability.days.includes(day)
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-brand-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Time Slots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'morning', label: 'Morning', icon: '🌅', time: '6 AM - 12 PM' },
                    { id: 'afternoon', label: 'Afternoon', icon: '☀️', time: '12 PM - 5 PM' },
                    { id: 'evening', label: 'Evening', icon: '🌙', time: '5 PM - 10 PM' },
                  ].map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => toggleSlot(slot.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        availability.slots.includes(slot.id)
                          ? 'border-brand-500 bg-brand-50 text-brand-900'
                          : 'border-gray-100 hover:border-brand-200 bg-white'
                      }`}
                    >
                      <div className="text-xl mb-1">{slot.icon}</div>
                      <div className="font-semibold capitalize">{slot.label}</div>
                      <div className="text-xs text-gray-500">{slot.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Locations */}
          {step === 4 && (
            <div className="flex-1 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Where do you prefer to play?</h2>
              <p className="text-gray-500 mb-6">Select all that apply.</p>
              
              <div className="space-y-3">
                {[
                  { id: 'home', label: 'At Home', icon: '🏠', desc: 'Board games or table tennis at your place' },
                  { id: 'clubhouse', label: 'Society Clubhouse', icon: '🏢', desc: 'Shared residential facilities' },
                  { id: 'local_ground', label: 'Local Ground / Court', icon: '🏟️', desc: 'Parks, public courts, or rented turfs' },
                ].map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => toggleLocation(loc.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      preferredLocations.includes(loc.id)
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-gray-100 hover:border-brand-200 bg-white'
                    }`}
                  >
                    <div className="text-3xl">{loc.icon}</div>
                    <div>
                      <div className="font-semibold text-lg">{loc.label}</div>
                      <div className="text-sm opacity-80">{loc.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Area/Location */}
          {step === 5 && (
            <div className="flex-1 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Where are you located?</h2>
              <p className="text-gray-500 mb-6">This helps us find players near you. We'll only show your general area to others.</p>
              
              <div>
                <label className="input-label">Neighborhood / Area Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Andheri West, Mumbai"
                    className="input-field pl-10"
                  />
                </div>
                <p className="text-xs text-brand-600 mt-2 flex items-center gap-1">
                  <span>🔒</span> Your exact address is never shared.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={handlePrev} className="btn-secondary">
                Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button 
                onClick={handleNext} 
                className="btn-primary px-8"
                disabled={!canProceed()}
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                className="btn-primary px-8 bg-emerald-600 hover:bg-emerald-700"
                disabled={!canProceed() || loading}
              >
                {loading ? <span className="spinner" /> : 'Complete Setup'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default SetupProfilePage;
