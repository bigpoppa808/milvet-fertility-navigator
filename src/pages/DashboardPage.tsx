import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  HeartIcon,
  ChartBarIcon,
  UsersIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  knowledgeArticles: number
  fundingSources: number
  activeLegislation: number
  communityPosts: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  timestamp: string
  status?: string
}

const quickActions = [
  {
    name: 'Search Knowledge Base',
    description: 'Find information about fertility benefits and treatments',
    icon: BookOpenIcon,
    href: '/knowledge',
    color: 'bg-blue-500'
  },
  {
    name: 'Find Funding',
    description: 'Discover grants and assistance programs',
    icon: CurrencyDollarIcon,
    href: '/funding',
    color: 'bg-green-500'
  },
  {
    name: 'Track Legislation',
    description: 'Stay updated on policy changes',
    icon: ScaleIcon,
    href: '/legislation',
    color: 'bg-purple-500'
  },
  {
    name: 'Share Your Story',
    description: 'Connect with the community',
    icon: HeartIcon,
    href: '/stories/new',
    color: 'bg-red-500'
  }
]

export const DashboardPage = React.memo(function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    knowledgeArticles: 0,
    fundingSources: 0,
    activeLegislation: 0,
    communityPosts: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }, [user])

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch stats from multiple tables
      const [knowledgeRes, fundingRes, legislationRes, communityRes] = await Promise.all([
        supabase.from('knowledge_base').select('id', { count: 'exact', head: true }),
        supabase.from('funding_sources').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('legislation').select('id', { count: 'exact', head: true }),
        supabase.from('community_posts').select('id', { count: 'exact', head: true })
      ])

      setStats({
        knowledgeArticles: knowledgeRes.count || 0,
        fundingSources: fundingRes.count || 0,
        activeLegislation: legislationRes.count || 0,
        communityPosts: communityRes.count || 0
      })

      // Fetch real recent activity from multiple sources
      const activities: RecentActivity[] = []

      // Get recent legislation updates
      const { data: recentLegislation } = await supabase
        .from('legislation')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false })
        .limit(2)

      if (recentLegislation) {
        recentLegislation.forEach(item => {
          activities.push({
            id: `leg-${item.id}`,
            type: 'legislation_alert',
            title: `Updated: ${item.title}`,
            timestamp: item.updated_at,
            status: 'new'
          })
        })
      }

      // Get recent knowledge base articles
      const { data: recentKnowledge } = await supabase
        .from('knowledge_base')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(2)

      if (recentKnowledge) {
        recentKnowledge.forEach(item => {
          activities.push({
            id: `kb-${item.id}`,
            type: 'knowledge_read',
            title: `New article: ${item.title}`,
            timestamp: item.created_at
          })
        })
      }

      // Get recent community posts
      const { data: recentPosts } = await supabase
        .from('community_posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(2)

      if (recentPosts) {
        recentPosts.forEach(item => {
          activities.push({
            id: `post-${item.id}`,
            type: 'community_post',
            title: `New discussion: ${item.title || 'Community post'}`,
            timestamp: item.created_at
          })
        })
      }

      // Get recent stories
      const { data: recentStories } = await supabase
        .from('stories')
        .select('id, title, created_at')
        .not('approved_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(2)

      if (recentStories) {
        recentStories.forEach(item => {
          activities.push({
            id: `story-${item.id}`,
            type: 'story_shared',
            title: `Story shared: ${item.title || 'Untitled story'}`,
            timestamp: item.created_at,
            status: 'new'
          })
        })
      }

      // Sort activities by timestamp and take the most recent 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'funding_application':
        return CurrencyDollarIcon
      case 'knowledge_read':
        return BookOpenIcon
      case 'legislation_alert':
        return ScaleIcon
      case 'community_post':
        return UsersIcon
      case 'story_shared':
        return HeartIcon
      default:
        return BellIcon
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600'
      case 'new':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">
              {greeting}, {profile?.full_name || user?.email?.split('@')[0] || 'Service Member'}!
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Welcome to your Milvet Fertility Navigator dashboard. Here's what's happening with your fertility journey.
            </p>
          </motion.div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Knowledge Articles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.knowledgeArticles}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Funding Sources</p>
                <p className="text-2xl font-bold text-gray-900">{stats.fundingSources}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ScaleIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Legislation</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeLegislation}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Community Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.communityPosts}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    to={action.href}
                    className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 ${action.color} rounded-lg p-3`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <Icon className={`h-5 w-5 ${getStatusColor(activity.status)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {activity.status && (
                            <div className="flex-shrink-0">
                              {activity.status === 'pending' && (
                                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                              )}
                              {activity.status === 'completed' && (
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              )}
                              {activity.status === 'new' && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BellIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No recent activity</p>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 px-6 py-3">
                <Link
                  to="/activity"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all activity
                </Link>
              </div>
            </div>

            {/* Profile completion */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Completion</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Basic Information</span>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Service Details</span>
                  {profile?.service_branch ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <Link to="/profile" className="text-blue-600 hover:text-blue-500 text-xs font-medium">
                      Complete
                    </Link>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fertility Stage</span>
                  {profile?.fertility_stage ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <Link to="/profile" className="text-blue-600 hover:text-blue-500 text-xs font-medium">
                      Add
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})