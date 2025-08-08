import React from 'react'
import { Link } from 'react-router-dom'

const footerLinks = {
  resources: {
    title: 'Resources',
    links: [
      { name: 'Knowledge Base', href: '/knowledge' },
      { name: 'Funding Sources', href: '/funding' },
      { name: 'Legislation Tracker', href: '/legislation' },
      { name: 'Partner Organizations', href: '/partners' },
    ],
  },
  community: {
    title: 'Community',
    links: [
      { name: 'Share Your Story', href: '/stories/new' },
      { name: 'Forums', href: '/community' },
      { name: 'Support Groups', href: '/community/support' },
      { name: 'Expert AMAs', href: '/community/ama' },
    ],
  },
  tools: {
    title: 'Tools',
    links: [
      { name: 'Benefit Wizard', href: '/funding/wizard' },
      { name: 'Policy Simulator', href: '/simulator' },
      { name: 'Application Tracker', href: '/applications' },
      { name: 'Alerts & Updates', href: '/alerts' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  },
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
        {/* Main footer content */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and description */}
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MFN</span>
              </div>
              <span className="text-xl font-bold">Milvet Fertility Navigator</span>
            </div>
            <p className="text-sm leading-6 text-gray-300">
              Empowering U.S. service members, veterans, and their families with comprehensive fertility resources, 
              funding opportunities, and community support for their family-building journey.
            </p>
            <div className="flex space-x-6">
              <p className="text-xs text-gray-400">
                A comprehensive digital hub serving military families nationwide.
              </p>
            </div>
          </div>

          {/* Link sections */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">{footerLinks.resources.title}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.resources.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">{footerLinks.community.title}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.community.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6">{footerLinks.tools.title}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.tools.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6">{footerLinks.support.title}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.support.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 border-t border-gray-800 pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24">
          <div className="flex space-x-6 md:order-2">
            <p className="text-xs text-gray-400">
              Serving military families with dignity, respect, and comprehensive support.
            </p>
          </div>
          <p className="mt-8 text-xs leading-5 text-gray-400 md:order-1 md:mt-0">
            &copy; 2025 Milvet Fertility Navigator. All rights reserved. 
            <span className="ml-2">Supporting our heroes' family-building journeys.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}