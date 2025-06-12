'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';

type AuthMode = 'signin' | 'signup' | 'forgot';

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  success: string;
}

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
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
  const { theme, setTheme } = useTheme();

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

  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    updateFormState({ loading: true, error: '', success: '' });

    try {
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, formState.email, formState.password);
        router.push('/dashboard');
      } else if (authMode === 'signup') {
        if (formState.password !== formState.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formState.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await createUserWithEmailAndPassword(auth, formState.email, formState.password);
        router.push('/dashboard');
      } else if (authMode === 'forgot') {
        await sendPasswordResetEmail(auth, formState.email);
        updateFormState({ 
          success: 'Password reset email sent! Check your inbox.',
          email: ''
        });
      }
    } catch (error: any) {
      updateFormState({ error: error.message || 'Authentication failed' });
    } finally {
      updateFormState({ loading: false });
    }
  };

  const getModeContent = () => {
    switch (authMode) {
      case 'signin':
        return {
          title: 'Sign in to your account',
          subtitle: 'Welcome back! Please enter your details.',
          button: 'Sign in',
          link: { text: "Don't have an account? Sign up", action: () => handleModeChange('signup') }
        };
      case 'signup':
        return {
          title: 'Create your account',
          subtitle: 'Join us today! Please fill in your details.',
          button: 'Create account',
          link: { text: 'Already have an account? Sign in', action: () => handleModeChange('signin') }
        };
      case 'forgot':
        return {
          title: 'Reset your password',
          subtitle: 'Enter your email to receive reset instructions.',
          button: 'Send reset email',
          link: { text: 'Back to sign in', action: () => handleModeChange('signin') }
        };
    }
  };

  const content = getModeContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 relative">
        <div className="flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="max-w-md text-center">
            <div className="mb-8">
              {!showFallback ? (
                <Image 
                  src="/favicon.ico" 
                  alt="Apexion Logo" 
                  width={64}
                  height={64}
                  className="w-16 h-16 mx-auto mb-4"
                  onError={() => setShowFallback(true)}
                />
              ) : (
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">A</span>
                </div>
              )}
              <h1 className="text-4xl font-bold mb-4">Welcome to Apexion</h1>
              <p className="text-lg opacity-90">
                Secure access to your productivity tools and analytics dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-gray-900">
        <div className="mx-auto w-full max-w-md">
          {/* Theme Toggle */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            {!showFallback ? (
              <Image 
                src="/favicon.ico" 
                alt="Apexion Logo" 
                width={48}
                height={48}
                className="w-12 h-12 mx-auto mb-4"
                onError={() => setShowFallback(true)}
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">A</span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Apexion</h2>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{content.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{content.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formState.email}
                onChange={(e) => updateFormState({ email: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter your email"
                disabled={formState.loading}
              />
            </div>

            {authMode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  value={formState.password}
                  onChange={(e) => updateFormState({ password: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                  disabled={formState.loading}
                />
              </div>
            )}

            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formState.confirmPassword}
                  onChange={(e) => updateFormState({ confirmPassword: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Confirm your password"
                  disabled={formState.loading}
                />
              </div>
            )}

            {authMode === 'signin' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleModeChange('forgot')}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition duration-200"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {formState.error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {formState.error}
              </div>
            )}

            {formState.success && (
              <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                {formState.success}
              </div>
            )}

            <button
              type="submit"
              disabled={formState.loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 dark:ring-offset-gray-900"
            >
              {formState.loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                content.button
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={content.link.action}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition duration-200"
              >
                {content.link.text}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}