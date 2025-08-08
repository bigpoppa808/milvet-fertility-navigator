import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UsersIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CommunityPost {
  id: string
  user_id: string | null
  title: string | null
  content: string | null
  category: string | null
  tags: string[] | null
  likes_count: number
  replies_count: number
  is_pinned: boolean
  is_moderated: boolean
  created_at: string
  updated_at: string
}

const categories = [
  'All Categories',
  'General Support',
  'TRICARE Questions',
  'VA Benefits',
  'Treatment Experiences',
  'Success Stories',
  'Funding Help',
  'Military Life Balance',
  'Partner Support'
]

const sortOptions = [
  'Recent',
  'Popular',
  'Most Liked',
  'Most Replies'
]

export function CommunityBridgePage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [sortBy, setSortBy] = useState('Recent')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterAndSortPosts()
  }, [posts, searchQuery, selectedCategory, sortBy])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('is_moderated', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortPosts = () => {
    let filtered = posts

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        post =>
          (post.title && post.title.toLowerCase().includes(query)) ||
          (post.content && post.content.toLowerCase().includes(query)) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }

    // Sort posts
    switch (sortBy) {
      case 'Popular':
        filtered.sort((a, b) => (b.likes_count + b.replies_count) - (a.likes_count + a.replies_count))
        break
      case 'Most Liked':
        filtered.sort((a, b) => b.likes_count - a.likes_count)
        break
      case 'Most Replies':
        filtered.sort((a, b) => b.replies_count - a.replies_count)
        break
      case 'Recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    // Put pinned posts first
    const pinnedPosts = filtered.filter(post => post.is_pinned)
    const regularPosts = filtered.filter(post => !post.is_pinned)
    
    setFilteredPosts([...pinnedPosts, ...regularPosts])
  }

  const toggleLike = async (postId: string) => {
    if (!user) return
    
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
    
    // Update like count in posts
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes_count: likedPosts.has(postId) 
            ? post.likes_count - 1 
            : post.likes_count + 1
        }
      }
      return post
    }))
  }

  const formatDate = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'TRICARE Questions':
        return 'bg-blue-100 text-blue-800'
      case 'VA Benefits':
        return 'bg-green-100 text-green-800'
      case 'Success Stories':
        return 'bg-purple-100 text-purple-800'
      case 'Treatment Experiences':
        return 'bg-yellow-100 text-yellow-800'
      case 'Funding Help':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community...</p>
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
              Military Fertility Community
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Connect with other military families on their fertility journey. Share experiences, 
              ask questions, and find support from those who understand your unique challenges.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions, topics, or questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {user && (
                  <button
                    onClick={() => setShowNewPostModal(true)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Post
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Posts list */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-4">
                {filteredPosts.length} discussion{filteredPosts.length !== 1 ? 's' : ''}
              </div>

              <div className="space-y-4">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`bg-white rounded-lg shadow border p-6 hover:shadow-md transition-shadow cursor-pointer ${
                      post.is_pinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {post.is_pinned && (
                                <div className="flex items-center text-yellow-600">
                                  <StarSolidIcon className="h-4 w-4 mr-1" />
                                  <span className="text-xs font-medium">Pinned</span>
                                </div>
                              )}
                              {post.category && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                                  {post.category}
                                </span>
                              )}
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {post.title || 'Untitled Discussion'}
                            </h3>
                            
                            {post.content && (
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {post.content.length > 200 
                                  ? `${post.content.substring(0, 200)}...` 
                                  : post.content
                                }
                              </p>
                            )}

                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {formatDate(post.created_at)}
                                </span>
                                <span className="flex items-center">
                                  <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                                  {post.replies_count} replies
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleLike(post.id)
                                  }}
                                  className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors hover:bg-gray-100"
                                >
                                  {likedPosts.has(post.id) ? (
                                    <HeartSolidIcon className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <HeartIcon className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className={likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500'}>
                                    {post.likes_count}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to start a conversation in this category!
                  </p>
                  {user && (
                    <button
                      onClick={() => setShowNewPostModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Start a Discussion
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            {/* Community Guidelines */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Guidelines</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Be respectful and supportive of all community members</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Share experiences to help others in their journey</p>
                </div>
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p>Avoid sharing personal medical advice</p>
                </div>
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p>Respect privacy and avoid sharing identifying information</p>
                </div>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Topics</h3>
              <div className="space-y-2">
                {categories.slice(1, 6).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedCategory === category
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Expert AMAs */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Expert AMAs</h3>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 text-sm">Dr. Sarah Johnson</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Reproductive Endocrinologist - February 15th, 2pm EST
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm">TRICARE Benefits Specialist</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Understanding Your Coverage - February 22nd, 1pm EST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPost.title || 'Untitled Discussion'}
                  </h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  {selectedPost.category && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedPost.category)}`}>
                      {selectedPost.category}
                    </span>
                  )}
                  <span>{formatDate(selectedPost.created_at)}</span>
                  <span>{selectedPost.likes_count} likes</span>
                  <span>{selectedPost.replies_count} replies</span>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {selectedPost.content && (
                  <div className="prose max-w-none">
                    {selectedPost.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Replies</h4>
                  <div className="text-center py-8 text-gray-500">
                    <ChatBubbleLeftEllipsisIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>Reply functionality coming soon!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Start a Discussion</h2>
                  <button
                    onClick={() => setShowNewPostModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center py-12">
                  <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Discussion Creation Form</h3>
                  <p className="text-gray-600">
                    This feature will allow you to create new discussion topics and connect with the community.
                    Coming soon!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}