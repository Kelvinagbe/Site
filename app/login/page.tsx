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
        router.push('/tools');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {!showFallback ? (
              <Image 
                src="/favicon.ico" 
                alt="Apexion Logo" 
                width={40}
                height={40}
                className="w-10 h-10"
                onError={() => setShowFallback(true)}
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {activeTab === 'signin' && 'Welcome'}
            {activeTab === 'signup' && 'Sign Up'}
            {activeTab === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-gray-600 text-sm">
            {activeTab === 'signin' && 'Please sign in to your account'}
            {activeTab === 'signup' && 'Create your new account'}
            {activeTab === 'forgot' && 'Enter your email to reset your password'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) => updateFormState({ email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter your email"
                disabled={formState.loading}
              />
            </div>

            {/* Password Field - Hidden for forgot password */}
            {activeTab !== 'forgot' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formState.password}
                  onChange={(e) => updateFormState({ password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter your password"
                  disabled={formState.loading}
                />
              </div>
            )}

            {/* Confirm Password Field - Only for signup */}
            {activeTab === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formState.confirmPassword}
                  onChange={(e) => updateFormState({ confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Confirm your password"
                  disabled={formState.loading}
                />
              </div>
            )}

            {/* Error Message */}
            {formState.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {formState.error}
              </div>
            )}

            {/* Success Message */}
            {formState.success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {formState.success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formState.loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {formState.loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>
                  {activeTab === 'signin' && 'Continue'}
                  {activeTab === 'signup' && 'Sign Up'}
                  {activeTab === 'forgot' && 'Send Reset Email'}
                </span>
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            {activeTab === 'signin' && (
              <button
                onClick={() => handleTabChange('forgot')}
                disabled={formState.loading}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50 transition duration-200"
              >
                Forgot your password?
              </button>
            )}

            {activeTab === 'forgot' && (
              <button
                onClick={() => handleTabChange('signin')}
                disabled={formState.loading}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50 transition duration-200"
              >
                ← Back to Sign In
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secured by Apexion
          </p>
        </div>
      </div>
    </div>
  );
}