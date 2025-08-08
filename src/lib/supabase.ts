import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ohnrftgsndcplewufrip.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obnJmdGdzbmRjcGxld3VmcmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTk3MTUsImV4cCI6MjA2ODAzNTcxNX0.7dSv6LiacIM8kuHaZp-ZSORLOxHpDVkK5VtmYxwPviE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          service_branch: string | null
          service_status: string | null
          pay_grade: string | null
          disability_rating: number | null
          state: string | null
          spouse_info: any | null
          fertility_stage: string | null
          preferred_language: string
          notification_preferences: any
        }
        Insert: {
          id: string
          full_name?: string | null
          service_branch?: string | null
          service_status?: string | null
          pay_grade?: string | null
          disability_rating?: number | null
          state?: string | null
          spouse_info?: any | null
          fertility_stage?: string | null
          preferred_language?: string
          notification_preferences?: any
        }
        Update: {
          full_name?: string | null
          service_branch?: string | null
          service_status?: string | null
          pay_grade?: string | null
          disability_rating?: number | null
          state?: string | null
          spouse_info?: any | null
          fertility_stage?: string | null
          preferred_language?: string
          notification_preferences?: any
        }
      }
      knowledge_base: {
        Row: {
          id: string
          title: string
          content: string
          summary: string | null
          category: string | null
          tags: string[] | null
          source_url: string | null
          source_organization: string | null
          last_updated: string
          created_at: string
        }
      }
      funding_sources: {
        Row: {
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
          created_at: string
          updated_at: string
        }
      }
      legislation: {
        Row: {
          id: string
          title: string
          bill_number: string | null
          description: string | null
          status: string | null
          introduced_date: string | null
          last_action_date: string | null
          sponsor: string | null
          summary: string | null
          full_text_url: string | null
          impact_on_military: string | null
          created_at: string
          updated_at: string
        }
      }
      partners: {
        Row: {
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
      }
      stories: {
        Row: {
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
      }
      community_posts: {
        Row: {
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
      }
      user_applications: {
        Row: {
          id: string
          user_id: string | null
          funding_source_id: string | null
          application_status: string
          application_data: any | null
          submitted_at: string | null
          decision_date: string | null
          outcome: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      simulation_scenarios: {
        Row: {
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
      }
      user_alerts: {
        Row: {
          id: string
          user_id: string | null
          alert_type: string | null
          title: string | null
          message: string | null
          related_id: string | null
          is_read: boolean
          delivery_method: string | null
          scheduled_for: string | null
          sent_at: string | null
          created_at: string
        }
      }
    }
  }
}