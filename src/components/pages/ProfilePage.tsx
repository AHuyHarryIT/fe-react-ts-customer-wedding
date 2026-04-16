import { useEffect, useState } from 'react';
import { FiLock, FiMail, FiPhone, FiSave, FiUser } from 'react-icons/fi';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { useCustomerProfile } from '@/hooks/useCustomerProfile';
import { authApi } from '@/services/authService';
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/auth';
import type { ApiErrorData } from '@/types/error';
import { isVietnamesePhoneNumber } from '@/utils/phone';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ActiveTab = 'personal' | 'security';

type PersonalField = 'firstName' | 'lastName' | 'email' | 'phone';
type PersonalErrors = Partial<Record<PersonalField, string>>;

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const INITIAL_FORM_DATA: ProfileFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const getApiErrorData = (error: unknown): ApiErrorData | undefined => {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return undefined;
  }

  const response = (error as { response?: { data?: ApiErrorData } }).response;
  return response?.data;
};

const normalizeBackendFieldKey = (field: string): PersonalField | null => {
  if (field === 'firstName' || field === 'lastName' || field === 'email') {
    return field;
  }

  if (field === 'phone' || field === 'phoneNumber') {
    return 'phone';
  }

  return null;
};

const mapBackendFieldErrors = (errorData?: ApiErrorData): PersonalErrors => {
  const mapped: PersonalErrors = {};
  const fields = errorData?.details?.fields;

  if (!Array.isArray(fields)) {
    return mapped;
  }

  fields.forEach((entry) => {
    const key = normalizeBackendFieldKey(entry.field);
    if (!key || !entry.message) {
      return;
    }

    mapped[key] = entry.message;
  });

  return mapped;
};

const hasAnyFieldErrors = (errors: PersonalErrors): boolean =>
  Object.values(errors).some((value) => Boolean(value));

const validatePersonalValues = (email: string, phone: string): PersonalErrors => {
  const errors: PersonalErrors = {};

  if (email && !EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (phone && !isVietnamesePhoneNumber(phone)) {
    errors.phone = 'Please enter a valid Vietnamese phone number';
  }

  return errors;
};

const toPersonalPayload = (formData: ProfileFormData): UpdateProfileRequest => {
  const firstName = formData.firstName.trim();
  const lastName = formData.lastName.trim();
  const email = formData.email.trim();
  const phoneNumber = formData.phone.trim();

  return {
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    email: email || undefined,
    phoneNumber: phoneNumber || undefined,
  };
};

const inputClassName = (error?: string): string =>
  `w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
    error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-rose-400'
  }`;

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
  const { profile, loading, error, refetch } = useCustomerProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<PersonalErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phoneNumber || '',
    }));
    setFieldErrors({});
    setFormError(null);
  }, [profile]);

  const updatePersonalField = (field: PersonalField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError(null);
  };

  const handlePersonalSave = async () => {
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();

    const validationErrors = validatePersonalValues(trimmedEmail, trimmedPhone);
    if (hasAnyFieldErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setFormError(null);

    const payload = toPersonalPayload(formData);

    await authApi.updateProfile(payload);
    await refetch();
    toast.success('Profile updated successfully');
  };

  const handleSecuritySave = async () => {
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
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (activeTab === 'personal') {
        await handlePersonalSave();
      } else {
        await handleSecuritySave();
      }
    } catch (caughtError: unknown) {
      if (activeTab === 'personal') {
        const errorData = getApiErrorData(caughtError);
        const backendFieldErrors = mapBackendFieldErrors(errorData);

        if (hasAnyFieldErrors(backendFieldErrors)) {
          setFieldErrors(backendFieldErrors);
        } else {
          const fallbackMessage =
            'We could not save your profile updates. Please review your information and try again.';
          setFormError(fallbackMessage);
          toast.error(fallbackMessage);
          return;
        }

        toast.error(errorData?.message || 'Failed to save profile changes');
      } else {
        const fallback = 'Failed to save settings';
        const message = getApiErrorData(caughtError)?.message || fallback;
        toast.error(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: Array<{ id: ActiveTab; label: string; icon: typeof FiUser }> = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CustomerStatePanel
            tone="loading"
            title="Loading account details"
            description="We are refreshing your profile and security information."
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CustomerStatePanel
            tone="error"
            title="Could not load profile"
            description={error}
            actions={
              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                className="px-5 py-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                Retry
              </button>
            }
          />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CustomerStatePanel
            tone="empty"
            title="Profile unavailable"
            description="We could not find your profile data. Please refresh and try again."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Personal Information</h2>

                  {formError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {formError}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="profile-first-name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        First Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                          id="profile-first-name"
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          value={formData.firstName}
                          onChange={(event) => updatePersonalField('firstName', event.target.value)}
                          className={inputClassName(fieldErrors.firstName)}
                        />
                      </div>
                      {fieldErrors.firstName ? (
                        <p className="mt-2 text-sm text-red-600">{fieldErrors.firstName}</p>
                      ) : null}
                    </div>

                    <div>
                      <label
                        htmlFor="profile-last-name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Last Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                          id="profile-last-name"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          value={formData.lastName}
                          onChange={(event) => updatePersonalField('lastName', event.target.value)}
                          className={inputClassName(fieldErrors.lastName)}
                        />
                      </div>
                      {fieldErrors.lastName ? (
                        <p className="mt-2 text-sm text-red-600">{fieldErrors.lastName}</p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id="profile-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(event) => updatePersonalField('email', event.target.value)}
                        className={inputClassName(fieldErrors.email)}
                      />
                    </div>
                    {fieldErrors.email ? (
                      <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="profile-phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id="profile-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(event) => updatePersonalField('phone', event.target.value)}
                        className={inputClassName(fieldErrors.phone)}
                      />
                    </div>
                    {fieldErrors.phone ? (
                      <p className="mt-2 text-sm text-red-600">{fieldErrors.phone}</p>
                    ) : null}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Change Password</h2>

                  <div>
                    <label
                      htmlFor="profile-current-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id="profile-current-password"
                        name="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        value={formData.currentPassword}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, currentPassword: event.target.value }))
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-new-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id="profile-new-password"
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        value={formData.newPassword}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, newPassword: event.target.value }))
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-confirm-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        id="profile-confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <FiSave className="size-5" />
                  {isSaving
                    ? 'Saving...'
                    : activeTab === 'personal'
                      ? 'Save Profile Changes'
                      : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
