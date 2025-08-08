import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  StarIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { supabase } from '@/lib/supabase'

interface Partner {
  id: string
  name: string
  organization_type: string | null
  description: string | null
  website_url: string | null
  logo_url: string | null
  contact_email: string | null
  services_offered: string[] | null
  integration_status: string
  api_endpoint: string | null
  is_featured: boolean
  created_at: string
}

const organizationTypes = [
  'All Types',
  'Professional Organization',
  'Non-profit Organization',
  'Advocacy Organization',
  'Support Organization',
  'Veterans Foundation',
  'Medical Organization'
]

export function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('All Types')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [partners, selectedType, searchQuery])

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('name')

      if (error) {
        console.error('Error fetching partners:', error)
      } else {
        setPartners(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
    let filtered = partners

    // Filter by organization type
    if (selectedType !== 'All Types') {
      filtered = filtered.filter(partner => partner.organization_type === selectedType)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        partner =>
          partner.name.toLowerCase().includes(query) ||
          (partner.description && partner.description.toLowerCase().includes(query)) ||
          (partner.services_offered && partner.services_offered.some(service => 
            service.toLowerCase().includes(query)
          ))
      )
    }

    setFilteredPartners(filtered)
  }

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'display_only':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIntegrationStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active Integration'
      case 'pending':
        return 'Integration Pending'
      case 'display_only':
      default:
        return 'Information Only'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading partner organizations...</p>
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
              Partner Organizations
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Connect with leading organizations that support military families on their fertility journey. 
              From professional medical societies to advocacy groups and foundations.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search organizations, services, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {organizationTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="text-sm text-gray-600">
            Found {filteredPartners.length} organization{filteredPartners.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredPartners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={`${partner.name} logo`}
                      className="h-12 w-12 rounded-lg object-contain bg-gray-50 p-2"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {partner.name}
                    </h3>
                    {partner.organization_type && (
                      <p className="text-sm text-blue-600 font-medium">
                        {partner.organization_type}
                      </p>
                    )}
                  </div>
                </div>
                
                {partner.is_featured && (
                  <div className="flex items-center">
                    <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                    <span className="sr-only">Featured partner</span>
                  </div>
                )}
              </div>

              {partner.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {partner.description}
                </p>
              )}

              {partner.services_offered && partner.services_offered.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Services Offered:</h4>
                  <div className="flex flex-wrap gap-1">
                    {partner.services_offered.slice(0, 3).map((service, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {service}
                      </span>
                    ))}
                    {partner.services_offered.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{partner.services_offered.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getIntegrationStatusColor(partner.integration_status)
                }`}>
                  {getIntegrationStatusText(partner.integration_status)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      <GlobeAltIcon className="h-4 w-4 mr-1" />
                      Website
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                    </a>
                  )}
                  
                  {partner.contact_email && (
                    <a
                      href={`mailto:${partner.contact_email}`}
                      className="inline-flex items-center text-gray-600 hover:text-gray-500 text-sm font-medium"
                    >
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      Contact
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or selecting a different organization type.
            </p>
          </div>
        )}
      </div>

      {/* Featured partnerships section */}
      {filteredPartners.filter(p => p.is_featured).length > 0 && (
        <div className="bg-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Partnerships
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our key partners providing exceptional support to military families.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPartners.filter(p => p.is_featured).map((partner) => (
                <div key={partner.id} className="bg-white rounded-lg shadow p-6 text-center">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={`${partner.name} logo`}
                      className="h-16 w-16 mx-auto mb-4 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BuildingOfficeIcon className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {partner.name}
                  </h3>
                  {partner.description && (
                    <p className="text-gray-600 text-sm">
                      {partner.description.length > 120 
                        ? `${partner.description.substring(0, 120)}...` 
                        : partner.description
                      }
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Partnership opportunities */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Become a Partner
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Are you an organization that supports military families in their fertility journey? 
            Join our network of partners to help more families access the resources they need.
          </p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Learn About Partnership Opportunities
          </button>
        </div>
      </div>
    </div>
  )
}