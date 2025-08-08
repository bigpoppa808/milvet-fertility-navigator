import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CalculatorIcon,
  PlayIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

interface SimulationScenario {
  id: string
  name: string
  description: string | null
  scenario_type: string | null
  parameters: any | null
  created_by: string | null
  is_public: boolean
  usage_count: number
  created_at: string
}

interface SimulationParameters {
  policyType: string
  implementation: string
  coverage: number
  costSharing: number
  eligibility: string[]
  timeframe: number
  population: number
}

interface SimulationResults {
  accessIncrease: number
  costSavings: number
  beneficiariesServed: number
  waitTimeReduction: number
  economicImpact: number
  readinessImpact: number
  monteCarloData?: any // Detailed Monte Carlo simulation data
}

const policyTypes = [
  'IVF Coverage Expansion',
  'Fertility Preservation Program',
  'Grant Funding Increase',
  'Travel Allowance Program',
  'Comprehensive Coverage'
]

const implementationOptions = [
  'Immediate (6 months)',
  'Phased (1 year)',
  'Gradual (2 years)',
  'Long-term (3+ years)'
]

const eligibilityOptions = [
  'Active Duty Only',
  'Active Duty + Reserves',
  'All Service Members',
  'Service Members + Spouses',
  'All Military Families',
  'Veterans Included'
]

export function PolicySimulatorPage() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([])
  const [loading, setLoading] = useState(true)
  const [showSimulator, setShowSimulator] = useState(false)
  const [simulationParams, setSimulationParams] = useState<SimulationParameters>({
    policyType: 'IVF Coverage Expansion',
    implementation: 'Phased (1 year)',
    coverage: 80,
    costSharing: 20,
    eligibility: ['Active Duty + Reserves'],
    timeframe: 5,
    population: 100000
  })
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchScenarios()
  }, [])

  const fetchScenarios = async () => {
    try {
      const { data, error } = await supabase
        .from('simulation_scenarios')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching scenarios:', error)
      } else {
        setScenarios(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const runSimulation = async () => {
    setIsRunning(true)
    
    try {
      console.log('Running Monte Carlo simulation with parameters:', simulationParams)
      
      const { data, error } = await supabase.functions.invoke('monte-carlo-simulation', {
        body: {
          policyType: simulationParams.policyType,
          implementation: simulationParams.implementation,
          coverage: simulationParams.coverage,
          costSharing: simulationParams.costSharing,
          eligibility: simulationParams.eligibility,
          timeframe: simulationParams.timeframe,
          population: simulationParams.population,
          iterations: 5000 // Reduced for faster response
        }
      })

      if (error) {
        console.error('Monte Carlo simulation error:', error)
        throw new Error('Simulation failed')
      }

      if (!data?.data) {
        throw new Error('No simulation results received')
      }

      const simulationData = data.data
      console.log('Received Monte Carlo results:', simulationData)
      
      // Transform the detailed Monte Carlo results into the expected format
      const results: SimulationResults = {
        accessIncrease: Math.round(simulationData.summary.accessIncrease.mean),
        costSavings: Math.round(simulationData.summary.totalCost.mean),
        beneficiariesServed: Math.round(simulationData.summary.beneficiariesServed.mean),
        waitTimeReduction: Math.round(simulationData.summary.waitTimeReduction.mean),
        economicImpact: Math.round(simulationData.summary.totalCost.mean * 1.5), // Economic impact factor
        readinessImpact: Math.round(simulationData.summary.readinessImpact.mean),
        // Store detailed Monte Carlo data for charts
        monteCarloData: simulationData
      }
      
      setSimulationResults(results)
      
      // Save scenario if user is logged in
      if (user) {
        await saveScenario(results)
      }
    } catch (error) {
      console.error('Simulation error:', error)
      alert('Simulation failed. Please try again with different parameters.')
    } finally {
      setIsRunning(false)
    }
  }

  const saveScenario = async (results: SimulationResults) => {
    if (!user) return
    
    try {
      await supabase.from('simulation_scenarios').insert({
        name: `${simulationParams.policyType} Simulation`,
        description: `Simulated ${simulationParams.policyType} with ${simulationParams.coverage}% coverage`,
        scenario_type: 'policy_impact',
        parameters: simulationParams,
        created_by: user.id,
        is_public: false
      })
    } catch (error) {
      console.error('Error saving scenario:', error)
    }
  }

  const chartData = simulationResults ? {
    labels: simulationResults.monteCarloData?.timeSeriesData ? 
      ['Current State', ...simulationResults.monteCarloData.timeSeriesData.map((d: any) => `Year ${d.year}`)] :
      ['Current State', 'Year 1', 'Year 2', 'Year 3', 'Year 5'],
    datasets: [
      {
        label: 'Access to Care (%)',
        data: simulationResults.monteCarloData?.timeSeriesData ? 
          [35, ...simulationResults.monteCarloData.timeSeriesData.map((d: any) => d.meanAccess)] :
          [35, 45, 55, 65, 35 + simulationResults.accessIncrease],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Cumulative Cost ($M)',
        data: simulationResults.monteCarloData?.timeSeriesData ? 
          [0, ...simulationResults.monteCarloData.timeSeriesData.map((d: any) => d.meanCost / 1000000)] :
          [0, 2, 5, 8, simulationResults.costSavings / 1000000],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  } : null

  const barData = simulationResults ? {
    labels: ['Access Increase', 'Beneficiaries Served', 'Wait Time Reduction', 'Readiness Impact'],
    datasets: [
      {
        label: 'Impact Metrics',
        data: [
          simulationResults.accessIncrease,
          simulationResults.beneficiariesServed / 1000,
          simulationResults.waitTimeReduction,
          simulationResults.readinessImpact
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }
    ]
  } : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading policy simulator...</p>
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
              Military Fertility Policy Impact Simulator
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Model the impact of different fertility policy scenarios on military families. 
              Use Monte Carlo simulations to understand potential outcomes and make data-driven advocacy.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowSimulator(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Start New Simulation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showSimulator ? (
          <div>
            {/* Popular Scenarios */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Simulation Scenarios</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {scenarios.slice(0, 6).map((scenario, index) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setShowSimulator(true)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {scenario.name}
                      </h3>
                      <ChartBarIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    
                    {scenario.description && (
                      <p className="text-gray-600 mb-4">
                        {scenario.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        {scenario.usage_count} runs
                      </span>
                      <span>{new Date(scenario.created_at).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Policy Simulator</h2>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalculatorIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Parameters</h3>
                  <p className="text-gray-600">
                    Set policy type, coverage levels, eligibility criteria, and implementation timeline.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Run Simulation</h3>
                  <p className="text-gray-600">
                    Execute Monte Carlo modeling to generate impact predictions and outcome scenarios.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyze Results</h3>
                  <p className="text-gray-600">
                    Review detailed analytics, charts, and export data for advocacy and policy proposals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Simulation Parameters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Simulation Parameters</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Type
                    </label>
                    <select
                      value={simulationParams.policyType}
                      onChange={(e) => setSimulationParams(prev => ({ ...prev, policyType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {policyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Implementation Timeline
                    </label>
                    <select
                      value={simulationParams.implementation}
                      onChange={(e) => setSimulationParams(prev => ({ ...prev, implementation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {implementationOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coverage Level: {simulationParams.coverage}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={simulationParams.coverage}
                      onChange={(e) => setSimulationParams(prev => ({ ...prev, coverage: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Sharing: {simulationParams.costSharing}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={simulationParams.costSharing}
                      onChange={(e) => setSimulationParams(prev => ({ ...prev, costSharing: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Population
                    </label>
                    <input
                      type="number"
                      value={simulationParams.population}
                      onChange={(e) => setSimulationParams(prev => ({ ...prev, population: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Analysis Timeframe: {simulationParams.timeframe} years
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={simulationParams.timeframe}
                      onChange={(e) => setSimulationParams(prev => ({ ...prev, timeframe: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={runSimulation}
                    disabled={isRunning}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isRunning ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <PlayIcon className="h-4 w-4 mr-2" />
                    )}
                    {isRunning ? 'Running Simulation...' : 'Run Simulation'}
                  </button>
                  
                  <button
                    onClick={() => setShowSimulator(false)}
                    className="w-full px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Back to Scenarios
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              {simulationResults ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ArrowUpIcon className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Access Increase</p>
                          <p className="text-2xl font-bold text-gray-900">{simulationResults.accessIncrease}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                          <p className="text-2xl font-bold text-gray-900">${(simulationResults.costSavings / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UsersIcon className="h-8 w-8 text-purple-500" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Beneficiaries</p>
                          <p className="text-2xl font-bold text-gray-900">{(simulationResults.beneficiariesServed / 1000).toFixed(1)}K</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ClockIcon className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Wait Reduction</p>
                          <p className="text-2xl font-bold text-gray-900">{simulationResults.waitTimeReduction}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Impact</h3>
                      {chartData && <Line data={chartData} options={{ responsive: true }} />}
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Metrics</h3>
                      {barData && <Bar data={barData} options={{ responsive: true }} />}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Summary</h3>
                    <div className="prose max-w-none text-gray-700">
                      <p>
                        The simulation of <strong>{simulationParams.policyType}</strong> with <strong>{simulationParams.coverage}% coverage</strong> 
                        shows significant potential benefits for military families. Over a <strong>{simulationParams.timeframe}-year period</strong>, 
                        this policy could increase access to fertility care by <strong>{simulationResults.accessIncrease}%</strong> and serve 
                        approximately <strong>{simulationResults.beneficiariesServed.toLocaleString()}</strong> beneficiaries.
                      </p>
                      <p>
                        The policy is projected to generate <strong>${(simulationResults.costSavings / 1000000).toFixed(1)} million</strong> in 
                        cost savings and reduce wait times by <strong>{simulationResults.waitTimeReduction}%</strong>. Military readiness 
                        could improve by <strong>{simulationResults.readinessImpact}%</strong> due to reduced stress and improved family planning options.
                      </p>
                    </div>
                    
                    <div className="mt-6 flex space-x-3">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        <ShareIcon className="h-4 w-4 mr-2" />
                        Share Results
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <BookmarkIcon className="h-4 w-4 mr-2" />
                        Save Scenario
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                  <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Simulate</h3>
                  <p className="text-gray-600">
                    Configure your simulation parameters and click "Run Simulation" to see the projected impact.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}