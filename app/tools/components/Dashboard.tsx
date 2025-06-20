'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface Transaction {
  id: string;
  prompt: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  imageUrl?: string;
}

interface UserStats {
  totalGenerations: number;
  todayGenerations: number;
  weekGenerations: number;
  monthGenerations: number;
}

export function Dashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalGenerations: 0,
    todayGenerations: 0,
    weekGenerations: 0,
    monthGenerations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history'>('overview');

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user data when authenticated
  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-data?userId=${currentUser.uid}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
        setUserStats(data.stats || {
          totalGenerations: 0,
          todayGenerations: 0,
          weekGenerations: 0,
          monthGenerations: 0,
        });
      } else {
        setError(data.error || 'Failed to fetch user data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    const icons = { 'completed': '✅', 'pending': '⏳', 'failed': '❌' };
    return icons[status] || '❓';
  };

  const downloadImage = async (transaction: Transaction) => {
    if (!transaction.imageUrl) return;
    try {
      const link = document.createElement('a');
      link.href = transaction.imageUrl;
      link.download = `image-${transaction.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center px-4">
        <div className="text-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 w-full max-w-sm">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            Please log in to view your dashboard
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg text-sm"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-3 py-4 max-w-md">
        {/* Header */}
        <div className="mb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-1">
              📊 Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm truncate">
              Welcome, {currentUser.displayName || currentUser.email?.split('@')[0]}
            </p>
          </div>
          <div className="mt-3">
            <button
              onClick={() => window.location.href = '/generator'}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg text-sm"
            >
              🎨 Generate New Image
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4">
          <nav className="flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            {[
              { id: 'overview', label: '📈 Overview' },
              { id: 'history', label: '📚 History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 py-2.5 px-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total', value: userStats.totalGenerations, icon: '🎨', color: 'from-purple-500 to-purple-600' },
                { label: 'Today', value: userStats.todayGenerations, icon: '📅', color: 'from-blue-500 to-blue-600' },
                { label: 'Week', value: userStats.weekGenerations, icon: '📊', color: 'from-green-500 to-green-600' },
                { label: 'Month', value: userStats.monthGenerations, icon: '📈', color: 'from-orange-500 to-orange-600' }
              ].map((stat, index) => (
                <div key={index} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="mr-2">🕒</span>
                Recent Activity
              </h3>
              {loading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Loading...</p>
                </div>
              ) : transactions.slice(0, 3).length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-lg">{getStatusIcon(transaction.status)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {transaction.prompt}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.timestamp)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)} ml-2`}>
                        {transaction.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">🎨</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No images yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start creating!</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={fetchUserData}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm"
              >
                🔄 Refresh Data
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to sign out?')) {
                    auth.signOut();
                  }
                }}
                className="w-full bg-red-600 dark:bg-red-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors text-sm"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="mr-2">📚</span>
              History ({transactions.length})
            </h3>
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Loading...</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(transaction.status)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium text-sm mb-2">
                      {transaction.prompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {transaction.id}
                      </p>
                      {transaction.status === 'completed' && transaction.imageUrl && (
                        <button
                          onClick={() => downloadImage(transaction)}
                          className="px-3 py-1.5 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-xs font-medium flex items-center space-x-1"
                        >
                          <span>📥</span>
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🔍</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No history found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Generate images to see history</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Centered Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm mx-auto animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="text-center">
              <div className="text-4xl mb-3">❌</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Error</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="w-full bg-red-600 dark:bg-red-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}