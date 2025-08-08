import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash

        if (hashFragment && hashFragment.length > 0) {
          // Exchange the auth code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment)

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            navigate('/auth/login?error=' + encodeURIComponent(error.message))
            return
          }

          if (data.session) {
            // Successfully signed in, create or update profile
            const { user } = data.session
            
            // Check if profile exists
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .maybeSingle()

            // Create profile if it doesn't exist
            if (!profile) {
              await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  full_name: user.user_metadata?.full_name || '',
                  service_branch: user.user_metadata?.service_branch || '',
                  service_status: user.user_metadata?.service_status || ''
                })
            }

            // Redirect to dashboard
            navigate('/dashboard')
            return
          }
        }

        // If we get here, something went wrong
        navigate('/auth/login?error=No session found')
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth/login?error=Authentication failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}