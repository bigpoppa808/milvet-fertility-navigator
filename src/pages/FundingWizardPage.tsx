import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CurrencyDollarIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'

interface FundingSource {
  id: string
  name: string
  organization: string | null
  description: string | null
  eligibility_criteria: string | null
  funding_amount_min: number | null
  funding_amount_max: number | null
  application_deadline: string | null
  application_url: string | null
  contact_email: string | null
  is_active: boolean
}

interface WizardData {
  serviceBranch: string
  serviceStatus: string
  disabilityRating: string
  marriageStatus: string
  state: string
  fertilityStage: string
  treatmentType: string
  householdIncome: string
}

const questions = [
  {
    id: 'serviceBranch',
    title: 'What is your service branch?',
    type: 'select',
    options: ['Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force'],
    required: true
  },
  {
    id: 'serviceStatus',
    title: 'What is your current service status?',
    type: 'select',
    options: ['Active Duty', 'Reserve', 'National Guard', 'Veteran', 'Spouse/Dependent'],
    required: true
  },
  {
    id: 'disabilityRating',
    title: 'Do you have a VA disability rating? (Veterans only)',
    type: 'select',
    options: ['No rating', '0%', '10-30%', '40-60%', '70-90%', '100%', 'Not applicable'],
    required: false
  },
  {
    id: 'marriageStatus',
    title: 'What is your current marriage status?',
    type: 'select',
    options: ['Married', 'Single', 'Divorced', 'Widowed', 'Domestic Partnership'],
    required: true
  },
  {
    id: 'state',
    title: 'What state do you currently reside in?',
    type: 'select',
    options: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming', 'Other/Overseas'
    ],
    required: true
  },
  {
    id: 'fertilityStage',
    title: 'Where are you in your fertility journey?',
    type: 'select',
    options: [
      'Just starting to try',
      'Trying for 6+ months',
      'Trying for 1+ years',
      'Diagnosed with infertility',
      'Currently in treatment',
      'Considering treatment options'
    ],
    required: true
  },
  {
    id: 'treatmentType',
    title: 'What type of fertility treatment are you considering?',
    type: 'select',
    options: [
      'Not sure yet',
      'Fertility testing/diagnosis',
      'Ovulation induction',
      'Intrauterine Insemination (IUI)',
      'In Vitro Fertilization (IVF)',
      'Fertility preservation',
      'Third-party reproduction (donor/surrogacy)'
    ],
    required: true
  },
  {
    id: 'householdIncome',
    title: 'What is your approximate household income?',
    type: 'select',
    options: [
      'Under $30,000',
      '$30,000 - $50,000',
      '$50,000 - $75,000',
      '$75,000 - $100,000',
      '$100,000 - $150,000',
      'Over $150,000',
      'Prefer not to say'
    ],
    required: false
  }
]

export function FundingWizardPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({} as WizardData)
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([])
  const [recommendations, setRecommendations] = useState<FundingSource[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetchFundingSources()
  }, [])

  const fetchFundingSources = async () => {
    try {
      const { data, error } = await supabase
        .from('funding_sources')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching funding sources:', error)
      } else {
        setFundingSources(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAnswer = (questionId: string, value: string) => {
    setWizardData(prev => ({ ...prev, [questionId]: value }))
  }

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      generateRecommendations()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateRecommendations = async () => {
    setLoading(true)
    
    // Simple recommendation logic based on user input
    let eligibleSources = [...fundingSources]
    
    // Filter based on service status
    if (wizardData.serviceStatus === 'Veteran' && wizardData.disabilityRating !== 'No rating') {
      // Veterans with disability rating get priority for VA and veteran-specific programs
      eligibleSources = eligibleSources.filter(source => 
        source.name.toLowerCase().includes('veteran') ||
        source.name.toLowerCase().includes('viva') ||
        source.organization?.toLowerCase().includes('veteran')
      )
    }
    
    // Add military-specific grants
    const militarySpecific = fundingSources.filter(source => 
      source.name.toLowerCase().includes('military') ||
      source.name.toLowerCase().includes('operation') ||
      source.eligibility_criteria?.toLowerCase().includes('military')
    )
    
    // Add general grants
    const generalGrants = fundingSources.filter(source => 
      !source.name.toLowerCase().includes('military') &&
      !source.name.toLowerCase().includes('veteran')
    )
    
    const combined = [...new Set([...eligibleSources, ...militarySpecific, ...generalGrants])]
    
    setRecommendations(combined.slice(0, 8)) // Limit to top 8 recommendations
    setShowResults(true)
    setLoading(false)
  }

  const resetWizard = () => {
    setCurrentStep(0)
    setWizardData({} as WizardData)
    setShowResults(false)
    setRecommendations([])
  }

  const progress = ((currentStep + 1) / questions.length) * 100

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Your Personalized Funding Recommendations
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Based on your service status and fertility journey, here are the funding sources and benefits you may be eligible for.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Found {recommendations.length} potential funding sources
            </h2>
            <button
              onClick={resetWizard}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Over
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {recommendations.map((source, index) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {source.name}
                    </h3>
                    
                    {source.organization && (
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        {source.organization}
                      </p>
                    )}
                    
                    {source.description && (
                      <p className="text-gray-600 mb-4">
                        {source.description}
                      </p>
                    )}

                    {(source.funding_amount_min || source.funding_amount_max) && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          {source.funding_amount_min && source.funding_amount_max
                            ? `$${source.funding_amount_min.toLocaleString()} - $${source.funding_amount_max.toLocaleString()}`
                            : source.funding_amount_max
                            ? `Up to $${source.funding_amount_max.toLocaleString()}`
                            : 'Amount varies'
                          }
                        </span>
                      </div>
                    )}

                    {source.eligibility_criteria && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Eligibility:</h4>
                        <p className="text-sm text-gray-600">{source.eligibility_criteria}</p>
                      </div>
                    )}

                    {source.application_deadline && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          Deadline: {new Date(source.application_deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      {source.application_url && (
                        <a
                          href={source.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Apply Now
                          <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
                        </a>
                      )}
                      
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Save for Later
                        <DocumentTextIcon className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {recommendations.length === 0 && (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No specific matches found</h3>
              <p className="text-gray-600 mb-6">
                Don't worry! There may still be funding options available. Consider consulting with a fertility counselor 
                or contacting organizations directly.
              </p>
              <button
                onClick={resetWizard}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your recommendations...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentStep]
  const currentAnswer = wizardData[currentQuestion.id as keyof WizardData]
  const canProceed = !currentQuestion.required || currentAnswer

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Fertility Funding Wizard
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Answer a few questions to get personalized recommendations for funding sources and benefits.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow border border-gray-200 p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.title}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    currentAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{option}</span>
                    {currentAnswer === option && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </button>

              <button
                onClick={nextStep}
                disabled={!canProceed}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === questions.length - 1 ? 'Get Recommendations' : 'Next'}
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}