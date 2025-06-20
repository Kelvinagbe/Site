import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { auth, db } from '../../../lib/firebase';
import { signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Icons
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const PaletteIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4z" /></svg>;
const BellIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // States
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setMounted(true);
    if (auth.currentUser) {
      setDisplayName(auth.currentUser.displayName || '');
      setEmail(auth.currentUser.email || '');
    }
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      await setDoc(doc(db, 'users', auth.currentUser.uid), { displayName, email, updatedAt: new Date() }, { merge: true });
      showMessage('Profile updated!');
      setShowModal('');
    } catch (error: any) {
      showMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser?.email || newPassword !== confirmPassword || newPassword.length < 6) {
      showMessage('Invalid password data');
      return;
    }
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showMessage('Password updated!');
      setShowModal('');
    } catch (error: any) {
      showMessage('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (selectedTheme: string) => {
    setTheme(selectedTheme);
    if (auth.currentUser) {
      await setDoc(doc(db, 'userSettings', auth.currentUser.uid), { theme: selectedTheme, updatedAt: new Date() }, { merge: true });
    }
    showMessage('Theme updated!');
    setShowModal('');
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      showMessage(permission === 'granted' ? 'Notifications enabled!' : 'Permission denied');
      if (permission === 'granted') {
        new Notification('Test Notification', { body: 'Notifications are working!' });
      }
    } catch (error) {
      showMessage('Failed to request permission');
    }
    setShowModal('');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error: any) {
      showMessage('Failed to sign out');
    }
  };

  if (!mounted) return null;

  const inputClass = "w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100";
  const buttonClass = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors";

  const settingsCards = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <UserIcon />,
      description: 'Update your personal information',
      content: (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} disabled className={inputClass + " opacity-50"} />
          </div>
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      )
    },
    {
      id: 'security',
      title: 'Security',
      icon: <LockIcon />,
      description: 'Change your password',
      content: (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      )
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <PaletteIcon />,
      description: 'Customize your theme',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Choose your preferred theme</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', name: 'Light', bg: 'bg-white border-2 border-slate-200' },
              { id: 'dark', name: 'Dark', bg: 'bg-slate-900 border-2 border-slate-700' },
              { id: 'system', name: 'System', bg: 'bg-gradient-to-br from-slate-100 to-slate-300' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-3 rounded-lg border-2 transition-all ${theme === t.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 dark:border-slate-700'}`}
              >
                <div className={`w-full h-8 rounded mb-2 ${t.bg}`}></div>
                <span className="text-xs font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <BellIcon />,
      description: 'Manage notification settings',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="text-sm">Push Notifications</span>
            <span className={`px-2 py-1 rounded text-xs ${
              pushPermission === 'granted' ? 'bg-green-100 text-green-800' : 
              pushPermission === 'denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {pushPermission === 'granted' ? 'Enabled' : pushPermission === 'denied' ? 'Blocked' : 'Not Set'}
            </span>
          </div>
          {pushPermission !== 'granted' && (
            <button onClick={handleNotificationPermission} className={buttonClass}>
              Enable Notifications
            </button>
          )}
          {pushPermission === 'granted' && (
            <div className="grid grid-cols-2 gap-2">
              {['Info', 'Success', 'Warning', 'Error'].map((type) => (
                <button
                  key={type}
                  onClick={() => new Notification(`Test ${type}`, { body: `This is a ${type.toLowerCase()} notification` })}
                  className={`py-2 px-3 rounded text-sm text-white ${
                    type === 'Info' ? 'bg-blue-500' : type === 'Success' ? 'bg-green-500' : 
                    type === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                >
                  Test {type}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account preferences</p>
      </div>

      {message && (
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {settingsCards.map((card) => (
          <div key={card.id} className="relative group">
            <div
              className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-slate-200 dark:border-slate-700"
              onClick={() => setShowModal(card.id)}
            >
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mr-3">
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{card.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{card.description}</p>
                </div>
              </div>
            </div>

            {/* Hover Modal */}
            {showModal === card.id && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal('')}>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{card.title}</h2>
                    <button onClick={() => setShowModal('')} className="text-slate-400 hover:text-slate-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {card.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <button
          onClick={handleSignOut}
          className="flex items-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
        >
          <LogoutIcon />
          <span className="ml-2 font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;