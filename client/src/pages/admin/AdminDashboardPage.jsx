import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../lib/api';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';

function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl">🛑</h1>
          <h2 className="text-xl font-bold mt-4">Access Denied</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>🛡️</span> Admin Dashboard
          </h1>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-32 animate-pulse bg-gray-100 border-none"></div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Users Stat */}
            <div className="card bg-white border-l-4 border-l-brand-500">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-gray-900">{stats.users.total}</span>
                <span className="text-sm font-medium text-emerald-600 mb-1">{stats.users.active} Active</span>
              </div>
            </div>

            {/* Communities Stat */}
            <div className="card bg-white border-l-4 border-l-purple-500">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Communities</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-gray-900">{stats.communities.total}</span>
                <span className="text-sm font-medium text-emerald-600 mb-1">{stats.communities.verified} Verified</span>
              </div>
            </div>

            {/* Matches Stat */}
            <div className="card bg-white border-l-4 border-l-amber-500">
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Play Requests</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-gray-900">{stats.requests.total}</span>
                <span className="text-sm font-medium text-emerald-600 mb-1">{stats.requests.completed} Completed Matches</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Admin Navigation */}
        <h2 className="text-lg font-bold text-gray-900 mb-4 mt-8">Management Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            to="/admin/users" 
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              👥
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Manage Users</h3>
              <p className="text-sm text-gray-500">View, ban, or activate user accounts.</p>
            </div>
          </Link>

          <Link 
            to="/admin/communities" 
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              🏘️
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Manage Communities</h3>
              <p className="text-sm text-gray-500">Verify local communities to give them an official badge.</p>
            </div>
          </Link>
        </div>

        {/* Analytics Chart */}
        {stats?.chartData && stats.chartData.length > 0 && (
          <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Daily Signups (Last 30 Days)</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12 }} 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="New Users"
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboardPage;
