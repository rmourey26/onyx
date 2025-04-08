export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  next_auth: {
    Tables: {
      accounts: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          oauth_token: string | null
          oauth_token_secret: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          userId: string | null
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          userId?: string | null
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          expires: string
          id: string
          sessionToken: string
          userId: string | null
        }
        Insert: {
          expires: string
          id?: string
          sessionToken: string
          userId?: string | null
        }
        Update: {
          expires?: string
          id?: string
          sessionToken?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string | null
          emailVerified: string | null
          id: string
          image: string | null
          name: string | null
        }
        Insert: {
          email?: string | null
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
        }
        Update: {
          email?: string | null
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
        }
        Relationships: []
      }
      verification_tokens: {
        Row: {
          expires: string
          identifier: string | null
          token: string
        }
        Insert: {
          expires: string
          identifier?: string | null
          token: string
        }
        Update: {
          expires?: string
          identifier?: string | null
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_agents: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          model_id: string | null
          name: string
          parameters: Json | null
          system_prompt: string | null
          tools: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string | null
          name: string
          parameters?: Json | null
          system_prompt?: string | null
          tools?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string | null
          name?: string
          parameters?: Json | null
          system_prompt?: string | null
          tools?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analysis_results: {
        Row: {
          agent_id: string | null
          analysis_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          results: Json
          source_id: string
          source_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          analysis_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          results: Json
          source_id: string
          source_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          analysis_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          results?: Json
          source_id?: string
          source_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_results_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          capabilities: Json | null
          cost_per_1k_tokens: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          model_id: string
          name: string
          parameters: Json | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          capabilities?: Json | null
          cost_per_1k_tokens?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model_id: string
          name: string
          parameters?: Json | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          capabilities?: Json | null
          cost_per_1k_tokens?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string
          name?: string
          parameters?: Json | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_workflow_runs: {
        Row: {
          created_at: string | null
          end_time: string | null
          error: string | null
          id: string
          results: Json | null
          start_time: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          error?: string | null
          id?: string
          results?: Json | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          error?: string | null
          id?: string
          results?: Json | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "ai_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          steps: Json
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps: Json
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_cards: {
        Row: {
          businesscard_name: string | null
          company_name: string | null
          created_at: string
          id: string
          public_access: boolean | null
          public_id: string | null
          style: Json | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          businesscard_name?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          public_access?: boolean | null
          public_id?: string | null
          style?: Json | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          businesscard_name?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          public_access?: boolean | null
          public_id?: string | null
          style?: Json | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      chat: {
        Row: {
          created_at: string
          id: number
          messages: string[] | null
          path: string | null
          profile_id: string
          sharepath: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at: string
          id?: number
          messages?: string[] | null
          path?: string | null
          profile_id: string
          sharepath?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          messages?: string[] | null
          path?: string | null
          profile_id?: string
          sharepath?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          continent: Database["public"]["Enums"]["continents"] | null
          id: number
          iso2: string
          iso3: string | null
          local_name: string | null
          name: string | null
        }
        Insert: {
          continent?: Database["public"]["Enums"]["continents"] | null
          id?: number
          iso2: string
          iso3?: string | null
          local_name?: string | null
          name?: string | null
        }
        Update: {
          continent?: Database["public"]["Enums"]["continents"] | null
          id?: number
          iso2?: string
          iso3?: string | null
          local_name?: string | null
          name?: string | null
        }
        Relationships: []
      }
      crm_activities: {
        Row: {
          completed_date: string | null
          connection_id: string | null
          contact_id: string | null
          created_at: string | null
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
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_date?: string | null
          connection_id?: string | null
          contact_id?: string | null
          created_at?: string | null
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
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_date?: string | null
          connection_id?: string | null
          contact_id?: string | null
          created_at?: string | null
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
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "crm_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_connection"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "crm_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_connections: {
        Row: {
          access_token: string | null
          api_key: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          instance_url: string | null
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          provider: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          instance_url?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          provider: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          instance_url?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crm_contacts: {
        Row: {
          address: string | null
          company: string | null
          connection_id: string | null
          created_at: string | null
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
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          connection_id?: string | null
          created_at?: string | null
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
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          connection_id?: string | null
          created_at?: string | null
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
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "crm_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_connection"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "crm_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_data: {
        Row: {
          connection_id: string | null
          created_at: string | null
          data: Json
          external_id: string
          id: string
          last_updated: string | null
          record_type: string
          user_id: string | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string | null
          data: Json
          external_id: string
          id?: string
          last_updated?: string | null
          record_type: string
          user_id?: string | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string | null
          data?: Json
          external_id?: string
          id?: string
          last_updated?: string | null
          record_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_data_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "crm_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          amount: number | null
          close_date: string | null
          connection_id: string | null
          contact_id: string | null
          created_at: string | null
          currency: string | null
          custom_fields: Json | null
          description: string | null
          external_id: string
          id: string
          name: string
          probability: number | null
          stage: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          close_date?: string | null
          connection_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          custom_fields?: Json | null
          description?: string | null
          external_id: string
          id?: string
          name: string
          probability?: number | null
          stage?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          close_date?: string | null
          connection_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          custom_fields?: Json | null
          description?: string | null
          external_id?: string
          id?: string
          name?: string
          probability?: number | null
          stage?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "crm_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_connection"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "crm_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      data_embeddings: {
        Row: {
          created_at: string | null
          description: string | null
          embedding_model: string
          id: string
          metadata: Json | null
          name: string
          source_id: string | null
          source_type: string
          updated_at: string | null
          user_id: string | null
          vector_data: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          embedding_model: string
          id?: string
          metadata?: Json | null
          name: string
          source_id?: string | null
          source_type: string
          updated_at?: string | null
          user_id?: string | null
          vector_data?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          embedding_model?: string
          id?: string
          metadata?: Json | null
          name?: string
          source_id?: string | null
          source_type?: string
          updated_at?: string | null
          user_id?: string | null
          vector_data?: string | null
        }
        Relationships: []
      }
      developer_tools: {
        Row: {
          configuration: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tool_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          configuration: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tool_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tool_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      gpt_one: {
        Row: {
          created_at: string
          email: string
          id: string
          messages: string | null
          user_input: string | null
          vector_one: string | null
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          messages?: string | null
          user_input?: string | null
          vector_one?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          messages?: string | null
          user_input?: string | null
          vector_one?: string | null
        }
        Relationships: []
      }
      inqueries: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: number
          message: string
          name?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          message?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          meet_link: string
          start_time: string
          summary: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          meet_link: string
          start_time: string
          summary: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          meet_link?: string
          start_time?: string
          summary?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      members_table: {
        Row: {
          created_at: string
          email: string | null
          id: number
          member_id: string
          name: string | null
          password: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: number
          member_id: string
          name?: string | null
          password?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          member_id?: string
          name?: string | null
          password?: string
        }
        Relationships: []
      }
      moralis_users: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          moralis_provider: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          moralis_provider?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          moralis_provider?: string | null
        }
        Relationships: []
      }
      nfts: {
        Row: {
          created_at: string
          id: string
          name: string | null
          profile_id: string | null
          token_id: string | null
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          profile_id?: string | null
          token_id?: string | null
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          profile_id?: string | null
          token_id?: string | null
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nods_page: {
        Row: {
          checksum: string | null
          id: number
          meta: Json | null
          parent_page_id: number | null
          path: string
          source: string | null
          type: string | null
        }
        Insert: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path: string
          source?: string | null
          type?: string | null
        }
        Update: {
          checksum?: string | null
          id?: number
          meta?: Json | null
          parent_page_id?: number | null
          path?: string
          source?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      nods_page_section: {
        Row: {
          content: string | null
          embedding: string | null
          heading: string | null
          id: number
          page_id: number
          slug: string | null
          token_count: number | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id: number
          slug?: string | null
          token_count?: number | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          heading?: string | null
          id?: number
          page_id?: number
          slug?: string | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nods_page_section_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "nods_page"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          qr_code_url: string | null
          status: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          qr_code_url?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          qr_code_url?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      permission_table: {
        Row: {
          created_at: string
          id: number
          member_id: string
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: number
          member_id: string
          role: string
          status: string
        }
        Update: {
          created_at?: string
          id?: number
          member_id?: string
          role?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          card_style: Json | null
          card_styles: string | null
          company: string | null
          company_logo_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          linkedin_url: string | null
          public_id: string | null
          role: string | null
          updated_at: string | null
          username: string | null
          waddress: string | null
          website: string | null
          xhandle: string | null
        }
        Insert: {
          avatar_url?: string | null
          card_style?: Json | null
          card_styles?: string | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          public_id?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
          waddress?: string | null
          website?: string | null
          xhandle?: string | null
        }
        Update: {
          avatar_url?: string | null
          card_style?: Json | null
          card_styles?: string | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          public_id?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
          waddress?: string | null
          website?: string | null
          xhandle?: string | null
        }
        Relationships: []
      }
      reusable_packages: {
        Row: {
          created_at: string | null
          current_uses: number | null
          description: string | null
          dimensions: string | null
          id: string
          material: string | null
          max_uses: number | null
          name: string
          notes: string | null
          package_id: string | null
          qr_code: string | null
          reuse_count: number | null
          status: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          dimensions?: string | null
          id: string
          material?: string | null
          max_uses?: number | null
          name: string
          notes?: string | null
          package_id?: string | null
          qr_code?: string | null
          reuse_count?: number | null
          status?: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          dimensions?: string | null
          id?: string
          material?: string | null
          max_uses?: number | null
          name?: string
          notes?: string | null
          package_id?: string | null
          qr_code?: string | null
          reuse_count?: number | null
          status?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string | null
          delivered_at: string | null
          destination: string
          estimated_delivery: string | null
          id: string
          notes: string | null
          origin: string
          package_id: string | null
          qr_code: string | null
          recipient_email: string | null
          recipient_name: string | null
          shipped_at: string | null
          status: string
          tracking_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          destination: string
          estimated_delivery?: string | null
          id: string
          notes?: string | null
          origin: string
          package_id?: string | null
          qr_code?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          shipped_at?: string | null
          status?: string
          tracking_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          destination?: string
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          origin?: string
          package_id?: string | null
          qr_code?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          shipped_at?: string | null
          status?: string
          tracking_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "package_utilization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "reusable_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping: {
        Row: {
          actual_delivery: string | null
          carrier: string | null
          cost: number | null
          created_at: string | null
          destination_address: Json
          dimensions: Json | null
          estimated_delivery: string | null
          id: string
          metadata: Json | null
          origin_address: Json
          package_ids: Json | null
          shipping_date: string | null
          status: string | null
          tracking_number: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          actual_delivery?: string | null
          carrier?: string | null
          cost?: number | null
          created_at?: string | null
          destination_address: Json
          dimensions?: Json | null
          estimated_delivery?: string | null
          id?: string
          metadata?: Json | null
          origin_address: Json
          package_ids?: Json | null
          shipping_date?: string | null
          status?: string | null
          tracking_number: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          actual_delivery?: string | null
          carrier?: string | null
          cost?: number | null
          created_at?: string | null
          destination_address?: Json
          dimensions?: Json | null
          estimated_delivery?: string | null
          id?: string
          metadata?: Json | null
          origin_address?: Json
          package_ids?: Json | null
          shipping_date?: string | null
          status?: string | null
          tracking_number?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      sui_nfts: {
        Row: {
          avatar_url: string
          blockchain: string
          content_url: string
          created_at: string | null
          domain_name: string
          id: string
          name: string
          profile_id: string | null
          tx_hash: string
          user_id: string | null
        }
        Insert: {
          avatar_url: string
          blockchain?: string
          content_url: string
          created_at?: string | null
          domain_name: string
          id?: string
          name: string
          profile_id?: string | null
          tx_hash: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string
          blockchain?: string
          content_url?: string
          created_at?: string | null
          domain_name?: string
          id?: string
          name?: string
          profile_id?: string | null
          tx_hash?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sui_nfts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_chain_data: {
        Row: {
          created_at: string | null
          data: Json
          data_type: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          data_type: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          data_type?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      todos: {
        Row: {
          created_at: string
          created_by: string
          id: number
          is_complete: boolean | null
          task: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at: string
          created_by: string
          id?: number
          is_complete?: boolean | null
          task?: string | null
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: number
          is_complete?: boolean | null
          task?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "members_table"
            referencedColumns: ["member_id"]
          },
        ]
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
        Relationships: []
      }
      shipping_analytics: {
        Row: {
          avg_actual_delivery_days: number | null
          avg_cost: number | null
          avg_estimated_delivery_days: number | null
          avg_weight: number | null
          delayed_count: number | null
          delivered_count: number | null
          in_transit_count: number | null
          shipping_day: string | null
          total_cost: number | null
          total_shipments: number | null
          total_weight: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      decrement_package_usage: {
        Args: { package_id: string }
        Returns: undefined
      }
      get_page_parents: {
        Args: { page_id: number }
        Returns: {
          id: number
          parent_page_id: number
          path: string
          meta: Json
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_package_usage: {
        Args: { package_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_first_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_page_sections: {
        Args: {
          embedding: string
          match_threshold: number
          match_count: number
          min_content_length: number
        }
        Returns: {
          id: number
          page_id: number
          slug: string
          heading: string
          content: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      continents:
        | "Africa"
        | "Antarctica"
        | "Asia"
        | "Europe"
        | "Oceania"
        | "North America"
        | "South America"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      policies: {
        Row: {
          bucket_id: string
          created_at: string | null
          definition: string
          id: number
          name: string
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          definition: string
          id?: never
          name: string
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          definition?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: { bucketid: string; name: string; owner: string; metadata: Json }
        Returns: undefined
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  next_auth: {
    Enums: {},
  },
  public: {
    Enums: {
      continents: [
        "Africa",
        "Antarctica",
        "Asia",
        "Europe",
        "Oceania",
        "North America",
        "South America",
      ],
      user_role: ["user", "admin"],
    },
  },
  storage: {
    Enums: {},
  },
} as const
