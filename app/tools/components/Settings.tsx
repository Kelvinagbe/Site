import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { auth, db } from '../../../lib/firebase';
import { signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Icon Components
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const PaletteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3C5.239 3 4.239 4.216 4.239 6s1.239 3 3.239 3 3.239-1.216 3.239-3S9.239 3 7.239 3z" />
  </svg>
);

// Theme options
const themes = [
  { id: 'light', name: 'Light', preview: 'bg-white border-2 border-slate-200' },
  { id: 'dark', name: 'Dark', preview: 'bg-slate-900 border-2 border-slate-700' },
  { id: 'system', name: 'System', preview: 'bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-800 dark:to-slate-600' },
];

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Profile states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fix hydration issues with next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadUserTheme = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'userSettings', auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().theme) {
          setTheme(userDoc.data().theme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
  }, [setTheme]);

  useEffect(() => {
    if (auth.currentUser) {
      setDisplayName(auth.currentUser.displayName || '');
      setEmail(auth.currentUser.email || '');
      loadUserTheme();
    }
  }, [loadUserTheme]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName
      });

      // Update user document in Firestore
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName,
        email,
        updatedAt: new Date()
      }, { merge: true });

      showMessage('Profile updated successfully!', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !auth.currentUser.email) return;

    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Password updated successfully!', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (selectedTheme: string) => {
    setTheme(selectedTheme);
    
    // Save theme preference to Firestore
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'userSettings', auth.currentUser.uid), {
          theme: selectedTheme,
          updatedAt: new Date()
        }, { merge: true });
        
        showMessage('Theme updated successfully!', 'success');
      } catch (error: any) {
        showMessage('Failed to save theme preference', 'error');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error: any) {
      showMessage(error.message || 'Failed to sign out', 'error');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: LockIcon },
    { id: 'appearance', name: 'Appearance', icon: PaletteIcon },
  ];

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-slate-800/25 transition-colors duration-200">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account settings</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          messageType === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          <CheckIcon className="w-5 h-5 mr-2" />
          {message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map(({ id, name, icon: IconComponent }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                <span className="font-medium">{name}</span>
              </button>
            ))}
          </nav>

          {/* Sign Out Button */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-all duration-200"
            >
              <LogoutIcon className="w-5 h-5 mr-3" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Profile Information</h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Email cannot be changed</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Security Settings</h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Appearance Settings</h2>

              <div>
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">Choose Theme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {themes.map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeChange(themeOption.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        theme === themeOption.id
                          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-md mb-2 ${themeOption.preview}`}></div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{themeOption.name}</span>
                      {theme === themeOption.id && (
                        <CheckIcon className="w-4 h-4 text-blue-500 mx-auto mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;