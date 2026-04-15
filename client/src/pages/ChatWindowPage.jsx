import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

function ChatWindowPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        // Find the conversation to get the other user's info
        // Simple hack: We fetch all and find ours. Ideally we'd have a GET /conversations/:id route
        const convsRes = await api.get('/chat/conversations');
        const currentConv = convsRes.data.data.find(c => c._id === id);
        setConversation(currentConv);

        const msgsRes = await api.get(`/chat/conversations/${id}/messages`);
        setMessages(msgsRes.data.data);
      } catch (err) {
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };
    fetchChatData();
  }, [id]);

  useEffect(() => {
    // Setup Socket.io
    const socketURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    socketRef.current = io(socketURL);

    const socket = socketRef.current;

    socket.on('connect', () => {
      // Join this specific conversation room
      socket.emit('joinConversation', id);
    });

    socket.on('newMessage', (msg) => {
      // When a real-time message arrives, just push it to the list
      // Only do this if we didn't send it ourselves (we optimistically add our own)
      if (msg.senderId !== user._id) {
         setMessages(prev => [...prev, {
            _id: Date.now().toString(), // temp ID
            text: msg.text,
            senderId: { _id: msg.senderId }, // mock populate
            createdAt: new Date().toISOString()
         }]);
         scrollToBottom();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, user._id]);

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    // Optimistically update UI
    const tempMsg = {
        _id: Date.now().toString(),
        text: textToSend,
        senderId: { _id: user._id },
        createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    const otherUser = conversation?.participants?.find(p => p._id !== user._id);

    try {
      // 1. Emit via socket for instant delivery
      socketRef.current?.emit('sendMessage', {
        conversationId: id,
        senderId: user._id,
        receiverId: otherUser?._id,
        text: textToSend
      });

      // 2. HTTP Fallback to save in DB
      await api.post('/chat/messages', {
        conversationId: id,
        text: textToSend
      });
      
    } catch (err) {
      toast.error('Failed to send message');
      // In a real app, you'd mark the optimistic message as failed
    }
  };

  if (loading || !conversation) {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="h-16 border-b border-gray-100 flex items-center px-4 bg-gray-50 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                <div className="h-4 bg-gray-200 w-32 rounded"></div>
            </div>
            <div className="flex-1 bg-white"></div>
        </div>
    );
  }

  const otherUser = conversation.participants.find(p => p._id !== user._id);

  return (
    <div className="h-screen bg-gray-50 flex flex-col pt-safe">
      {/* Chat Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shrink-0">
        <Link to="/messages" className="text-gray-400 hover:text-gray-900 shrink-0 p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-emerald-100 rounded-full flex items-center justify-center font-bold text-brand-700 shrink-0">
          {otherUser?.name?.charAt(0)}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 leading-tight">{otherUser?.name}</h2>
          <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-widest mt-0.5">Online</p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4 max-w-3xl mx-auto flex flex-col pb-4">
            
            {/* System welcome message */}
            <div className="flex justify-center my-6">
                <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    Chat started
                </span>
            </div>

            {messages.map((msg, idx) => {
                const isMine = msg.senderId?._id === user._id;
                const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                <div key={msg._id || idx} className={`flex flex-col max-w-[80%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div 
                        className={`px-4 py-2.5 rounded-2xl relative shadow-sm ${
                            isMine 
                            ? 'bg-brand-500 text-white rounded-tr-sm' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                        }`}
                    >
                        <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 mt-1.5 px-1">{timeStr}</span>
                </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 shrink-0 pb-safe">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-end gap-2 relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 min-h-[50px] max-h-32 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none custom-scrollbar text-[15px]"
            rows={1}
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                }
            }}
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-gray-200 transition-colors shadow-sm mb-0.5"
          >
           <span className="text-xl leading-none origin-bottom-left rotate-45 -translate-y-0.5 -translate-x-0.5">🚀</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindowPage;
