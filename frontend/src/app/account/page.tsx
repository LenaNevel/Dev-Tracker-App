'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, changePassword, User, UserProfileUpdate, PasswordChange } from '../../api/user';
import { Button } from '../../components/ui/Button';
import './account.css';

interface ProfileFormData {
  username: string;
  email: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function AccountPage() {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: '',
    email: ''
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserProfile();
        if (response.status === 'success' && response.data) {
          const userData = response.data.user;
          setUser(userData);
          setProfileForm({
            username: userData.username,
            email: userData.email
          });
        } else {
          setError(response.error || 'Failed to load user profile');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [isAuthenticated]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(null);
    setProfileSubmitting(true);

    try {
      const updateData: UserProfileUpdate = {};
      
      // Only include changed fields
      if (profileForm.username !== user.username) {
        updateData.username = profileForm.username;
      }
      if (profileForm.email !== user.email) {
        updateData.email = profileForm.email;
      }

      // If no changes, just exit edit mode
      if (Object.keys(updateData).length === 0) {
        setIsEditingProfile(false);
        setProfileSubmitting(false);
        return;
      }

      const response = await updateUserProfile(updateData);
      if (response.status === 'success' && response.data) {
        setUser(response.data.user);
        setIsEditingProfile(false);
        setSuccess('Profile updated successfully!');
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(null);

    // Validate password confirmation
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New password and confirmation do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setPasswordSubmitting(true);

    try {
      const response = await changePassword(passwordForm);
      if (response.status === 'success') {
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setIsChangingPassword(false);
        setSuccess('Password changed successfully!');
      } else {
        setError(response.error || 'Failed to change password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleCancelProfileEdit = () => {
    if (user) {
      setProfileForm({
        username: user.username,
        email: user.email
      });
    }
    setIsEditingProfile(false);
    setError(null);
  };

  const handleCancelPasswordChange = () => {
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setIsChangingPassword(false);
    setError(null);
  };

  if (!isAuthenticated) {
    return (
      <main className="page">
        <div className="account-container">
          <h2>Please log in to view your account</h2>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <div className="account-container">
          <h2>Loading your account...</h2>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page">
        <div className="account-container">
          <h2>Unable to load account information</h2>
          {error && <p className="error-message">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="account-container">
        <div className="account-header">
          <h1 className="account-title">Account Settings</h1>
          <p className="account-subtitle">Manage your profile and account preferences</p>
        </div>

        {/* Status Messages */}
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        {/* Profile Information Section */}
        <div className="account-section">
          <div className="section-header">
            <h2 className="section-title">Profile Information</h2>
            {!isEditingProfile && (
              <Button
                variant="secondary"
                onClick={() => setIsEditingProfile(true)}
                className="edit-button"
              >
                ✏️ Edit Profile
              </Button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                  minLength={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  loading={profileSubmitting}
                  disabled={profileSubmitting}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelProfileEdit}
                  disabled={profileSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="info-group">
                <span className="info-label">Username:</span>
                <span className="info-value">{user.username}</span>
              </div>
              <div className="info-group">
                <span className="info-label">Email:</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-group">
                <span className="info-label">Member since:</span>
                <span className="info-value">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="account-section">
          <div className="section-header">
            <h2 className="section-title">Password & Security</h2>
            {!isChangingPassword && (
              <Button
                variant="secondary"
                onClick={() => setIsChangingPassword(true)}
                className="edit-button"
              >
                🔒 Change Password
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="current_password" className="form-label">Current Password</label>
                <input
                  type="password"
                  id="current_password"
                  className="form-input"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new_password" className="form-label">New Password</label>
                <input
                  type="password"
                  id="new_password"
                  className="form-input"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  required
                  minLength={6}
                />
                <small className="form-hint">Password must be at least 6 characters long</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password" className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm_password"
                  className="form-input"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-actions">
                <Button
                  type="submit"
                  variant="primary"
                  loading={passwordSubmitting}
                  disabled={passwordSubmitting}
                >
                  Change Password
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelPasswordChange}
                  disabled={passwordSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="password-display">
              <p className="password-info">
                Keep your account secure by using a strong, unique password.
              </p>
              <p className="password-status">
                <span className="info-label">Last updated:</span>
                <span className="info-value">
                  {user.updated_at 
                    ? new Date(user.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Never'
                  }
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}