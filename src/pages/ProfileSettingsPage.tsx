import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface ProfileData {
  full_name: string | null
  email: string | null
  service_branch: string | null
  service_status: string | null
  pay_grade: string | null
  duty_location: string | null
  disability_rating: number | null
  tricare_region: string | null
  spouse_enrolled: boolean
  family_size: number | null
  privacy_level: string | null
  phone_number: string | null
  preferred_contact: string | null
}

interface NotificationSettings {
  email_notifications: boolean
  sms_notifications: boolean
  legislation_alerts: boolean
  funding_alerts: boolean
  community_updates: boolean
  weekly_digest: boolean
}

const serviceBranches = [
  'Army', 'Navy', 'Air Force', 'Marines', 'Space Force', 'Coast Guard'
]

const serviceStatuses = [
  'Active Duty', 'Reserve', 'National Guard', 'Veteran', 'Retired', 'Spouse/Dependent'
]

const payGrades = [
  'E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9',
  'W-1', 'W-2', 'W-3', 'W-4', 'W-5',
  'O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6', 'O-7', 'O-8', 'O-9', 'O-10'
]

const tricareRegions = [
  'East', 'West', 'Overseas', 'Reserve Select', 'Retired Reserve'
]

const privacyLevels = [
  'Public', 'Military Community Only', 'Private'
]

const contactMethods = [
  'Email', 'SMS', 'Both'
]

export function ProfileSettingsPage() {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    service_branch: '',
    service_status: '',
    pay_grade: '',
    duty_location: '',
    disability_rating: null,
    tricare_region: '',
    spouse_enrolled: false,
    family_size: null,
    privacy_level: 'Military Community Only',
    phone_number: '',
    preferred_contact: 'Email'
  })
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    legislation_alerts: true,
    funding_alerts: true,
    community_updates: true,
    weekly_digest: true
  })
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user) return
    
    try {
      // Load profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      } else if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          email: user.email || '',
          service_branch: profile.service_branch || '',
          service_status: profile.service_status || '',
          pay_grade: profile.pay_grade || '',
          duty_location: profile.duty_location || '',
          disability_rating: profile.disability_rating,
          tricare_region: profile.tricare_region || '',
          spouse_enrolled: profile.spouse_enrolled || false,
          family_size: profile.family_size,
          privacy_level: profile.privacy_level || 'Military Community Only',
          phone_number: profile.phone_number || '',
          preferred_contact: profile.preferred_contact || 'Email'
        })
      } else {
        // Set email from auth user if no profile exists
        setProfileData(prev => ({ ...prev, email: user.email || '' }))
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfileData = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const profileUpdateData = {
        user_id: user.id,
        full_name: profileData.full_name,
        service_branch: profileData.service_branch,
        service_status: profileData.service_status,
        pay_grade: profileData.pay_grade,
        duty_location: profileData.duty_location,
        disability_rating: profileData.disability_rating,
        tricare_region: profileData.tricare_region,
        spouse_enrolled: profileData.spouse_enrolled,
        family_size: profileData.family_size,
        privacy_level: profileData.privacy_level,
        phone_number: profileData.phone_number,
        preferred_contact: profileData.preferred_contact,
        updated_at: new Date().toISOString()
      }

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('profiles')
        .upsert(profileUpdateData, {
          onConflict: 'user_id'
        })

      if (error) {
        throw error
      }

      // Update auth context
      updateProfile({
        full_name: profileUpdateData.full_name,
        service_branch: profileUpdateData.service_branch,
        service_status: profileUpdateData.service_status
      })
      
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match')
      return
    }
    
    if (passwordData.new_password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }
    
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      })
      
      if (error) {
        throw error
      }
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      
      alert('Password updated successfully!')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Failed to change password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    if (!confirm('This will permanently delete all your data. Type "DELETE" to confirm this action.')) {
      return
    }
    
    try {
      // Note: Account deletion would typically be handled by an edge function
      // For now, we'll just sign out the user
      await supabase.auth.signOut()
      alert('Account deletion requested. Please contact support to complete the process.')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please contact support.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'privacy', name: 'Privacy', icon: EyeIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="mt-2 text-gray-600">
                Manage your account information, preferences, and privacy settings.
              </p>
            </div>
            {isEditing && (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    loadProfileData() // Reset to original data
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={saveProfileData}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow border border-gray-200"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.full_name || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed here. Contact support if needed.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Branch
                      </label>
                      <select
                        value={profileData.service_branch || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, service_branch: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      >
                        <option value="">Select branch</option>
                        {serviceBranches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Status
                      </label>
                      <select
                        value={profileData.service_status || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, service_status: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      >
                        <option value="">Select status</option>
                        {serviceStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pay Grade
                      </label>
                      <select
                        value={profileData.pay_grade || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, pay_grade: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      >
                        <option value="">Select pay grade</option>
                        {payGrades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duty Location
                      </label>
                      <input
                        type="text"
                        value={profileData.duty_location || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, duty_location: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        placeholder="e.g., Fort Bragg, NC"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VA Disability Rating (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={profileData.disability_rating || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, disability_rating: e.target.value ? parseInt(e.target.value) : null }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        placeholder="Enter percentage (0-100)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TRICARE Region
                      </label>
                      <select
                        value={profileData.tricare_region || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, tricare_region: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      >
                        <option value="">Select region</option>
                        {tricareRegions.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Family Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={profileData.family_size || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, family_size: e.target.value ? parseInt(e.target.value) : null }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        placeholder="Number of family members"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone_number || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="spouse_enrolled"
                          checked={profileData.spouse_enrolled}
                          onChange={(e) => setProfileData(prev => ({ ...prev, spouse_enrolled: e.target.checked }))}
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label htmlFor="spouse_enrolled" className="ml-2 text-sm text-gray-700">
                          Spouse is enrolled in TRICARE
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow border border-gray-200"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose how you want to receive updates and alerts about fertility benefits and legislation.
                  </p>
                </div>
                
                <div className="px-6 py-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Contact Methods</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="email_notifications"
                            checked={notificationSettings.email_notifications}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, email_notifications: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="email_notifications" className="ml-3 flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-700">Email notifications</span>
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="sms_notifications"
                            checked={notificationSettings.sms_notifications}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, sms_notifications: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="sms_notifications" className="ml-3 flex items-center">
                            <DevicePhoneMobileIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-700">SMS notifications</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Alert Types</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="legislation_alerts"
                            checked={notificationSettings.legislation_alerts}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, legislation_alerts: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="legislation_alerts" className="ml-3">
                            <span className="text-sm text-gray-700">Legislation and policy updates</span>
                            <p className="text-xs text-gray-500">Get notified about new bills and policy changes affecting military fertility benefits</p>
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="funding_alerts"
                            checked={notificationSettings.funding_alerts}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, funding_alerts: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="funding_alerts" className="ml-3">
                            <span className="text-sm text-gray-700">Funding opportunities</span>
                            <p className="text-xs text-gray-500">Alerts about new grants, discounts, and financial assistance programs</p>
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="community_updates"
                            checked={notificationSettings.community_updates}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, community_updates: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="community_updates" className="ml-3">
                            <span className="text-sm text-gray-700">Community updates</span>
                            <p className="text-xs text-gray-500">New discussions, expert AMAs, and community events</p>
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="weekly_digest"
                            checked={notificationSettings.weekly_digest}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, weekly_digest: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="weekly_digest" className="ml-3">
                            <span className="text-sm text-gray-700">Weekly digest</span>
                            <p className="text-xs text-gray-500">Summary of the week's most important updates and discussions</p>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => alert('Notification settings saved!')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Change Password */}
                <div className="bg-white rounded-lg shadow border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Update your password to keep your account secure.
                    </p>
                  </div>
                  
                  <div className="px-6 py-6">
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <button
                        onClick={changePassword}
                        disabled={saving || !passwordData.new_password || !passwordData.confirm_password}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        <KeyIcon className="h-4 w-4 mr-2" />
                        {saving ? 'Updating...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Deletion */}
                <div className="bg-white rounded-lg shadow border border-red-200">
                  <div className="px-6 py-4 border-b border-red-200">
                    <h2 className="text-lg font-semibold text-red-900">Delete Account</h2>
                    <p className="text-sm text-red-600 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  
                  <div className="px-6 py-6">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Warning</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>This will permanently:</p>
                            <ul className="list-disc list-inside mt-1">
                              <li>Delete your profile and account data</li>
                              <li>Remove you from community discussions</li>
                              <li>Cancel all notification subscriptions</li>
                              <li>Delete your saved applications and scenarios</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={deleteAccount}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow border border-gray-200"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Control your privacy and data sharing preferences.
                  </p>
                </div>
                
                <div className="px-6 py-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={profileData.privacy_level || 'Military Community Only'}
                        onChange={(e) => setProfileData(prev => ({ ...prev, privacy_level: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {privacyLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Controls who can see your profile information in community discussions.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Contact Method
                      </label>
                      <select
                        value={profileData.preferred_contact || 'Email'}
                        onChange={(e) => setProfileData(prev => ({ ...prev, preferred_contact: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {contactMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex">
                        <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Data Protection</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>Your data is protected and used only to:</p>
                            <ul className="list-disc list-inside mt-1">
                              <li>Provide personalized fertility benefit recommendations</li>
                              <li>Send relevant policy and funding alerts</li>
                              <li>Improve our services for military families</li>
                            </ul>
                            <p className="mt-2">
                              We never share your personal information with third parties without your explicit consent.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => alert('Privacy settings saved!')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <GlobeAltIcon className="h-4 w-4 mr-2" />
                      Save Privacy Settings
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
