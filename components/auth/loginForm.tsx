// components/auth/LoginForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface LoginState {
  email: string;
  password: string;
  isSignUp: boolean;
  loading: boolean;
  error: string;
}

export default function LoginForm() {
  const [formState, setFormState] = useState<LoginState>({
    email: '',
    password: '',
    isSignUp: false,
    loading: false,
    error: ''
  });

  const router = useRouter();

  const updateFormState = (updates: Partial<LoginState>): void => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    updateFormState({ loading: true, error: '' });

    try {
      if (formState.isSignUp) {
        await createUserWithEmailAndPassword(auth, formState.email, formState.password);
      } else {
        await signInWithEmailAndPassword(auth, formState.email, formState.password);
      }
      router.push('/dashboard');
    } catch (error: any) {
      updateFormState({ error: error.message || 'An error occurred during authentication' });
    } finally {
      updateFormState({ loading: false });
    }
  };

  const toggleMode = (): void => {
    updateFormState({ 
      isSignUp: !formState.isSignUp, 
      error: '',
      email: '',
      password: ''
    });
  };

  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {formState.isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-600">
          {formState.isSignUp ? 'Sign up for a new account' : 'Sign in to your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formState.email}
            onChange={(e) => updateFormState({ email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Enter your email"
            disabled={formState.loading}
          />
        </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Enter your password"
            disabled={formState.loading}
          />
        </div>

        {formState.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {formState.error}
          </div>
        )}

        <button
          type="submit"
          disabled={formState.loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {formState.loading ? 'Loading...' : (formState.isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={toggleMode}
          disabled={formState.loading}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 transition duration-200"
        >
          {formState.isSignUp 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"
          }
        </button>
      </div>
    </div>
  );
}