import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../lib/firebase';
import { signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const DatabaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

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

// Theme options
const themes = [
  { id: 'light', name: 'Light', preview: 'bg-white border-2 border-slate-200' },
  { id: 'dark', name: 'Dark', preview: 'bg-slate-900 border-2 border-slate-700' },
  { id: 'blue', name: 'Ocean Blue', preview: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  { id: 'purple', name: 'Purple', preview: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  { id: 'green', name: 'Nature Green', preview: 'bg-gradient-to-br from-green-400 to-green-600' },
  { id: 'rose', name: 'Rose', preview: 'bg-gradient-to-br from-rose-400 to-rose-600' },
];

interface UserSettings {
  theme: string;
  notifications: boolean;
  emailNotifications: boolean;
  autoSave: boolean;
  language: string;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const router = useRouter();

  // Profile states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Settings states
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    notifications: true,
    emailNotifications: true,
    autoSave: true,
    language: 'en'
  });

  // Storage stats
  const [storageStats, setStorageStats] = useState({
    used: 0,
    total: 1000, // MB
    files: 0
  });

  useEffect(() => {
    if (auth.currentUser) {
      setDisplayName(auth.currentUser.displayName || '');
      setEmail(auth.currentUser.email || '');
      loadUserSettings();
      loadStorageStats();
    }
  }, []);

  const loadUserSettings = async () => {
    if (auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'userSettings', auth.currentUser.uid));
        if (userDoc.exists()) {
          setSettings({ ...settings, ...userDoc.data() });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  };

  const loadStorageStats = async () => {
    // This would typically fetch from your Firebase storage or a custom endpoint
    // For now, we'll simulate some data
    setStorageStats({
      used: Math.floor(Math.random() * 500) + 50,
      total: 1000,
      files: Math.floor(Math.random() * 100) + 10
    });
  };

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

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!auth.currentUser) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      await setDoc(doc(db, 'userSettings', auth.currentUser.uid), updatedSettings, { merge: true });
      
      // Apply theme change
      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }
      
      showMessage('Settings updated successfully!', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Failed to update settings', 'error');
    }
  };

  const applyTheme = (theme: string) => {
    // Remove existing theme classes
    document.documentElement.classList.remove('light', 'dark', 'blue', 'purple', 'green', 'rose');
    
    // Add new theme class
    document.documentElement.classList.add(theme);
    
    // You can also use your installed theme package here
    // For example, if using next-themes:
    // setTheme(theme);
    
    // Or if using a custom theme context:
    // themeContext.setTheme(theme);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error: any) {
      showMessage(error.message || 'Failed to sign out', 'error');
    }
  };

  const clearAppData = async () => {
    if (!confirm('Are you sure you want to clear all app data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      // Clear user settings
      if (auth.currentUser) {
        await setDoc(doc(db, 'userSettings', auth.currentUser.uid), {
          theme: 'light',
          notifications: true,
          emailNotifications: true,
          autoSave: true,
          language: 'en'
        });
      }

      // Clear local storage
      localStorage.clear();
      
      // Reset settings state
      setSettings({
        theme: 'light',
        notifications: true,
        emailNotifications: true,
        autoSave: true,
        language: 'en'
      });

      applyTheme('light');
      showMessage('App data cleared successfully!', 'success');
    } catch (error: any) {
      showMessage(error.message || 'Failed to clear app data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: LockIcon },
    { id: 'appearance', name: 'Appearance', icon: PaletteIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'data', name: 'Data & Storage', icon: DatabaseIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your account and application preferences</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
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
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                <span className="font-medium">{name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">Profile Information</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">Security Settings</h2>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">Appearance Settings</h2>
              
              <div>
                <h3 className="text-lg font-medium text-slate-700 mb-4">Choose Theme</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleUpdateSettings({ theme: theme.id })}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        settings.theme === theme.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-md mb-2 ${theme.preview}`}></div>
                      <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                      {settings.theme === theme.id && (
                        <CheckIcon className="w-4 h-4 text-blue-500 mx-auto mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-800">Push Notifications</h3>
                    <p className="text-sm text-slate-600">Receive notifications in the app</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleUpdateSettings({ notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-800">Email Notifications</h3>
                    <p className="text-sm text-slate-600">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleUpdateSettings({ emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-800">Auto Save</h3>
                    <p className="text-sm text-slate-600">Automatically save your work</p>
                  </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => handleUpdateSettings({ autoSave: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-800">Data & Storage</h2>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-medium text-slate-800 mb-4">Storage Usage</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Used</span>
                    <span className="font-medium">{storageStats.used} MB of {storageStats.total} MB</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(storageStats.used / storageStats.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500">{storageStats.files} files stored</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={clearAppData}
                  disabled={loading}
                  className="w-full bg-red-50 text-red-700 border border-red-200 px-6 py-3 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Clearing...' : 'Clear All App Data'}
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full bg-slate-100 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center"
                >
                  <LogoutIcon className="w-5 h-5 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;