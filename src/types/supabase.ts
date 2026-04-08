export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Generated-like Database type for Supabase client.
 * Source of truth: supabase/schema.sql (current project schema).
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          nickname: string | null
          analysis_mode: 'student' | 'single_income' | 'multi_income'
          locale: string
          timezone: string
          tier: 'FREE' | 'PRO'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          nickname?: string | null
          analysis_mode?: 'student' | 'single_income' | 'multi_income'
          locale?: string
          timezone?: string
          tier?: 'FREE' | 'PRO'
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string | null
          display_name?: string | null
          nickname?: string | null
          analysis_mode?: 'student' | 'single_income' | 'multi_income'
          locale?: string
          timezone?: string
          tier?: 'FREE' | 'PRO'
          updated_at?: string
        }
      }
      user_credits: {
        Row: {
          user_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          user_id: string
          balance?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          updated_at?: string
        }
      }
      credit_ledger: {
        Row: {
          id: string
          user_id: string
          event_type:
            | 'signup_bonus'
            | 'charge'
            | 'local_ai'
            | 'cloud_ai'
            | 'ocr_premium'
            | 'refund'
            | 'invite_reward'
            | 'manual_adjust'
          amount: number
          balance_after: number
          description: string | null
          source_ref: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type:
            | 'signup_bonus'
            | 'charge'
            | 'local_ai'
            | 'cloud_ai'
            | 'ocr_premium'
            | 'refund'
            | 'invite_reward'
            | 'manual_adjust'
          amount: number
          balance_after: number
          description?: string | null
          source_ref?: string | null
          created_at?: string
        }
        Update: {
          event_type?:
            | 'signup_bonus'
            | 'charge'
            | 'local_ai'
            | 'cloud_ai'
            | 'ocr_premium'
            | 'refund'
            | 'invite_reward'
            | 'manual_adjust'
          amount?: number
          balance_after?: number
          description?: string | null
          source_ref?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          provider: string
          provider_payment_id: string | null
          amount_krw: number
          credited_amount: number
          status: 'pending' | 'paid' | 'failed' | 'cancelled'
          requested_at: string
          paid_at: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          provider?: string
          provider_payment_id?: string | null
          amount_krw: number
          credited_amount: number
          status?: 'pending' | 'paid' | 'failed' | 'cancelled'
          requested_at?: string
          paid_at?: string | null
          metadata?: Json
        }
        Update: {
          provider?: string
          provider_payment_id?: string | null
          amount_krw?: number
          credited_amount?: number
          status?: 'pending' | 'paid' | 'failed' | 'cancelled'
          paid_at?: string | null
          metadata?: Json
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          tx_date: string
          amount: number
          merchant: string
          category: string
          tx_type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
          ai_confidence: number
          status: 'PENDING' | 'CONFIRMED'
          is_internal: boolean
          linked_document_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tx_date: string
          amount: number
          merchant: string
          category?: string
          tx_type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
          ai_confidence?: number
          status?: 'PENDING' | 'CONFIRMED'
          is_internal?: boolean
          linked_document_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tx_date?: string
          amount?: number
          merchant?: string
          category?: string
          tx_type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
          ai_confidence?: number
          status?: 'PENDING' | 'CONFIRMED'
          is_internal?: boolean
          linked_document_id?: string | null
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          emoji: string
          target_amount: number
          current_amount: number
          deadline_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          emoji?: string
          target_amount: number
          current_amount?: number
          deadline_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          emoji?: string
          target_amount?: number
          current_amount?: number
          deadline_date?: string
          updated_at?: string
        }
      }
      recurring_bills: {
        Row: {
          id: string
          user_id: string
          title: string
          amount: number
          due_date: number
          reminder_rules: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          amount: number
          due_date: number
          reminder_rules?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          amount?: number
          due_date?: number
          reminder_rules?: string[]
          updated_at?: string
        }
      }
      vault_documents: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_type: string
          file_url: string
          upload_date: string
          parsed_data: Json | null
          review_status: 'NEEDS_REVIEW' | 'COMPLETED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_type: string
          file_url: string
          upload_date?: string
          parsed_data?: Json | null
          review_status?: 'NEEDS_REVIEW' | 'COMPLETED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          file_name?: string
          file_type?: string
          file_url?: string
          upload_date?: string
          parsed_data?: Json | null
          review_status?: 'NEEDS_REVIEW' | 'COMPLETED'
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      analysis_mode: 'student' | 'single_income' | 'multi_income'
      payment_status: 'pending' | 'paid' | 'failed' | 'cancelled'
      tx_type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
      tx_status: 'PENDING' | 'CONFIRMED'
      vault_review_status: 'NEEDS_REVIEW' | 'COMPLETED'
      user_tier: 'FREE' | 'PRO'
    }
    CompositeTypes: Record<string, never>
  }
}

