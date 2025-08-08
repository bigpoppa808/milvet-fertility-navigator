import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, TagIcon, DocumentTextIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'

interface KnowledgeItem {
  id: string
  title: string
  content: string
  summary: string | null
  category: string | null
  tags: string[] | null
  source_url: string | null
  source_organization: string | null
  created_at: string
}

const categories = [
  'All Categories',
  'TRICARE Benefits',
  'VA Benefits',
  'Clinical Information',
  'Statistics and Research',
  'Legislation',
  'Funding'
]

export function KnowledgeBasePage() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null)

  useEffect(() => {
    fetchKnowledgeItems()
  }, [])

  useEffect(() => {
    const performFilter = async () => {
      await filterItems()
    }
    performFilter()
  }, [knowledgeItems, searchQuery, selectedCategory])

  const fetchKnowledgeItems = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching knowledge items:', error)
      } else {
        setKnowledgeItems(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = async () => {
    let filtered = knowledgeItems

    // Filter by category first
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // If there's a search query, use AI search
    if (searchQuery.trim()) {
      setSearching(true)
      try {
        console.log('Performing AI search for:', searchQuery)
        
        const { data, error } = await supabase.functions.invoke('ai-search', {
          body: {
            query: searchQuery,
            limit: 20
          }
        })

        if (error) {
          console.error('AI search error:', error)
          // Fallback to text search
          performTextSearch(filtered)
        } else if (data?.data?.results) {
          console.log('AI search results:', data.data.results)
          // Use AI search results, but still apply category filter
          let aiResults = data.data.results
          if (selectedCategory !== 'All Categories') {
            aiResults = aiResults.filter(item => item.category === selectedCategory)
          }
          setFilteredItems(aiResults)
        } else {
          // No results from AI search, fallback to text search
          performTextSearch(filtered)
        }
      } catch (error) {
        console.error('AI search error:', error)
        // Fallback to text search
        performTextSearch(filtered)
      } finally {
        setSearching(false)
      }
    } else {
      // No search query, just apply category filter
      setFilteredItems(filtered)
    }
  }

  const performTextSearch = (filtered: KnowledgeItem[]) => {
    const query = searchQuery.toLowerCase()
    const textFiltered = filtered.filter(
      item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        (item.summary && item.summary.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
    )
    setFilteredItems(textFiltered)
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading knowledge base...</p>
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
              Fertility Knowledge Base
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive, searchable database of fertility information specifically for military families. 
              Find answers to your questions about TRICARE benefits, VA coverage, treatments, and more.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="relative">
              {searching ? (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              )}
              <input
                type="text"
                placeholder="AI-powered search: fertility information, benefits, procedures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={searching}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Knowledge items list */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Found {filteredItems.length} article{filteredItems.length !== 1 ? 's' : ''}
                {searchQuery.trim() && !searching && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    🤖 AI Search
                  </span>
                )}
              </div>
              {searching && (
                <div className="text-sm text-blue-600 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Searching with AI...
                </div>
              )}
            </div>

            <div className="space-y-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {highlightText(item.title, searchQuery)}
                      </h3>
                      
                      {item.summary && (
                        <p className="text-gray-600 mb-3">
                          {highlightText(item.summary, searchQuery)}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {item.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                        )}
                        
                        {item.source_organization && (
                          <span className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            {item.source_organization}
                          </span>
                        )}
                        
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>

                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {item.tags.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600"
                            >
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 5 && (
                            <span className="text-xs text-gray-500">+{item.tags.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      <button className="text-blue-600 hover:text-blue-500">
                        <DocumentTextIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or selecting a different category.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar with featured topics */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Topics</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">TRICARE Fertility Coverage</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Understanding what fertility treatments are covered under TRICARE.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">VA Benefits for Veterans</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Comprehensive fertility benefits for service-connected conditions.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">Latest Legislation</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Recent updates to military fertility legislation and policies.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Check Eligibility</div>
                  <div className="text-sm text-gray-600">Find what benefits you qualify for</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Find Funding</div>
                  <div className="text-sm text-gray-600">Explore grants and assistance programs</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Connect with Community</div>
                  <div className="text-sm text-gray-600">Join discussions and support groups</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article detail modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                {selectedItem.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedItem.category}
                  </span>
                )}
                {selectedItem.source_organization && (
                  <span>{selectedItem.source_organization}</span>
                )}
                <span>{new Date(selectedItem.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="prose max-w-none">
                {selectedItem.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {selectedItem.source_url && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <a
                    href={selectedItem.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-500"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                    View original source
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}