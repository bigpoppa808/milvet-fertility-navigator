import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ScaleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BellIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface LegislationItem {
  id: string
  title: string
  bill_number: string | null
  description: string | null
  status: string | null
  introduced_date: string | null
  last_action_date: string | null
  sponsor: string | null
  summary: string | null
  full_text_url: string | null
  impact_on_military: string | null
  created_at: string
  updated_at: string
}

interface UserAlert {
  id: string
  user_id: string
  alert_type: string
  title: string
  message: string | null
  related_id: string | null
  is_read: boolean
  created_at: string
}

const statusOptions = [
  'All Status',
  'Introduced',
  'Committee Review',
  'House Passed',
  'Senate Passed', 
  'Signed',
  'Enacted',
  'Failed'
]

const chamberOptions = [
  'All Chambers',
  'House',
  'Senate',
  'Both Chambers'
]

export function LegislationTrackerPage() {
  const [legislation, setLegislation] = useState<LegislationItem[]>([])
  const [filteredLegislation, setFilteredLegislation] = useState<LegislationItem[]>([])
  const [alerts, setAlerts] = useState<UserAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedChamber, setSelectedChamber] = useState('All Chambers')
  const [alertsEnabled, setAlertsEnabled] = useState<{ [key: string]: boolean }>({})
  const { user } = useAuth()

  useEffect(() => {
    fetchLegislation()
    if (user) {
      fetchUserAlerts()
    }
  }, [user])

  useEffect(() => {
    filterLegislation()
  }, [legislation, searchQuery, selectedStatus, selectedChamber])

  const fetchLegislation = async () => {
    try {
      const { data, error } = await supabase
        .from('legislation')
        .select('*')
        .order('last_action_date', { ascending: false })
        .order('introduced_date', { ascending: false })

      if (error) {
        console.error('Error fetching legislation:', error)
      } else {
        setLegislation(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAlerts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('alert_type', 'legislation')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching alerts:', error)
      } else {
        setAlerts(data || [])
        // Set up alerts enabled state
        const enabled: { [key: string]: boolean } = {}
        data?.forEach(alert => {
          if (alert.related_id) {
            enabled[alert.related_id] = true
          }
        })
        setAlertsEnabled(enabled)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filterLegislation = () => {
    let filtered = legislation

    // Filter by status
    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(item => item.status === selectedStatus)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          (item.bill_number && item.bill_number.toLowerCase().includes(query)) ||
          (item.description && item.description.toLowerCase().includes(query)) ||
          (item.sponsor && item.sponsor.toLowerCase().includes(query))
      )
    }

    setFilteredLegislation(filtered)
  }

  const toggleAlert = async (legislationId: string, billTitle: string) => {
    if (!user) return

    const isEnabled = alertsEnabled[legislationId]

    if (isEnabled) {
      // Remove alert
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('user_id', user.id)
        .eq('related_id', legislationId)
        .eq('alert_type', 'legislation')

      if (!error) {
        setAlertsEnabled(prev => ({ ...prev, [legislationId]: false }))
      }
    } else {
      // Add alert
      const { error } = await supabase
        .from('user_alerts')
        .insert({
          user_id: user.id,
          alert_type: 'legislation',
          title: `Updates for ${billTitle}`,
          message: `You will receive notifications when this legislation has updates.`,
          related_id: legislationId,
          is_read: true
        })

      if (!error) {
        setAlertsEnabled(prev => ({ ...prev, [legislationId]: true }))
      }
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'signed':
      case 'enacted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'introduced':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'signed':
      case 'enacted':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'introduced':
        return 'bg-blue-100 text-blue-800'
      case 'committee review':
        return 'bg-yellow-100 text-yellow-800'
      case 'house passed':
      case 'senate passed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading legislation tracker...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Military Fertility Legislation Tracker
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Stay updated on federal and state legislation affecting military fertility benefits. 
              Track bills, get personalized alerts, and understand the impact on your family.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search legislation by title, bill number, or sponsor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <FunnelIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Legislation list */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-4">
                Found {filteredLegislation.length} bill{filteredLegislation.length !== 1 ? 's' : ''}
              </div>

              <div className="space-y-6">
                {filteredLegislation.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          {getStatusIcon(item.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {item.title}
                              </h3>
                              {item.bill_number && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {item.bill_number}
                                </span>
                              )}
                            </div>
                            
                            {item.summary && (
                              <p className="text-gray-600 mb-3">
                                {item.summary}
                              </p>
                            )}

                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              {item.status && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                              )}
                              
                              {item.sponsor && (
                                <span>Sponsor: {item.sponsor}</span>
                              )}
                              
                              {item.introduced_date && (
                                <span>Introduced: {formatDate(item.introduced_date)}</span>
                              )}
                              
                              {item.last_action_date && (
                                <span>Last Action: {formatDate(item.last_action_date)}</span>
                              )}
                            </div>

                            {item.impact_on_military && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-900 mb-1">Impact on Military Families:</h4>
                                <p className="text-sm text-blue-700">{item.impact_on_military}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-3">
                            {item.full_text_url && (
                              <a
                                href={item.full_text_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
                              >
                                <DocumentTextIcon className="h-4 w-4 mr-1" />
                                Read Full Text
                                <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                          
                          {user && (
                            <button
                              onClick={() => toggleAlert(item.id, item.title)}
                              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                alertsEnabled[item.id]
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <BellIcon className="h-4 w-4 mr-2" />
                              {alertsEnabled[item.id] ? 'Alert On' : 'Get Alerts'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredLegislation.length === 0 && (
                  <div className="text-center py-12">
                    <ScaleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No legislation found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search terms or filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            {/* Recent Updates */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Recent Updates
              </h3>
              <div className="space-y-3">
                {filteredLegislation.slice(0, 3).map((item) => (
                  <div key={item.id} className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.status} • {formatDate(item.last_action_date || item.introduced_date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Legislation */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Military Fertility Bills</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">IVF for Military Families Act</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Would require TRICARE to cover IVF and fertility treatments.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Veterans Infertility Treatment Act</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Expands VA fertility benefits to all enrolled veterans.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">Executive Order 14216</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Directs federal agencies to expand IVF access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}