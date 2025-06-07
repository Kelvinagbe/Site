'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';

type TabType = 'signin' | 'signup' | 'forgot';

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  success: string;
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<TabType>('signin');
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    confirmPassword: '',
    loading: false,
    error: '',
    success: ''
  });

  const router = useRouter();

  const updateFormState = (updates: Partial<FormState>): void => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormState({
      email: '',
      password: '',
      confirmPassword: '',
      loading: false,
      error: '',
      success: ''
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    updateFormState({ loading: true, error: '', success: '' });

    try {
      if (activeTab === 'signin') {
        await signInWithEmailAndPassword(auth, formState.email, formState.password);
        router.push('/dashboard');
      } else if (activeTab === 'signup') {
        if (formState.password !== formState.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formState.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await createUserWithEmailAndPassword(auth, formState.email, formState.password);
        router.push('/dashboard');
      } else if (activeTab === 'forgot') {
        await sendPasswordResetEmail(auth, formState.email);
        updateFormState({ 
          success: 'Password reset email sent! Check your inbox.',
          email: ''
        });
      }
    } catch (error: any) {
      updateFormState({ error: error.message || 'An error occurred during authentication' });
    } finally {
      updateFormState({ loading: false });
    }
  };

  const tabs = [
    { id: 'signin', label: 'Sign In', icon: '🔑' },
    { id: 'signup', label: 'Sign Up', icon: '👤' },
    { id: 'forgot', label: 'Reset Password', icon: '🔄' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 right-20 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Glass morphism container */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 relative">
          {/* Logo/Brand area */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Apexion</h1>
            <p className="text-gray-300 text-sm">Welcome to your dashboard</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8 backdrop-blur-sm border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all duration-300 relative overflow-hidden ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-1">
                  <span className="text-sm">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => updateFormState({ email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300 backdrop-blur-sm"
                  placeholder="Enter your email"
                  disabled={formState.loading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-400">📧</span>
                </div>
              </div>
            </div>

            {/* Password Field - Hidden for forgot password */}
            {activeTab !== 'forgot' && (
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={formState.password}
                    onChange={(e) => updateFormState({ password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300 backdrop-blur-sm"
                    placeholder="Enter your password"
                    disabled={formState.loading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-400">🔒</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Field - Only for signup */}
            {activeTab === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formState.confirmPassword}
                    onChange={(e) => updateFormState({ confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300 backdrop-blur-sm"
                    placeholder="Confirm your password"
                    disabled={formState.loading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-400">🔒</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {formState.error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{formState.error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {formState.success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>{formState.success}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formState.loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 font-medium shadow-lg transform hover:scale-105 active:scale-95"
            >
              {formState.loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>
                  {activeTab === 'signin' && '🔑 Sign In'}
                  {activeTab === 'signup' && '👤 Create Account'}
                  {activeTab === 'forgot' && '📧 Send Reset Email'}
                </span>
              )}
            </button>
          </form>

          {/* Additional Links */}
          {activeTab === 'signin' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => handleTabChange('forgot')}
                disabled={formState.loading}
                className="text-purple-300 hover:text-purple-200 text-sm font-medium disabled:opacity-50 transition duration-200"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-xs">
              Protected by advanced security measures
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-500 rounded-full opacity-20 animate-ping animation-delay-1000"></div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}