import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiSave } from 'react-icons/fi';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { authApi } from '@/services/authService';
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/auth';
import { useCustomerProfile } from '@/hooks/useCustomerProfile';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const { profile, loading, error, refetch } = useCustomerProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    weddingDate: '2026-06-15',
    weddingVenue: 'The Grand Hotel',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (!profile) return;
    setFormData((prev) => ({
      ...prev,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phoneNumber || '',
    }));
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'personal') {
        const payload: UpdateProfileRequest = {
          firstName: formData.firstName.trim() || undefined,
          lastName: formData.lastName.trim() || undefined,
          email: formData.email.trim() || undefined,
        };

        await authApi.updateProfile(payload);
        await refetch();
        toast.success('Profile updated successfully');
      } else if (activeTab === 'security') {
        if (!formData.currentPassword || !formData.newPassword) {
          toast.error('Please fill in current and new password');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New password and confirmation do not match');
          return;
        }

        const payload: ChangePasswordRequest = {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        };

        await authApi.changePassword(payload);
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        toast.success('Password changed successfully');
      } else {
        toast.success('Settings saved successfully!');
      }
    } catch (error: unknown) {
      let message = 'Failed to save settings';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        message = axiosError.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
  ];
  const firstNameId = 'profile-first-name';
  const lastNameId = 'profile-last-name';
  const emailId = 'profile-email';
  const phoneId = 'profile-phone';
  const weddingDateId = 'profile-wedding-date';
  const weddingVenueId = 'profile-wedding-venue';
  const currentPasswordId = 'profile-current-password';
  const newPasswordId = 'profile-new-password';
  const confirmPasswordId = 'profile-confirm-password';
  const emailNotificationsId = 'profile-email-notifications';
  const smsNotificationsId = 'profile-sms-notifications';
  const marketingEmailsId = 'profile-marketing-emails';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
          {loading ? (
            <div className="mt-4 max-w-2xl">
              <CustomerStatePanel
                tone="loading"
                title="Loading account details"
                description="We are refreshing your profile and security information."
              />
            </div>
          ) : error ? (
            <div className="mt-4 max-w-2xl">
              <CustomerStatePanel tone="error" title="Could not load profile" description={error} />
            </div>
          ) : null}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-md p-2"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white'
                      : 'text-gray-600 hover:bg-rose-50'
                  }`}
                >
                  <tab.icon className="size-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </motion.div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              {/* Personal Info */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Personal Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor={firstNameId}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                          id={firstNameId}
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={lastNameId}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Last Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                          id={lastNameId}
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={emailId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id={emailId}
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={phoneId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id={phoneId}
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wedding Details */}
              {activeTab === 'wedding' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Wedding Details</h2>

                  <div>
                    <label
                      htmlFor={weddingDateId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Wedding Date
                    </label>
                    <input
                      id={weddingDateId}
                      name="weddingDate"
                      type="date"
                      autoComplete="off"
                      value={formData.weddingDate}
                      onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={weddingVenueId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Wedding Venue
                    </label>
                    <input
                      id={weddingVenueId}
                      name="weddingVenue"
                      type="text"
                      autoComplete="organization"
                      value={formData.weddingVenue}
                      onChange={(e) => setFormData({ ...formData, weddingVenue: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div className="bg-rose-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Changes to your wedding date or venue may affect your
                      booking. Please contact us if you need to make significant changes.
                    </p>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Change Password</h2>

                  <div>
                    <label
                      htmlFor={currentPasswordId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id={currentPasswordId}
                        name="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        value={formData.currentPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, currentPassword: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={newPasswordId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id={newPasswordId}
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={confirmPasswordId}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id={confirmPasswordId}
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    <label
                      htmlFor={emailNotificationsId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-rose-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-600">
                          Receive updates about your booking via email
                        </p>
                      </div>
                      <input
                        id={emailNotificationsId}
                        name="emailNotifications"
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={(e) =>
                          setFormData({ ...formData, emailNotifications: e.target.checked })
                        }
                        className="size-5 text-rose-500 rounded focus:ring-rose-400"
                      />
                    </label>

                    <label
                      htmlFor={smsNotificationsId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-rose-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-800">SMS Notifications</p>
                        <p className="text-sm text-gray-600">
                          Get text messages for important updates
                        </p>
                      </div>
                      <input
                        id={smsNotificationsId}
                        name="smsNotifications"
                        type="checkbox"
                        checked={formData.smsNotifications}
                        onChange={(e) =>
                          setFormData({ ...formData, smsNotifications: e.target.checked })
                        }
                        className="size-5 text-rose-500 rounded focus:ring-rose-400"
                      />
                    </label>

                    <label
                      htmlFor={marketingEmailsId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-rose-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-800">Marketing Emails</p>
                        <p className="text-sm text-gray-600">
                          Receive tips, offers, and wedding inspiration
                        </p>
                      </div>
                      <input
                        id={marketingEmailsId}
                        name="marketingEmails"
                        type="checkbox"
                        checked={formData.marketingEmails}
                        onChange={(e) =>
                          setFormData({ ...formData, marketingEmails: e.target.checked })
                        }
                        className="size-5 text-rose-500 rounded focus:ring-rose-400"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                >
                  <FiSave className="size-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
