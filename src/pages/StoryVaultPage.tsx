import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  ChatBubbleLeftEllipsisIcon,
  ShareIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Story {
  id: string
  user_id: string | null
  title: string | null
  content: string | null
  video_url: string | null
  audio_transcript: string | null
  consent_level: string
  is_anonymous: boolean
  service_branch: string | null
  story_type: string | null
  emotional_tone: string | null
  created_at: string
  approved_at: string | null
  moderator_notes: string | null
}

const consentLevels = [
  'All Stories',
  'public',
  'hill_only',
  'private'
]

const serviceBranches = [
  'All Branches',
  'Army',
  'Navy',
  'Air Force',
  'Marines',
  'Coast Guard',
  'Space Force'
]

const storyTypes = [
  'All Types',
  'Success Story',
  'Journey in Progress',
  'Challenge Overcome',
  'Resource Recommendation',
  'Support Experience'
]

export function StoryVaultPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConsent, setSelectedConsent] = useState('All Stories')
  const [selectedBranch, setSelectedBranch] = useState('All Branches')
  const [selectedType, setSelectedType] = useState('All Types')
  const [showNewStoryModal, setShowNewStoryModal] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  // New story form state
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    story_type: 'Journey in Progress',
    consent_level: 'public',
    is_anonymous: false,
    service_branch: user?.user_metadata?.service_branch || ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchStories()
  }, [])

  useEffect(() => {
    filterStories()
  }, [stories, searchQuery, selectedConsent, selectedBranch, selectedType])

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .not('approved_at', 'is', null) // Only approved stories
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching stories:', error)
      } else {
        setStories(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStories = () => {
    let filtered = stories

    // Filter by consent level
    if (selectedConsent !== 'All Stories') {
      if (selectedConsent === 'public') {
        filtered = filtered.filter(story => story.consent_level === 'public')
      }
    }

    // Filter by service branch
    if (selectedBranch !== 'All Branches') {
      filtered = filtered.filter(story => story.service_branch === selectedBranch)
    }

    // Filter by story type
    if (selectedType !== 'All Types') {
      filtered = filtered.filter(story => story.story_type === selectedType)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        story =>
          (story.title && story.title.toLowerCase().includes(query)) ||
          (story.content && story.content.toLowerCase().includes(query)) ||
          (story.audio_transcript && story.audio_transcript.toLowerCase().includes(query))
      )
    }

    setFilteredStories(filtered)
  }

  const toggleLike = (storyId: string) => {
    setLikedStories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(storyId)) {
        newSet.delete(storyId)
      } else {
        newSet.add(storyId)
      }
      return newSet
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Create preview for videos
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file)
        setFilePreview(url)
      } else {
        setFilePreview(null)
      }
    }
  }

  const submitStory = async () => {
    if (!user || !newStory.title.trim() || !newStory.content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      if (selectedFile) {
        // Upload with file using edge function
        console.log('Uploading story with file:', selectedFile.name)
        
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('title', newStory.title.trim())
        formData.append('content', newStory.content.trim())
        formData.append('story_type', newStory.story_type)
        formData.append('consent_level', newStory.consent_level)
        formData.append('is_anonymous', newStory.is_anonymous.toString())
        formData.append('service_branch', newStory.service_branch || '')

        const { data, error } = await supabase.functions.invoke('story-upload', {
          body: formData
        })

        if (error) {
          throw error
        }

        console.log('Story with file uploaded successfully:', data)
      } else {
        // Submit text-only story
        const { error } = await supabase.from('stories').insert({
          user_id: user.id,
          title: newStory.title.trim(),
          content: newStory.content.trim(),
          story_type: newStory.story_type,
          consent_level: newStory.consent_level,
          is_anonymous: newStory.is_anonymous,
          service_branch: newStory.service_branch || null,
          emotional_tone: 'neutral'
        })

        if (error) {
          throw error
        }
      }

      // Reset form
      setNewStory({
        title: '',
        content: '',
        story_type: 'Journey in Progress',
        consent_level: 'public',
        is_anonymous: false,
        service_branch: user?.user_metadata?.service_branch || ''
      })
      setSelectedFile(null)
      setFilePreview(null)
      
      setShowNewStoryModal(false)
      alert('Your story has been submitted for review. Thank you for sharing!')
      
      // Refresh stories
      fetchStories()
    } catch (error) {
      console.error('Error submitting story:', error)
      alert('Failed to submit story. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getEmotionalToneColor = (tone: string | null) => {
    switch (tone?.toLowerCase()) {
      case 'hopeful':
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'challenging':
      case 'difficult':
        return 'bg-red-100 text-red-800'
      case 'neutral':
        return 'bg-gray-100 text-gray-800'
      case 'inspiring':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const formatDate = (dateString: string) => {
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
          <p className="mt-4 text-gray-600">Loading stories...</p>
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
              Military Fertility Story Vault
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Share your fertility journey and connect with other military families. 
              Read inspiring stories, challenges overcome, and resources that made a difference.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stories by keywords, experiences, or resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  {serviceBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  {storyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {user && (
                  <button
                    onClick={() => setShowNewStoryModal(true)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Share Story
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Stories list */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-4">
                Found {filteredStories.length} stor{filteredStories.length !== 1 ? 'ies' : 'y'}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {filteredStories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedStory(story)}
                  >
                    {story.video_url && (
                      <div className="relative h-48 bg-gray-200">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <PlayIcon className="h-8 w-8 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-600 text-white">
                            Video Story
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {story.title || 'Untitled Story'}
                          </h3>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                            {story.service_branch && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {story.service_branch}
                              </span>
                            )}
                            {story.story_type && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {story.story_type}
                              </span>
                            )}
                            {story.emotional_tone && (
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEmotionalToneColor(story.emotional_tone)}`}>
                                {story.emotional_tone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {story.content && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {story.content.length > 150 
                            ? `${story.content.substring(0, 150)}...` 
                            : story.content
                          }
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(story.created_at)}</span>
                          {story.is_anonymous && (
                            <span className="text-yellow-600">Anonymous</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLike(story.id)
                            }}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            {likedStories.has(story.id) ? (
                              <HeartSolidIcon className="h-5 w-5 text-red-500" />
                            ) : (
                              <HeartIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <ShareIcon className="h-5 w-5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredStories.length === 0 && (
                <div className="text-center py-12">
                  <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search terms or filters.
                  </p>
                  {user && (
                    <button
                      onClick={() => setShowNewStoryModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Share Your Story
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            {/* Story Categories */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Categories</h3>
              <div className="space-y-2">
                {storyTypes.slice(1).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sharing Guidelines</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Share your authentic experience to help other military families</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Choose your privacy level: public, Hill-only, or private</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>All stories are reviewed before publication</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>You can remain anonymous if preferred</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Detail Modal */}
      <AnimatePresence>
        {selectedStory && (
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
                    {selectedStory.title || 'Untitled Story'}
                  </h2>
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  {selectedStory.service_branch && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedStory.service_branch}
                    </span>
                  )}
                  {selectedStory.story_type && (
                    <span>{selectedStory.story_type}</span>
                  )}
                  <span>{formatDate(selectedStory.created_at)}</span>
                  {selectedStory.is_anonymous && (
                    <span className="text-yellow-600">Anonymous</span>
                  )}
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {selectedStory.video_url && (
                  <div className="mb-6">
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Video Story</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedStory.content && (
                  <div className="prose max-w-none">
                    {selectedStory.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Story Modal */}
      <AnimatePresence>
        {showNewStoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Share Your Story</h2>
                  <button
                    onClick={() => setShowNewStoryModal(false)}
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
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Story Title *
                    </label>
                    <input
                      type="text"
                      value={newStory.title}
                      onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Give your story a meaningful title"
                      maxLength={100}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Story Type
                      </label>
                      <select
                        value={newStory.story_type}
                        onChange={(e) => setNewStory(prev => ({ ...prev, story_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {storyTypes.slice(1).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Branch
                      </label>
                      <select
                        value={newStory.service_branch}
                        onChange={(e) => setNewStory(prev => ({ ...prev, service_branch: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Prefer not to say</option>
                        {serviceBranches.slice(1).map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Story *
                    </label>
                    <textarea
                      value={newStory.content}
                      onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Share your fertility journey, challenges, successes, resources that helped, or advice for other military families..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Share as much or as little as you're comfortable with. Your story helps others.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Video or Audio (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="video/*,audio/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="space-y-2">
                          {selectedFile ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              {filePreview && selectedFile.type.startsWith('video/') && (
                                <video
                                  src={filePreview}
                                  controls
                                  className="mt-4 max-w-full h-32 mx-auto rounded"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFile(null)
                                  setFilePreview(null)
                                }}
                                className="mt-2 text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove file
                              </button>
                            </div>
                          ) : (
                            <div>
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600">Click to upload</span> a video or audio file
                              </p>
                              <p className="text-xs text-gray-500">MP4, MOV, MP3, WAV up to 100MB</p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                    {selectedFile && (
                      <p className="text-xs text-blue-600 mt-2">
                        🤖 AI will automatically transcribe audio and analyze the emotional tone of your story
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Privacy & Sharing
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Who can see your story?
                        </label>
                        <select
                          value={newStory.consent_level}
                          onChange={(e) => setNewStory(prev => ({ ...prev, consent_level: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="public">Public - Anyone can read this story</option>
                          <option value="hill_only">Hill Only - For policy advocacy use only</option>
                          <option value="private">Private - Only visible to moderators</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={newStory.is_anonymous}
                          onChange={(e) => setNewStory(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                          Share anonymously (don't show my name)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Before you submit:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• All stories are reviewed before being published</li>
                      <li>• Personal information will be protected</li>
                      <li>• You can edit or remove your story later</li>
                      <li>• Your story may help other military families</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNewStoryModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitStory}
                    disabled={submitting || !newStory.title.trim() || !newStory.content.trim()}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Story'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}