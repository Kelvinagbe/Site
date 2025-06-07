'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  const [showFallback, setShowFallback] = useState(false);
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
    { id: 'signin', label: 'Sign In' },
    { id: 'signup', label: 'Sign Up' },
    { id: 'forgot', label: 'Reset' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-30 sm:w-60 h-30 sm:h-60 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Glass morphism container */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-200/50 p-4 sm:p-6 lg:p-8 relative">
          {/* Logo/Brand area */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-3 sm:mb-4 shadow-lg">
              {!showFallback ? (
                <Image 
                  src="/favicon.ico" 
                  alt="Apexion Logo" 
                  width={24}
                  height={24}
                  className="w-6 h-6 sm:w-8 sm:h-8"
                  onError={() => setShowFallback(true)}
                />
              ) : (
                <span className="text-lg sm:text-2xl font-bold text-white">A</span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Apexion</h1>
            <p className="text-gray-600 text-xs sm:text-sm">Secure access to your dashboard</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-blue-50/80 rounded-xl p-1 mb-6 sm:mb-8 backdrop-blur-sm border border-blue-200/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-100/50'
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-20 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          {/* Form Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
              {activeTab === 'signin' && 'Welcome Back'}
              {activeTab === 'signup' && 'Create Account'}
              {activeTab === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              {activeTab === 'signin' && 'Sign in to access your dashboard'}
              {activeTab === 'signup' && 'Join Apexion today'}
              {activeTab === 'forgot' && 'Enter your email to reset your password'}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => updateFormState({ email: e.target.value })}
                  required
                  className="w-full px-10 sm:px-12 py-2.5 sm:py-3 bg-white/80 border border-blue-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 backdrop-blur-sm text-sm sm:text-base"
                  placeholder="Enter your email address"
                  disabled={formState.loading}
                />
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field - Hidden for forgot password */}
            {activeTab !== 'forgot' && (
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
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
                    className="w-full px-10 sm:px-12 py-2.5 sm:py-3 bg-white/80 border border-blue-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 backdrop-blur-sm text-sm sm:text-base"
                    placeholder="Enter your password"
                    disabled={formState.loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Field - Only for signup */}
            {activeTab === 'signup' && (
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700">
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
                    className="w-full px-10 sm:px-12 py-2.5 sm:py-3 bg-white/80 border border-blue-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 backdrop-blur-sm text-sm sm:text-base"
                    placeholder="Confirm your password"
                    disabled={formState.loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {formState.error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm backdrop-blur-sm animate-fadeIn">
                <div className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="break-words">{formState.error}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {formState.success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm backdrop-blur-sm animate-fadeIn">
                <div className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="break-words">{formState.success}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formState.loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 font-semibold shadow-lg transform hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              {formState.loading ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>
                  {activeTab === 'signin' && 'Sign In to Dashboard'}
                  {activeTab === 'signup' && 'Create Account'}
                  {activeTab === 'forgot' && 'Send Reset Email'}
                </span>
              )}
            </button>
          </form>

          {/* Additional Links */}
          {activeTab === 'signin' && (
            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={() => handleTabChange('forgot')}
                disabled={formState.loading}
                className="text-blue-600 hover:text-blue-500 text-xs sm:text-sm font-medium disabled:opacity-50 transition duration-200 underline decoration-transparent hover:decoration-current"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {activeTab === 'forgot' && (
            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={() => handleTabChange('signin')}
                disabled={formState.loading}
                className="text-blue-600 hover:text-blue-500 text-xs sm:text-sm font-medium disabled:opacity-50 transition duration-200 underline decoration-transparent hover:decoration-current"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Security Footer */}
          <div className="mt-6 sm:mt-8 text-center border-t border-blue-200/50 pt-4 sm:pt-6">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-center">Secured with enterprise-grade encryption</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-1 sm:-top-2 -left-1 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full opacity-60 animate-ping"></div>
        <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full opacity-60 animate-ping animation-delay-1000"></div>
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