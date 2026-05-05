import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function RequestModal({ isOpen, onClose, receiver, onSuccess }) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);

  // Form
  const [gameId, setGameId] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [location, setLocation] = useState('home');
  const [locationNote, setLocationNote] = useState('');
  const [message, setMessage] = useState('');

  // Fetch mutual or sender's preferred games
  useEffect(() => {
    if (isOpen) {
      api.get('/games')
        .then(res => setGames(res.data.data))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gameId || !proposedDate || !proposedTime) {
      toast.error('Please fill all required fields');
      return;
    }

    const proposedDateTime = new Date(`${proposedDate}T${proposedTime}`);
    if (proposedDateTime < new Date()) {
      toast.error('Proposed time cannot be in the past');
      return;
    }

    setLoading(true);
    try {
      await api.post('/requests', {
        receiverId: receiver._id,
        gameId,
        proposedTime: proposedDateTime.toISOString(),
        location,
        locationNote,
        message
      });
      
      toast.success(`Play request sent to ${receiver.name}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            Invite <span className="text-brand-600">{receiver?.name?.split(' ')[0]}</span> to play
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="requestForm" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Game */}
            <div>
              <label className="input-label">Select Game <span className="text-red-500">*</span></label>
              <select 
                value={gameId} 
                onChange={e => setGameId(e.target.value)}
                className="input-field"
                required
              >
                <option value="" disabled>Choose a game</option>
                {games.map(g => (
                  <option key={g.id} value={g.name}>{g.name} {g.icon}</option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={proposedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setProposedDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Time <span className="text-red-500">*</span></label>
                <input 
                  type="time" 
                  value={proposedTime}
                  onChange={e => setProposedTime(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="input-label">Location <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'clubhouse', label: 'Clubhouse' },
                  { id: 'local_ground', label: 'Ground' }
                ].map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocation(loc.id)}
                    className={`py-2 text-sm rounded-xl border ${
                      location === loc.id 
                        ? 'bg-brand-50 border-brand-500 text-brand-700 font-medium' 
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional details */}
            <div>
              <label className="input-label">
                Location Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input 
                type="text" 
                value={locationNote}
                onChange={e => setLocationNote(e.target.value)}
                placeholder="e.g. Building B lobby"
                maxLength={200}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">
                Message <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Hi! Would you be up for a quick game this weekend?"
                maxLength={500}
                rows={3}
                className="input-field resize-none py-3"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <button 
            type="button" 
            onClick={onClose}
            className="btn-secondary px-6"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="requestForm"
            className="btn-primary px-8"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Send Request'}
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default RequestModal;
