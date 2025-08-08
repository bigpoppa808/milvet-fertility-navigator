import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UsersIcon,
  HeartIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Knowledge Base',
    description: 'Comprehensive, searchable database of fertility information with AI-powered natural language search.',
    icon: BookOpenIcon,
    href: '/knowledge',
    color: 'bg-blue-500',
  },
  {
    name: 'Funding Wizard',
    description: 'Interactive eligibility assessment and personalized recommendations for TRICARE/VA benefits and grants.',
    icon: CurrencyDollarIcon,
    href: '/funding',
    color: 'bg-green-500',
  },
  {
    name: 'Legislation Tracker',
    description: 'Real-time tracking of military fertility-related legislation with personalized alerts.',
    icon: ScaleIcon,
    href: '/legislation',
    color: 'bg-purple-500',
  },
  {
    name: 'Story Vault',
    description: 'Share your fertility journey and connect with others through video and written testimonies.',
    icon: HeartIcon,
    href: '/stories',
    color: 'bg-red-500',
  },
  {
    name: 'Policy Simulator',
    description: 'Interactive modeling tools for policy scenarios and impact analysis.',
    icon: ChartBarIcon,
    href: '/simulator',
    color: 'bg-indigo-500',
  },
  {
    name: 'Community Bridge',
    description: 'User forums with military-specific categories and peer matching based on service branch.',
    icon: UsersIcon,
    href: '/community',
    color: 'bg-yellow-500',
  },
]

const stats = [
  { name: 'Military families served', value: '10,000+' },
  { name: 'Funding sources tracked', value: '150+' },
  { name: 'Success stories shared', value: '2,500+' },
  { name: 'Partner organizations', value: '50+' },
]

export function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-blue-800 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-4xl py-24 sm:py-32">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Supporting military families since 2025.{' '}
              <Link to="/about" className="font-semibold text-blue-600">
                <span className="absolute inset-0" aria-hidden="true" />
                Learn more <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
          
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Your Complete{' '}
              <span className="text-blue-600">Fertility Resource Hub</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto"
            >
              Navigate fertility resources, funding opportunities, and community support designed specifically for 
              U.S. service members, veterans, and their families. From TRICARE benefits to cutting-edge treatments, 
              we're here to guide your family-building journey.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Link
                to="/auth/register"
                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
              >
                Get Started
              </Link>
              <Link
                to="/knowledge"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors duration-200"
              >
                Explore Resources <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-600 to-blue-800 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by Military Families Nationwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Join thousands of service members and veterans who have found support and resources through our platform.
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col bg-blue-600/5 p-8">
                  <dt className="text-sm font-semibold leading-6 text-gray-600">{stat.name}</dt>
                  <dd className="order-first text-3xl font-bold tracking-tight text-blue-600">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Comprehensive Fertility Navigation
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Access all the tools, information, and support you need to navigate your fertility journey as a military family.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex flex-col"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${feature.color}`}>
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-6">
                      <Link
                        to={feature.href}
                        className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500 transition-colors"
                      >
                        Learn more <span aria-hidden="true">→</span>
                      </Link>
                    </p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start your fertility journey?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of military families who have found hope, resources, and community through our platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/auth/register"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
              >
                Create Account
              </Link>
              <Link
                to="/funding"
                className="text-sm font-semibold leading-6 text-white hover:text-blue-100 transition-colors duration-200"
              >
                Explore Funding <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}