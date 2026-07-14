import type { Json } from "../../types"
import type { Database as DatabaseOriginal } from "@/lib/supabase/database.types"

export type Database = DatabaseOriginal & {
  public: {
    Tables: {
      ai_agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_tokens: number | null
          model_id: string
          name: string
          parameters: Json
          system_prompt: string | null
          tools: Json[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_id: string
          name: string
          parameters?: Json
          system_prompt?: string | null
          tools?: Json[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_id?: string
          name?: string
          parameters?: Json
          system_prompt?: string | null
          tools?: Json[]
          updated_at?: string
          user_id?: string
        }
      }
      ai_analysis_results: {
        Row: {
          agent_id: string | null
          analysis_type: string
          created_at: string
          id: string
          metadata: Json
          results: Json
          source_id: string
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          analysis_type: string
          created_at?: string
          id?: string
          metadata?: Json
          results: Json
          source_id: string
          source_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          analysis_type?: string
          created_at?: string
          id?: string
          metadata?: Json
          results?: Json
          source_id?: string
          source_type?: string
          updated_at?: string
          user_id?: string
        }
      }
      ai_models: {
        Row: {
          capabilities: string[]
          cost_per_1k_tokens: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          model_id: string
          name: string
          parameters: Json
          provider: string
          updated_at: string
        }
        Insert: {
          capabilities: string[]
          cost_per_1k_tokens?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          model_id: string
          name: string
          parameters?: Json
          provider: string
          updated_at?: string
        }
        Update: {
          capabilities?: string[]
          cost_per_1k_tokens?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          model_id?: string
          name?: string
          parameters?: Json
          provider?: string
          updated_at?: string
        }
      }
      ai_workflow_runs: {
        Row: {
          created_at: string
          error: string | null
          end_time: string | null
          id: string
          results: Json
          start_time: string
          status: string | null
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          end_time?: string | null
          id?: string
          results?: Json
          start_time?: string
          status?: string | null
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          end_time?: string | null
          id?: string
          results?: Json
          start_time?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
      }
      ai_workflows: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          steps: Json[]
          trigger_config: Json
          trigger_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          steps: Json[]
          trigger_config?: Json
          trigger_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          steps?: Json[]
          trigger_config?: Json
          trigger_type?: string | null
          updated_at?: string
          user_id?: string
        }
      }
      business_cards: {
        Row: {
          businesscard_name: string | null
          company_name: string | null
          created_at: string | null
          id: string
          public_access: boolean | null
          public_id: string | null
          style: Json | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          businesscard_name?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          public_access?: boolean | null
          public_id?: string
          style?: Json | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          businesscard_name?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          public_access?: boolean | null
          public_id?: string
          style?: Json | null
          user_id?: string | null
          website?: string | null
        }
      }
      crm_activities: {
        Row: {
          completed_date: string | null
          connection_id: string
          contact_id: string | null
          created_at: string
          custom_fields: Json | null
          deal_id: string | null
          description: string | null
          due_date: string | null
          external_id: string
          id: string
          priority: string | null
          status: string | null
          subject: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_date?: string | null
          connection_id: string
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          external_id: string
          id?: string
          priority?: string | null
          status?: string | null
          subject: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_date?: string | null
          connection_id?: string
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          external_id?: string
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
      }
      crm_connections: {
        Row: {
          access_token: string | null
          api_key: string | null
          created_at: string
          expires_at: string | null
          id: string
          instance_url: string | null
          is_active: boolean
          last_sync_at: string | null
          name: string
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          instance_url?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          name: string
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          instance_url?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          name?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
      }
      crm_contacts: {
        Row: {
          address: string | null
          company: string | null
          connection_id: string
          created_at: string
          custom_fields: Json | null
          email: string | null
          external_id: string
          first_name: string | null
          id: string
          job_title: string | null
          last_contacted: string | null
          last_name: string | null
          phone: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          connection_id: string
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          external_id: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_contacted?: string | null
          last_name?: string | null
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company?: string | null
          connection_id?: string
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          external_id?: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_contacted?: string | null
          last_name?: string | null
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
      }
      crm_deals: {
        Row: {
          amount: number | null
          close_date: string | null
          connection_id: string
          contact_id: string | null
          created_at: string
          currency: string | null
          custom_fields: Json | null
          description: string | null
          external_id: string
          id: string
          name: string
          probability: number | null
          stage: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          close_date?: string | null
          connection_id: string
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          custom_fields?: Json | null
          description?: string | null
          external_id: string
          id?: string
          name: string
          probability?: number | null
          stage?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          close_date?: string | null
          connection_id?: string
          contact_id?: string | null
          created_at?: string
          currency?: string | null
          custom_fields?: Json | null
          description?: string | null
          external_id?: string
          id?: string
          name?: string
          probability?: number | null
          stage?: string | null
          updated_at?: string
          user_id?: string
        }
      }
      data_embeddings: {
        Row: {
          created_at: string
          description: string | null
          embedding_model: string
          id: string
          metadata: Json
          name: string
          source_id: string | null
          source_type: string
          updated_at: string
          user_id: string
          vector_data: unknown | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          embedding_model: string
          id?: string
          metadata?: Json
          name: string
          source_id?: string | null
          source_type: string
          updated_at?: string
          user_id: string
          vector_data: unknown | null
        }
        Update: {
          created_at?: string
          description?: string | null
          embedding_model?: string
          id?: string
          metadata?: Json
          name?: string
          source_id?: string | null
          source_type?: string
          updated_at?: string
          user_id?: string
          vector_data?: unknown | null
        }
      }
      developer_tools: {
        Row: {
          configuration: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          tool_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          tool_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tool_type?: string
          updated_at?: string
          user_id?: string
        }
      }
      nfts: {
        Row: {
          created_at: string
          id: string
          name: string
          profile_id: string
          token_id: string
          tx_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          profile_id: string
          token_id: string
          tx_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          profile_id?: string
          token_id?: string
          tx_hash?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          card_style: Json | null
          company: string | null
          company_logo_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          linkedin_url: string | null
          public_access: boolean | null
          public_id: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          waddress: string | null
          xhandle: string | null
        }
        Insert: {
          avatar_url?: string | null
          card_style?: Json | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          job_title?: string | null
          linkedin_url?: string | null
          public_access?: boolean | null
          public_id?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          waddress?: string | null
          xhandle?: string | null
        }
        Update: {
          avatar_url?: string | null
          card_style?: Json | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          public_access?: boolean | null
          public_id?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          waddress?: string | null
          xhandle?: string | null
        }
      }
      reusable_packages: {
        Row: DatabaseOriginal["public"]["Tables"]["reusable_packages"]["Row"] & {
          current_shipment_id?: string | null
          shipment_history?: string[] | null
        }
        Insert: DatabaseOriginal["public"]["Tables"]["reusable_packages"]["Insert"] & {
          current_shipment_id?: string | null
          shipment_history?: string[] | null
        }
        Update: DatabaseOriginal["public"]["Tables"]["reusable_packages"]["Update"] & {
          current_shipment_id?: string | null
          shipment_history?: string[] | null
        }
      }
      shipping: {
        Row: {
          carrier: string | null
          created_at: string | null
          destination_address: Json | null
          estimated_delivery: string | null
          id: string
          iot_sensor_id: string | null
          origin_address: Json | null
          package_ids: string[] | null
          public_id: string | null
          service_level: string | null
          shipping_date: string | null
          status: string | null
          tracking_number: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          destination_address?: Json | null
          estimated_delivery?: string | null
          id?: string
          iot_sensor_id?: string | null
          origin_address?: Json | null
          package_ids?: string[] | null
          public_id?: string
          service_level?: string | null
          shipping_date?: string | null
          status?: string | null
          tracking_number: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          destination_address?: Json | null
          estimated_delivery?: string | null
          id?: string
          iot_sensor_id?: string | null
          origin_address?: Json | null
          package_ids?: string[] | null
          public_id?: string
          service_level?: string | null
          shipping_date?: string | null
          status?: string | null
          tracking_number?: string
          updated_at?: string | null
          weight?: number | null
        }
      }
      sui_nfts: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          object_id: string
          profile_id: string
          tx_digest: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          object_id: string
          profile_id: string
          tx_digest: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          object_id?: string
          profile_id?: string
          tx_digest?: string
          user_id?: string
        }
      }
    }
    Views: {
      package_utilization: {
        Row: {
          created_at: string | null
          days_since_creation: number | null
          id: string | null
          last_used_date: string | null
          name: string | null
          package_id: string | null
          reuse_count: number | null
          reuses_per_day: number | null
          shipment_count: number | null
          status: string | null
        }
      }
      shipping_analytics: {
        Row: {
          avg_actual_delivery_days: number | null
          avg_cost: number | null
          avg_estimated_delivery_days: number | null
          avg_weight: number | null
          delivered_count: number | null
          delayed_count: number | null
          in_transit_count: number | null
          shipping_day: string | null
          total_cost: number | null
          total_shipments: number | null
          total_weight: number | null
        }
      }
      package_shipment_details: {
        Row: {
          package_id: string
          tracking_code: string
          package_name: string
          status: string | null
          reuse_count: number | null
          shipment_id: string | null
          tracking_number: string | null
          shipment_status: string | null
          carrier: string | null
          origin_address: any | null
          destination_address: any | null
          shipping_date: string | null
          estimated_delivery: string | null
        }
      }
    }
    Functions: {
      increment_reuse_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {}
  }
}
