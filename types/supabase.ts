export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      a2a_agent_cards: {
        Row: {
          aethernet_address: string | null
          agent_id: string
          capabilities: Json | null
          created_at: string | null
          default_input_modes: string[] | null
          default_output_modes: string[] | null
          description: string | null
          documentation_url: string | null
          extended_card: Json | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          kronova_agent_id: string | null
          name: string
          protocol_versions: string[] | null
          provider: Json | null
          security: Json | null
          security_schemes: Json | null
          skills: Json | null
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          aethernet_address?: string | null
          agent_id: string
          capabilities?: Json | null
          created_at?: string | null
          default_input_modes?: string[] | null
          default_output_modes?: string[] | null
          description?: string | null
          documentation_url?: string | null
          extended_card?: Json | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          kronova_agent_id?: string | null
          name: string
          protocol_versions?: string[] | null
          provider?: Json | null
          security?: Json | null
          security_schemes?: Json | null
          skills?: Json | null
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          aethernet_address?: string | null
          agent_id?: string
          capabilities?: Json | null
          created_at?: string | null
          default_input_modes?: string[] | null
          default_output_modes?: string[] | null
          description?: string | null
          documentation_url?: string | null
          extended_card?: Json | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          kronova_agent_id?: string | null
          name?: string
          protocol_versions?: string[] | null
          provider?: Json | null
          security?: Json | null
          security_schemes?: Json | null
          skills?: Json | null
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "a2a_agent_cards_kronova_agent_id_fkey"
            columns: ["kronova_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      a2a_artifacts: {
        Row: {
          append: boolean | null
          artifact_id: string
          artifact_index: number | null
          created_at: string | null
          description: string | null
          extensions: Json | null
          id: string
          last_chunk: boolean | null
          metadata: Json | null
          name: string | null
          parts: Json
          task_id: string
        }
        Insert: {
          append?: boolean | null
          artifact_id: string
          artifact_index?: number | null
          created_at?: string | null
          description?: string | null
          extensions?: Json | null
          id?: string
          last_chunk?: boolean | null
          metadata?: Json | null
          name?: string | null
          parts?: Json
          task_id: string
        }
        Update: {
          append?: boolean | null
          artifact_id?: string
          artifact_index?: number | null
          created_at?: string | null
          description?: string | null
          extensions?: Json | null
          id?: string
          last_chunk?: boolean | null
          metadata?: Json | null
          name?: string | null
          parts?: Json
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "a2a_artifacts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "a2a_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      a2a_extensions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          schema_definition: Json
          updated_at: string | null
          uri: string
          user_id: string
          version: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          schema_definition: Json
          updated_at?: string | null
          uri: string
          user_id: string
          version?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          schema_definition?: Json
          updated_at?: string | null
          uri?: string
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      a2a_messages: {
        Row: {
          context_id: string | null
          created_at: string | null
          extensions: Json | null
          id: string
          message_id: string
          metadata: Json | null
          parts: Json
          reference_task_ids: string[] | null
          role: string
          task_id: string
          user_id: string
        }
        Insert: {
          context_id?: string | null
          created_at?: string | null
          extensions?: Json | null
          id?: string
          message_id: string
          metadata?: Json | null
          parts?: Json
          reference_task_ids?: string[] | null
          role: string
          task_id: string
          user_id: string
        }
        Update: {
          context_id?: string | null
          created_at?: string | null
          extensions?: Json | null
          id?: string
          message_id?: string
          metadata?: Json | null
          parts?: Json
          reference_task_ids?: string[] | null
          role?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "a2a_messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "a2a_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      a2a_push_notification_configs: {
        Row: {
          authentication: Json | null
          config_id: string
          created_at: string | null
          events_to_send: string[] | null
          id: string
          is_active: boolean | null
          last_delivery_at: string | null
          last_delivery_status: string | null
          task_id: string
          updated_at: string | null
          url: string
        }
        Insert: {
          authentication?: Json | null
          config_id: string
          created_at?: string | null
          events_to_send?: string[] | null
          id?: string
          is_active?: boolean | null
          last_delivery_at?: string | null
          last_delivery_status?: string | null
          task_id: string
          updated_at?: string | null
          url: string
        }
        Update: {
          authentication?: Json | null
          config_id?: string
          created_at?: string | null
          events_to_send?: string[] | null
          id?: string
          is_active?: boolean | null
          last_delivery_at?: string | null
          last_delivery_status?: string | null
          task_id?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "a2a_push_notification_configs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "a2a_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      a2a_tasks: {
        Row: {
          artifacts: Json | null
          client_agent_card_id: string | null
          context_id: string
          created_at: string | null
          current_state: string
          history: Json | null
          id: string
          kronova_workflow_run_id: string | null
          metadata: Json | null
          push_notification_config: Json | null
          server_agent_card_id: string | null
          status: Json
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artifacts?: Json | null
          client_agent_card_id?: string | null
          context_id: string
          created_at?: string | null
          current_state?: string
          history?: Json | null
          id?: string
          kronova_workflow_run_id?: string | null
          metadata?: Json | null
          push_notification_config?: Json | null
          server_agent_card_id?: string | null
          status?: Json
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artifacts?: Json | null
          client_agent_card_id?: string | null
          context_id?: string
          created_at?: string | null
          current_state?: string
          history?: Json | null
          id?: string
          kronova_workflow_run_id?: string | null
          metadata?: Json | null
          push_notification_config?: Json | null
          server_agent_card_id?: string | null
          status?: Json
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "a2a_tasks_client_agent_card_id_fkey"
            columns: ["client_agent_card_id"]
            isOneToOne: false
            referencedRelation: "a2a_agent_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "a2a_tasks_kronova_workflow_run_id_fkey"
            columns: ["kronova_workflow_run_id"]
            isOneToOne: false
            referencedRelation: "ai_workflow_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "a2a_tasks_server_agent_card_id_fkey"
            columns: ["server_agent_card_id"]
            isOneToOne: false
            referencedRelation: "a2a_agent_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      aethernet_connections: {
        Row: {
          aethernet_address: string
          bandwidth_used: number | null
          connection_name: string
          connection_status: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          messages_received: number | null
          messages_sent: number | null
          network_type: string | null
          peer_count: number | null
          private_key_encrypted: string
          public_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aethernet_address: string
          bandwidth_used?: number | null
          connection_name: string
          connection_status?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          messages_received?: number | null
          messages_sent?: number | null
          network_type?: string | null
          peer_count?: number | null
          private_key_encrypted: string
          public_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aethernet_address?: string
          bandwidth_used?: number | null
          connection_name?: string
          connection_status?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          messages_received?: number | null
          messages_sent?: number | null
          network_type?: string | null
          peer_count?: number | null
          private_key_encrypted?: string
          public_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aethernet_delivery_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_timestamp: string | null
          event_type: string
          id: string
          ip_address: unknown
          message_id: string
          recipient_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_timestamp?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          message_id: string
          recipient_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_timestamp?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          message_id?: string
          recipient_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aethernet_delivery_logs_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "aethernet_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      aethernet_message_recipients: {
        Row: {
          aethernet_message_id: string
          delivered_at: string | null
          delivery_status: string
          encrypted_payload: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          read_status: string
          recipient_id: string
          recipient_type: string
          sender_key_id: string | null
          signature: string | null
          status: string
        }
        Insert: {
          aethernet_message_id: string
          delivered_at?: string | null
          delivery_status?: string
          encrypted_payload?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          read_status?: string
          recipient_id: string
          recipient_type?: string
          sender_key_id?: string | null
          signature?: string | null
          status?: string
        }
        Update: {
          aethernet_message_id?: string
          delivered_at?: string | null
          delivery_status?: string
          encrypted_payload?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          read_status?: string
          recipient_id?: string
          recipient_type?: string
          sender_key_id?: string | null
          signature?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "aethernet_message_recipients_aethernet_message_id_fkey"
            columns: ["aethernet_message_id"]
            isOneToOne: false
            referencedRelation: "aethernet_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aethernet_message_recipients_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      aethernet_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          encrypted: boolean | null
          encryption_method: string | null
          expires_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          parent_message_id: string | null
          priority: string
          sender_id: string
          sent_at: string | null
          status: string
          thread_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          encrypted?: boolean | null
          encryption_method?: string | null
          expires_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          parent_message_id?: string | null
          priority?: string
          sender_id: string
          sent_at?: string | null
          status?: string
          thread_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          encrypted?: boolean | null
          encryption_method?: string | null
          expires_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          parent_message_id?: string | null
          priority?: string
          sender_id?: string
          sent_at?: string | null
          status?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aethernet_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aethernet_messages_parent_message_id"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "aethernet_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aethernet_messages_thread_id"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "aethernet_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      aethernet_protocol_settings: {
        Row: {
          allowed_file_types: string[] | null
          auto_reply_settings: Json | null
          created_at: string | null
          default_encryption_method: string | null
          encryption_enabled: boolean | null
          id: string
          max_attachments_per_message: number | null
          max_message_size_mb: number | null
          message_retention_days: number | null
          notification_preferences: Json | null
          protocol_version: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allowed_file_types?: string[] | null
          auto_reply_settings?: Json | null
          created_at?: string | null
          default_encryption_method?: string | null
          encryption_enabled?: boolean | null
          id?: string
          max_attachments_per_message?: number | null
          max_message_size_mb?: number | null
          message_retention_days?: number | null
          notification_preferences?: Json | null
          protocol_version?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allowed_file_types?: string[] | null
          auto_reply_settings?: Json | null
          created_at?: string | null
          default_encryption_method?: string | null
          encryption_enabled?: boolean | null
          id?: string
          max_attachments_per_message?: number | null
          max_message_size_mb?: number | null
          message_retention_days?: number | null
          notification_preferences?: Json | null
          protocol_version?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_execution_contexts: {
        Row: {
          agent_id: string
          context_data: Json
          context_type: string
          created_at: string | null
          execution_id: string
          execution_timestamp: string | null
          id: string
        }
        Insert: {
          agent_id: string
          context_data?: Json
          context_type: string
          created_at?: string | null
          execution_id: string
          execution_timestamp?: string | null
          id?: string
        }
        Update: {
          agent_id?: string
          context_data?: Json
          context_type?: string
          created_at?: string | null
          execution_id?: string
          execution_timestamp?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_execution_contexts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_execution_logs: {
        Row: {
          agent_id: string
          created_at: string | null
          error: string | null
          execution_time: number | null
          id: string
          input: string
          output: string | null
          status: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          error?: string | null
          execution_time?: number | null
          id?: string
          input: string
          output?: string | null
          status: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          error?: string | null
          execution_time?: number | null
          id?: string
          input?: string
          output?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_execution_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_context_permissions: {
        Row: {
          agent_id: string
          context_id: string
          expires_at: string | null
          granted_at: string | null
          id: string
          permissions: Json
        }
        Insert: {
          agent_id: string
          context_id: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          permissions?: Json
        }
        Update: {
          agent_id?: string
          context_id?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          permissions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_context_permissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_context_permissions_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_contexts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_contexts: {
        Row: {
          agent_id: string | null
          connection_status: string | null
          context_config: Json
          context_name: string
          context_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          oauth_client_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          connection_status?: string | null
          context_config?: Json
          context_name: string
          context_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          oauth_client_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          connection_status?: string | null
          context_config?: Json
          context_name?: string
          context_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          oauth_client_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_contexts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_contexts_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "user_oauth_clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      ai_agent_runs: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_settings: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          settings: Json
          settings_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          settings?: Json
          settings_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          settings?: Json
          settings_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_settings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model_id: string | null
          name: string
          parameters: Json | null
          system_prompt: string | null
          temperature: number | null
          template_id: string | null
          tools: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_id?: string | null
          name: string
          parameters?: Json | null
          system_prompt?: string | null
          temperature?: number | null
          template_id?: string | null
          tools?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_id?: string | null
          name?: string
          parameters?: Json | null
          system_prompt?: string | null
          temperature?: number | null
          template_id?: string | null
          tools?: Json | null
          updated_at?: string | null
          user_id?: string
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
      ai_agents_tools_backup: {
        Row: {
          id: string | null
          tools: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string | null
          tools?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string | null
          tools?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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
          user_id: string
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
          user_id?: string
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
          user_id?: string
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
          model_type: string
          name: string
          parameters: Json | null
          provider: string
          type: string
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
          model_type?: string
          name: string
          parameters?: Json | null
          provider: string
          type: string
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
          model_type?: string
          name?: string
          parameters?: Json | null
          provider?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_request_logs: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_length: number | null
          metadata: Json | null
          model_id: string | null
          output_length: number | null
          request_type: string
          response_time_ms: number | null
          status: string | null
          tokens_used: number | null
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_length?: number | null
          metadata?: Json | null
          model_id?: string | null
          output_length?: number | null
          request_type: string
          response_time_ms?: number | null
          status?: string | null
          tokens_used?: number | null
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_length?: number | null
          metadata?: Json | null
          model_id?: string | null
          output_length?: number | null
          request_type?: string
          response_time_ms?: number | null
          status?: string | null
          tokens_used?: number | null
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_request_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_request_logs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_request_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "ai_workflows"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string
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
          user_id?: string
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
          user_id?: string
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
          ai_model: string | null
          asset_type: string | null
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          steps: Json
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          asset_type?: string | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          steps: Json
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          ai_model?: string | null
          asset_type?: string | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          steps?: Json
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_endpoint_connections: {
        Row: {
          auth_config: Json | null
          auth_type: string | null
          base_url: string
          created_at: string | null
          endpoint_name: string
          headers: Json | null
          id: string
          is_active: boolean | null
          oauth_client_id: string | null
          rate_limit_config: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_config?: Json | null
          auth_type?: string | null
          base_url: string
          created_at?: string | null
          endpoint_name: string
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          oauth_client_id?: string | null
          rate_limit_config?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_config?: Json | null
          auth_type?: string | null
          base_url?: string
          created_at?: string | null
          endpoint_name?: string
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          oauth_client_id?: string | null
          rate_limit_config?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_endpoint_connections_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "user_oauth_clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      api_key_audit_log: {
        Row: {
          action: string
          api_key_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          api_key_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          api_key_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_routes: {
        Row: {
          created_at: string | null
          description: string | null
          edge_function: string
          id: string
          is_active: boolean | null
          method: string
          path: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          edge_function: string
          id?: string
          is_active?: boolean | null
          method: string
          path: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          edge_function?: string
          id?: string
          is_active?: boolean | null
          method?: string
          path?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      asset_agent_configs: {
        Row: {
          agent_id: string
          auto_insights: boolean | null
          created_at: string | null
          id: string
          notification_threshold: string
          target_assets: Json
          template_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          auto_insights?: boolean | null
          created_at?: string | null
          id?: string
          notification_threshold?: string
          target_assets?: Json
          template_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          auto_insights?: boolean | null
          created_at?: string | null
          id?: string
          notification_threshold?: string
          target_assets?: Json
          template_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_agent_configs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_intelligence_agent_templates: {
        Row: {
          asset_types: string[]
          business_value: string | null
          capabilities: string[]
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          parameters: Json
          system_prompt: string
          template_id: string
          tools: string[]
          updated_at: string | null
          version: number
        }
        Insert: {
          asset_types?: string[]
          business_value?: string | null
          capabilities?: string[]
          category: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          parameters?: Json
          system_prompt: string
          template_id: string
          tools?: string[]
          updated_at?: string | null
          version?: number
        }
        Update: {
          asset_types?: string[]
          business_value?: string | null
          capabilities?: string[]
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          parameters?: Json
          system_prompt?: string
          template_id?: string
          tools?: string[]
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      asset_intelligence_insights: {
        Row: {
          ai_agent_id: string | null
          asset_id: string
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          priority: string
          recommendations: Json | null
          status: string
          updated_at: string | null
          user_id: string
          workflow_run_id: string | null
        }
        Insert: {
          ai_agent_id?: string | null
          asset_id: string
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          priority?: string
          recommendations?: Json | null
          status?: string
          updated_at?: string | null
          user_id: string
          workflow_run_id?: string | null
        }
        Update: {
          ai_agent_id?: string | null
          asset_id?: string
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          priority?: string
          recommendations?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_intelligence_insights_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_intelligence_learning: {
        Row: {
          asset_context: Json | null
          asset_ids: string[] | null
          created_at: string | null
          description: string | null
          embedding_model: string
          execution_id: string
          execution_input: Json
          execution_metrics: Json | null
          execution_name: string
          execution_output: Json
          execution_type: string
          id: string
          metadata: Json
          name: string
          quality_rating: number | null
          success_score: number | null
          tags: string[] | null
          updated_at: string | null
          user_feedback: string | null
          user_id: string
          vector_data: string | null
        }
        Insert: {
          asset_context?: Json | null
          asset_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          embedding_model?: string
          execution_id: string
          execution_input?: Json
          execution_metrics?: Json | null
          execution_name: string
          execution_output?: Json
          execution_type: string
          id?: string
          metadata?: Json
          name: string
          quality_rating?: number | null
          success_score?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id: string
          vector_data?: string | null
        }
        Update: {
          asset_context?: Json | null
          asset_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          embedding_model?: string
          execution_id?: string
          execution_input?: Json
          execution_metrics?: Json | null
          execution_name?: string
          execution_output?: Json
          execution_type?: string
          id?: string
          metadata?: Json
          name?: string
          quality_rating?: number | null
          success_score?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id?: string
          vector_data?: string | null
        }
        Relationships: []
      }
      asset_intelligence_template_categories: {
        Row: {
          category_name: string
          category_type: string
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          category_name: string
          category_type: string
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          category_name?: string
          category_type?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      asset_intelligence_template_usage: {
        Row: {
          average_execution_time: unknown
          created_at: string | null
          deployment_id: string | null
          feedback_comments: string | null
          feedback_rating: number | null
          id: string
          last_used_at: string | null
          success_rate: number | null
          template_id: string
          template_type: string
          updated_at: string | null
          usage_count: number
          user_id: string | null
        }
        Insert: {
          average_execution_time?: unknown
          created_at?: string | null
          deployment_id?: string | null
          feedback_comments?: string | null
          feedback_rating?: number | null
          id?: string
          last_used_at?: string | null
          success_rate?: number | null
          template_id: string
          template_type: string
          updated_at?: string | null
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          average_execution_time?: unknown
          created_at?: string | null
          deployment_id?: string | null
          feedback_comments?: string | null
          feedback_rating?: number | null
          id?: string
          last_used_at?: string | null
          success_rate?: number | null
          template_id?: string
          template_type?: string
          updated_at?: string | null
          usage_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
      asset_intelligence_workflow_templates: {
        Row: {
          ai_model: string
          asset_types: string[]
          business_value: string | null
          category: string
          created_at: string | null
          description: string
          difficulty: string
          estimated_time: string
          icon: string
          id: string
          is_active: boolean
          name: string
          steps: Json
          tags: string[]
          template_id: string
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
          version: number
        }
        Insert: {
          ai_model?: string
          asset_types?: string[]
          business_value?: string | null
          category: string
          created_at?: string | null
          description: string
          difficulty: string
          estimated_time: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          steps?: Json
          tags?: string[]
          template_id: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          ai_model?: string
          asset_types?: string[]
          business_value?: string | null
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          estimated_time?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          steps?: Json
          tags?: string[]
          template_id?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      asset_lifecycle_events: {
        Row: {
          ai_analysis_id: string | null
          ai_insights: Json | null
          asset_id: string
          cost: number | null
          created_at: string | null
          description: string | null
          documentation: Json | null
          embedding_vector: string | null
          event_date: string
          event_status: string
          event_type: string
          id: string
          is_automated: boolean | null
          location: Json | null
          metadata: Json | null
          performed_by: string | null
          severity: string | null
          user_id: string
          workflow_execution_id: string | null
        }
        Insert: {
          ai_analysis_id?: string | null
          ai_insights?: Json | null
          asset_id: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          documentation?: Json | null
          embedding_vector?: string | null
          event_date?: string
          event_status?: string
          event_type: string
          id?: string
          is_automated?: boolean | null
          location?: Json | null
          metadata?: Json | null
          performed_by?: string | null
          severity?: string | null
          user_id: string
          workflow_execution_id?: string | null
        }
        Update: {
          ai_analysis_id?: string | null
          ai_insights?: Json | null
          asset_id?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          documentation?: Json | null
          embedding_vector?: string | null
          event_date?: string
          event_status?: string
          event_type?: string
          id?: string
          is_automated?: boolean | null
          location?: Json | null
          metadata?: Json | null
          performed_by?: string | null
          severity?: string | null
          user_id?: string
          workflow_execution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_lifecycle_events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_tokens: {
        Row: {
          asset_id: string
          blockchain: string
          blockchain_network: string | null
          canton_domain: string | null
          canton_party_id: string | null
          circulating_supply: number | null
          contract_address: string
          created_at: string | null
          current_price: number | null
          id: string
          initial_price: number | null
          is_active: boolean | null
          metadata: Json | null
          status: string
          token_id: string
          token_metadata: Json | null
          token_name: string | null
          token_standard: string | null
          token_symbol: string | null
          token_type: string
          total_supply: number | null
          tx_hash: string
          updated_at: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          asset_id: string
          blockchain?: string
          blockchain_network?: string | null
          canton_domain?: string | null
          canton_party_id?: string | null
          circulating_supply?: number | null
          contract_address: string
          created_at?: string | null
          current_price?: number | null
          id?: string
          initial_price?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          status?: string
          token_id: string
          token_metadata?: Json | null
          token_name?: string | null
          token_standard?: string | null
          token_symbol?: string | null
          token_type: string
          total_supply?: number | null
          tx_hash: string
          updated_at?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          asset_id?: string
          blockchain?: string
          blockchain_network?: string | null
          canton_domain?: string | null
          canton_party_id?: string | null
          circulating_supply?: number | null
          contract_address?: string
          created_at?: string | null
          current_price?: number | null
          id?: string
          initial_price?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          status?: string
          token_id?: string
          token_metadata?: Json | null
          token_name?: string | null
          token_standard?: string | null
          token_symbol?: string | null
          token_type?: string
          total_supply?: number | null
          tx_hash?: string
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_tokens_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_workflow_executions: {
        Row: {
          agent_decisions: Json | null
          autonomous_mode: boolean | null
          created_at: string | null
          end_time: string | null
          error_message: string | null
          id: string
          learning_insights: Json | null
          performance_metrics: Json | null
          run_id: string
          start_time: string | null
          status: string
          trigger_id: string | null
          user_id: string
          workflow_id: string
        }
        Insert: {
          agent_decisions?: Json | null
          autonomous_mode?: boolean | null
          created_at?: string | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          learning_insights?: Json | null
          performance_metrics?: Json | null
          run_id: string
          start_time?: string | null
          status: string
          trigger_id?: string | null
          user_id: string
          workflow_id: string
        }
        Update: {
          agent_decisions?: Json | null
          autonomous_mode?: boolean | null
          created_at?: string | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          learning_insights?: Json | null
          performance_metrics?: Json | null
          run_id?: string
          start_time?: string | null
          status?: string
          trigger_id?: string | null
          user_id?: string
          workflow_id?: string
        }
        Relationships: []
      }
      asset_workflow_triggers: {
        Row: {
          active: boolean | null
          auto_execute: boolean | null
          conditions: Json
          created_at: string | null
          created_by_agent: string | null
          description: string | null
          id: string
          name: string
          requires_approval: boolean | null
          trigger_type: string
          updated_at: string | null
          user_id: string
          workflow_template_id: string
        }
        Insert: {
          active?: boolean | null
          auto_execute?: boolean | null
          conditions?: Json
          created_at?: string | null
          created_by_agent?: string | null
          description?: string | null
          id?: string
          name: string
          requires_approval?: boolean | null
          trigger_type: string
          updated_at?: string | null
          user_id: string
          workflow_template_id: string
        }
        Update: {
          active?: boolean | null
          auto_execute?: boolean | null
          conditions?: Json
          created_at?: string | null
          created_by_agent?: string | null
          description?: string | null
          id?: string
          name?: string
          requires_approval?: boolean | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
          workflow_template_id?: string
        }
        Relationships: []
      }
      asset_workflows: {
        Row: {
          ai_model: string | null
          asset_type: string | null
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          steps: Json
          trigger_config: Json
          trigger_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          asset_type?: string | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          steps: Json
          trigger_config: Json
          trigger_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_model?: string | null
          asset_type?: string | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          steps?: Json
          trigger_config?: Json
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          ai_agent_config: Json | null
          asset_id: string
          asset_type: string
          battery_level: number | null
          capabilities: Json | null
          category: string | null
          compliance_data: Json | null
          created_at: string | null
          current_location: Json | null
          current_task: Json | null
          current_value: number | null
          depreciation_rate: number | null
          description: string | null
          embedding_vector: string | null
          error_count: number | null
          esg_metrics: Json | null
          id: string
          iot_sensor_id: string | null
          last_maintenance_date: string | null
          location: Json | null
          location_id: string | null
          maintenance_schedule: Json | null
          metadata: Json | null
          name: string
          next_maintenance_date: string | null
          nfc_tag_id: string | null
          operational_status: string | null
          payload_capacity: number | null
          predictive_data: Json | null
          purchase_cost: number | null
          purchase_date: string | null
          qr_code: string | null
          risk_score: number | null
          sensors: string[] | null
          special_tools: string[] | null
          specifications: Json | null
          speed: number | null
          status: string
          task_progress: number | null
          task_queue: Json | null
          total_runtime_hours: number | null
          updated_at: string | null
          user_id: string
          workflow_settings: Json | null
        }
        Insert: {
          ai_agent_config?: Json | null
          asset_id: string
          asset_type: string
          battery_level?: number | null
          capabilities?: Json | null
          category?: string | null
          compliance_data?: Json | null
          created_at?: string | null
          current_location?: Json | null
          current_task?: Json | null
          current_value?: number | null
          depreciation_rate?: number | null
          description?: string | null
          embedding_vector?: string | null
          error_count?: number | null
          esg_metrics?: Json | null
          id?: string
          iot_sensor_id?: string | null
          last_maintenance_date?: string | null
          location?: Json | null
          location_id?: string | null
          maintenance_schedule?: Json | null
          metadata?: Json | null
          name: string
          next_maintenance_date?: string | null
          nfc_tag_id?: string | null
          operational_status?: string | null
          payload_capacity?: number | null
          predictive_data?: Json | null
          purchase_cost?: number | null
          purchase_date?: string | null
          qr_code?: string | null
          risk_score?: number | null
          sensors?: string[] | null
          special_tools?: string[] | null
          specifications?: Json | null
          speed?: number | null
          status?: string
          task_progress?: number | null
          task_queue?: Json | null
          total_runtime_hours?: number | null
          updated_at?: string | null
          user_id: string
          workflow_settings?: Json | null
        }
        Update: {
          ai_agent_config?: Json | null
          asset_id?: string
          asset_type?: string
          battery_level?: number | null
          capabilities?: Json | null
          category?: string | null
          compliance_data?: Json | null
          created_at?: string | null
          current_location?: Json | null
          current_task?: Json | null
          current_value?: number | null
          depreciation_rate?: number | null
          description?: string | null
          embedding_vector?: string | null
          error_count?: number | null
          esg_metrics?: Json | null
          id?: string
          iot_sensor_id?: string | null
          last_maintenance_date?: string | null
          location?: Json | null
          location_id?: string | null
          maintenance_schedule?: Json | null
          metadata?: Json | null
          name?: string
          next_maintenance_date?: string | null
          nfc_tag_id?: string | null
          operational_status?: string | null
          payload_capacity?: number | null
          predictive_data?: Json | null
          purchase_cost?: number | null
          purchase_date?: string | null
          qr_code?: string | null
          risk_score?: number | null
          sensors?: string[] | null
          special_tools?: string[] | null
          specifications?: Json | null
          speed?: number | null
          status?: string
          task_progress?: number | null
          task_queue?: Json | null
          total_runtime_hours?: number | null
          updated_at?: string | null
          user_id?: string
          workflow_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_iot_sensor_id_fkey"
            columns: ["iot_sensor_id"]
            isOneToOne: false
            referencedRelation: "iot_sensors"
            referencedColumns: ["sensor_id"]
          },
        ]
      }
      blockchain_connections: {
        Row: {
          api_key_encrypted: string | null
          blockchain_type: string
          connection_config: Json | null
          connection_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_used_at: string | null
          network: string
          rpc_endpoint: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          blockchain_type: string
          connection_config?: Json | null
          connection_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_used_at?: string | null
          network: string
          rpc_endpoint?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          blockchain_type?: string
          connection_config?: Json | null
          connection_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_used_at?: string | null
          network?: string
          rpc_endpoint?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_id: string | null
          author_name: string
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          reading_time: number | null
          slug: string
          status: string
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_avatar?: string | null
          author_id?: string | null
          author_name: string
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      business_cards: {
        Row: {
          created_at: string
          id: string
          name: string | null
          style: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          style?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          style?: Json | null
          updated_at?: string
          user_id?: string
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
      cloud_service_connections: {
        Row: {
          connection_status: string | null
          created_at: string | null
          credentials_encrypted: string | null
          id: string
          last_verified_at: string | null
          oauth_client_id: string | null
          service_config: Json
          service_name: string
          service_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_status?: string | null
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          last_verified_at?: string | null
          oauth_client_id?: string | null
          service_config?: Json
          service_name: string
          service_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_status?: string | null
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          last_verified_at?: string | null
          oauth_client_id?: string | null
          service_config?: Json
          service_name?: string
          service_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_service_connections_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "user_oauth_clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      consents: {
        Row: {
          consent_given: boolean
          consent_type: string
          id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          consent_given: boolean
          consent_type: string
          id?: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          consent_given?: boolean
          consent_type?: string
          id?: string
          timestamp?: string | null
          user_id?: string
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
          user_id: string
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
          user_id?: string
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
          user_id?: string
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
          user_id: string
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
          user_id?: string
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
          user_id?: string
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
          user_id: string
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
          user_id?: string
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
          user_id?: string
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
          user_id: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string | null
          data: Json
          external_id: string
          id?: string
          last_updated?: string | null
          record_type: string
          user_id?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string | null
          data?: Json
          external_id?: string
          id?: string
          last_updated?: string | null
          record_type?: string
          user_id?: string
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
          user_id: string
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
          user_id?: string
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
          user_id?: string
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
          dataset_id: string | null
          description: string | null
          embedding_model: string
          id: string
          metadata: Json | null
          name: string
          source_id: string | null
          source_type: string
          updated_at: string | null
          user_id: string
          vector_data: string | null
        }
        Insert: {
          created_at?: string | null
          dataset_id?: string | null
          description?: string | null
          embedding_model: string
          id?: string
          metadata?: Json | null
          name: string
          source_id?: string | null
          source_type: string
          updated_at?: string | null
          user_id?: string
          vector_data?: string | null
        }
        Update: {
          created_at?: string | null
          dataset_id?: string | null
          description?: string | null
          embedding_model?: string
          id?: string
          metadata?: Json | null
          name?: string
          source_id?: string | null
          source_type?: string
          updated_at?: string | null
          user_id?: string
          vector_data?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_embeddings_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "embedding_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      database_connections: {
        Row: {
          additional_params: Json | null
          connection_string: string | null
          connection_type: Database["public"]["Enums"]["database_connection_type"]
          created_at: string
          database_name: string | null
          description: string | null
          host: string | null
          id: string
          is_active: boolean
          last_test_error: string | null
          last_test_status:
            | Database["public"]["Enums"]["database_connection_status"]
            | null
          last_tested_at: string | null
          name: string
          password: string | null
          port: number | null
          ssl_mode: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          additional_params?: Json | null
          connection_string?: string | null
          connection_type: Database["public"]["Enums"]["database_connection_type"]
          created_at?: string
          database_name?: string | null
          description?: string | null
          host?: string | null
          id?: string
          is_active?: boolean
          last_test_error?: string | null
          last_test_status?:
            | Database["public"]["Enums"]["database_connection_status"]
            | null
          last_tested_at?: string | null
          name: string
          password?: string | null
          port?: number | null
          ssl_mode?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          additional_params?: Json | null
          connection_string?: string | null
          connection_type?: Database["public"]["Enums"]["database_connection_type"]
          created_at?: string
          database_name?: string | null
          description?: string | null
          host?: string | null
          id?: string
          is_active?: boolean
          last_test_error?: string | null
          last_test_status?:
            | Database["public"]["Enums"]["database_connection_status"]
            | null
          last_tested_at?: string | null
          name?: string
          password?: string | null
          port?: number | null
          ssl_mode?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      demo_inquiries: {
        Row: {
          asset_types_to_tokenize: string[] | null
          assigned_to: string | null
          blockchain_preference: string | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          inquiry_type: string
          ip_address: unknown
          last_reply_at: string | null
          message: string
          name: string
          phone: string | null
          priority: string | null
          referrer: string | null
          reply: string | null
          reply_count: number | null
          rwa_interests: string[] | null
          source: string | null
          stablecoin_interests: string[] | null
          status: string | null
          subject: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          asset_types_to_tokenize?: string[] | null
          assigned_to?: string | null
          blockchain_preference?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          inquiry_type?: string
          ip_address?: unknown
          last_reply_at?: string | null
          message: string
          name: string
          phone?: string | null
          priority?: string | null
          referrer?: string | null
          reply?: string | null
          reply_count?: number | null
          rwa_interests?: string[] | null
          source?: string | null
          stablecoin_interests?: string[] | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          asset_types_to_tokenize?: string[] | null
          assigned_to?: string | null
          blockchain_preference?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          inquiry_type?: string
          ip_address?: unknown
          last_reply_at?: string | null
          message?: string
          name?: string
          phone?: string | null
          priority?: string | null
          referrer?: string | null
          reply?: string | null
          reply_count?: number | null
          rwa_interests?: string[] | null
          source?: string | null
          stablecoin_interests?: string[] | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
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
          user_id: string
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
          user_id?: string
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
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          email_type: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          sender_email: string
          sent_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          sender_email?: string
          sent_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          sender_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_template: string
          id: string
          is_active: boolean | null
          name: string
          subject_template: string
          text_template: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          name: string
          subject_template: string
          text_template: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject_template?: string
          text_template?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      embedding_datasets: {
        Row: {
          created_at: string | null
          description: string | null
          embedding_count: number | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          embedding_count?: number | null
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          embedding_count?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      embedding_files: {
        Row: {
          created_at: string | null
          embedding_id: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          embedding_id?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          embedding_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "embedding_files_embedding_id_fkey"
            columns: ["embedding_id"]
            isOneToOne: false
            referencedRelation: "data_embeddings"
            referencedColumns: ["id"]
          },
        ]
      }
      embedding_jobs: {
        Row: {
          created_at: string | null
          embedding_id: string | null
          error: string | null
          estimated_completion_time: string | null
          file_ids: Json | null
          id: string
          job_type: string
          max_retries: number | null
          parameters: Json
          priority: number | null
          processing_completed_at: string | null
          processing_started_at: string | null
          progress: number | null
          result: Json | null
          retry_count: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          embedding_id?: string | null
          error?: string | null
          estimated_completion_time?: string | null
          file_ids?: Json | null
          id?: string
          job_type: string
          max_retries?: number | null
          parameters?: Json
          priority?: number | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          progress?: number | null
          result?: Json | null
          retry_count?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          embedding_id?: string | null
          error?: string | null
          estimated_completion_time?: string | null
          file_ids?: Json | null
          id?: string
          job_type?: string
          max_retries?: number | null
          parameters?: Json
          priority?: number | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          progress?: number | null
          result?: Json | null
          retry_count?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "embedding_jobs_embedding_id_fkey"
            columns: ["embedding_id"]
            isOneToOne: false
            referencedRelation: "data_embeddings"
            referencedColumns: ["id"]
          },
        ]
      }
      embedding_usage: {
        Row: {
          agent_id: string | null
          created_at: string | null
          embedding_id: string
          id: string
          query: string | null
          similarity_score: number | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          embedding_id: string
          id?: string
          query?: string | null
          similarity_score?: number | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          embedding_id?: string
          id?: string
          query?: string | null
          similarity_score?: number | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "embedding_usage_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embedding_usage_embedding_id_fkey"
            columns: ["embedding_id"]
            isOneToOne: false
            referencedRelation: "data_embeddings"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          created_at: string
          entity_type: string
          id: string
          last_seen: string | null
          metadata: Json | null
          name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      entity_capabilities: {
        Row: {
          capability: string
          created_at: string
          entity_id: string
          id: string
        }
        Insert: {
          capability: string
          created_at?: string
          entity_id: string
          id?: string
        }
        Update: {
          capability?: string
          created_at?: string
          entity_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_capabilities_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_comm_keys: {
        Row: {
          created_at: string
          entity_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_id: string
          public_key_data: string
          public_key_format: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_id: string
          public_key_data: string
          public_key_format?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_id?: string
          public_key_data?: string
          public_key_format?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_comm_keys_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_public_wallets: {
        Row: {
          address: string
          created_at: string
          entity_id: string
          id: string
          network_id: string
        }
        Insert: {
          address: string
          created_at?: string
          entity_id: string
          id?: string
          network_id: string
        }
        Update: {
          address?: string
          created_at?: string
          entity_id?: string
          id?: string
          network_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_public_wallets_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_web3_capabilities: {
        Row: {
          access_role: string
          capability_type: string
          created_at: string
          entity_id: string
          id: string
          protocol_or_network_id: string
          protocol_type: string | null
        }
        Insert: {
          access_role: string
          capability_type: string
          created_at?: string
          entity_id: string
          id?: string
          protocol_or_network_id: string
          protocol_type?: string | null
        }
        Update: {
          access_role?: string
          capability_type?: string
          created_at?: string
          entity_id?: string
          id?: string
          protocol_or_network_id?: string
          protocol_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_web3_capabilities_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      external_integrations: {
        Row: {
          created_at: string
          encrypted_access_token: string
          encrypted_refresh_token: string | null
          id: string
          last_sync_at: string | null
          provider: string
          provider_shop_id: string | null
          provider_site_id: string | null
          scopes: string[] | null
          status: string
          sync_error_message: string | null
          sync_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_access_token: string
          encrypted_refresh_token?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          provider_shop_id?: string | null
          provider_site_id?: string | null
          scopes?: string[] | null
          status?: string
          sync_error_message?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_access_token?: string
          encrypted_refresh_token?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          provider_shop_id?: string | null
          provider_site_id?: string | null
          scopes?: string[] | null
          status?: string
          sync_error_message?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_reports: {
        Row: {
          attachments: Json | null
          browser_info: Json | null
          created_at: string | null
          description: string
          id: string
          page_url: string | null
          priority: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          browser_info?: Json | null
          created_at?: string | null
          description: string
          id?: string
          page_url?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          browser_info?: Json | null
          created_at?: string | null
          description?: string
          id?: string
          page_url?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fractional_ownerships: {
        Row: {
          created_at: string | null
          fraction_count: number
          id: string
          ownership_percentage: number
          pool_id: string
          purchase_price: number
          tx_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fraction_count: number
          id?: string
          ownership_percentage: number
          pool_id: string
          purchase_price: number
          tx_hash: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          fraction_count?: number
          id?: string
          ownership_percentage?: number
          pool_id?: string
          purchase_price?: number
          tx_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fractional_ownerships_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "fractionalization_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      fractionalization_pools: {
        Row: {
          accredited_only: boolean | null
          asset_token_id: string
          available_fractions: number
          created_at: string | null
          id: string
          is_active: boolean | null
          jurisdiction_restrictions: string[] | null
          kyc_required: boolean | null
          management_fee_bps: number | null
          participant_count: number | null
          performance_fee_bps: number | null
          pool_id: string
          pool_name: string | null
          pool_type: string | null
          price_per_fraction: number
          status: string
          total_fractions: number
          total_value_locked: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accredited_only?: boolean | null
          asset_token_id: string
          available_fractions: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction_restrictions?: string[] | null
          kyc_required?: boolean | null
          management_fee_bps?: number | null
          participant_count?: number | null
          performance_fee_bps?: number | null
          pool_id: string
          pool_name?: string | null
          pool_type?: string | null
          price_per_fraction: number
          status?: string
          total_fractions: number
          total_value_locked?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accredited_only?: boolean | null
          asset_token_id?: string
          available_fractions?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction_restrictions?: string[] | null
          kyc_required?: boolean | null
          management_fee_bps?: number | null
          participant_count?: number | null
          performance_fee_bps?: number | null
          pool_id?: string
          pool_name?: string | null
          pool_type?: string | null
          price_per_fraction?: number
          status?: string
          total_fractions?: number
          total_value_locked?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fractionalization_pools_asset_token_id_fkey"
            columns: ["asset_token_id"]
            isOneToOne: false
            referencedRelation: "asset_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_benchmarks: {
        Row: {
          automation_potential: number
          avg_roi: number
          challenges: string[]
          created_at: string | null
          id: string
          implementation_time: number
          industry: string
          top_use_cases: string[]
          updated_at: string | null
        }
        Insert: {
          automation_potential: number
          avg_roi: number
          challenges: string[]
          created_at?: string | null
          id?: string
          implementation_time: number
          industry: string
          top_use_cases: string[]
          updated_at?: string | null
        }
        Update: {
          automation_potential?: number
          avg_roi?: number
          challenges?: string[]
          created_at?: string | null
          id?: string
          implementation_time?: number
          industry?: string
          top_use_cases?: string[]
          updated_at?: string | null
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
      investor_inquiries: {
        Row: {
          check_size: string | null
          created_at: string | null
          email: string
          firm: string
          id: string
          investor_type: string | null
          message: string | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          check_size?: string | null
          created_at?: string | null
          email: string
          firm: string
          id?: string
          investor_type?: string | null
          message?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          check_size?: string | null
          created_at?: string | null
          email?: string
          firm?: string
          id?: string
          investor_type?: string | null
          message?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      iot_sensor_data: {
        Row: {
          asset_id: string | null
          battery_level: number | null
          created_at: string | null
          humidity: number | null
          id: string
          iot_sensor_id: string
          location: Json | null
          metadata: Json | null
          nfc_tag_id: string | null
          temperature: number | null
          timestamp: string | null
        }
        Insert: {
          asset_id?: string | null
          battery_level?: number | null
          created_at?: string | null
          humidity?: number | null
          id?: string
          iot_sensor_id: string
          location?: Json | null
          metadata?: Json | null
          nfc_tag_id?: string | null
          temperature?: number | null
          timestamp?: string | null
        }
        Update: {
          asset_id?: string | null
          battery_level?: number | null
          created_at?: string | null
          humidity?: number | null
          id?: string
          iot_sensor_id?: string
          location?: Json | null
          metadata?: Json | null
          nfc_tag_id?: string | null
          temperature?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensor_data_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_sensors: {
        Row: {
          battery_level: number | null
          created_at: string | null
          device_type: string
          id: string
          last_reading: string | null
          location_data: Json | null
          metadata: Json | null
          sensor_id: string
          sensor_readings: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string | null
          device_type: string
          id?: string
          last_reading?: string | null
          location_data?: Json | null
          metadata?: Json | null
          sensor_id: string
          sensor_readings?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string | null
          device_type?: string
          id?: string
          last_reading?: string | null
          location_data?: Json | null
          metadata?: Json | null
          sensor_id?: string
          sensor_readings?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kronova_a2a_settings: {
        Row: {
          aethernet_connection_id: string | null
          allowed_remote_agents: string[] | null
          blocked_remote_agents: string[] | null
          created_at: string | null
          default_agent_card_id: string | null
          enable_a2a_discovery: boolean | null
          enable_aethernet_bridge: boolean | null
          enable_canton_tokenization: boolean | null
          enable_voice_a2a: boolean | null
          id: string
          max_messages_per_task: number | null
          max_tasks_per_minute: number | null
          require_mutual_auth: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aethernet_connection_id?: string | null
          allowed_remote_agents?: string[] | null
          blocked_remote_agents?: string[] | null
          created_at?: string | null
          default_agent_card_id?: string | null
          enable_a2a_discovery?: boolean | null
          enable_aethernet_bridge?: boolean | null
          enable_canton_tokenization?: boolean | null
          enable_voice_a2a?: boolean | null
          id?: string
          max_messages_per_task?: number | null
          max_tasks_per_minute?: number | null
          require_mutual_auth?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aethernet_connection_id?: string | null
          allowed_remote_agents?: string[] | null
          blocked_remote_agents?: string[] | null
          created_at?: string | null
          default_agent_card_id?: string | null
          enable_a2a_discovery?: boolean | null
          enable_aethernet_bridge?: boolean | null
          enable_canton_tokenization?: boolean | null
          enable_voice_a2a?: boolean | null
          id?: string
          max_messages_per_task?: number | null
          max_tasks_per_minute?: number | null
          require_mutual_auth?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kronova_a2a_settings_aethernet_connection_id_fkey"
            columns: ["aethernet_connection_id"]
            isOneToOne: false
            referencedRelation: "aethernet_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kronova_a2a_settings_default_agent_card_id_fkey"
            columns: ["default_agent_card_id"]
            isOneToOne: false
            referencedRelation: "a2a_agent_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_server_connections: {
        Row: {
          capabilities: Json | null
          connection_status: string | null
          created_at: string | null
          id: string
          last_connected_at: string | null
          metadata: Json | null
          oauth_client_id: string | null
          server_name: string
          server_type: string | null
          server_url: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capabilities?: Json | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          last_connected_at?: string | null
          metadata?: Json | null
          oauth_client_id?: string | null
          server_name: string
          server_type?: string | null
          server_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capabilities?: Json | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          last_connected_at?: string | null
          metadata?: Json | null
          oauth_client_id?: string | null
          server_name?: string
          server_type?: string | null
          server_url?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcp_server_connections_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "user_oauth_clients"
            referencedColumns: ["client_id"]
          },
        ]
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
          user_id?: string
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
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: unknown
          referrer: string | null
          source: string | null
          status: string | null
          subscribed_at: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      nfts: {
        Row: {
          card_id: string
          created_at: string
          id: string
          name: string | null
          token_id: string | null
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          name?: string | null
          token_id?: string | null
          tx_hash?: string | null
          user_id?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          name?: string | null
          token_id?: string | null
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ntg_freight_integrations: {
        Row: {
          aethernet_connection_id: string | null
          created_at: string | null
          eld_integration_enabled: boolean | null
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean | null
          ntg_account_id: string | null
          ntg_api_key_encrypted: string | null
          otr_factoring_enabled: boolean | null
          otr_fuel_card_enabled: boolean | null
          status: string
          telematics_provider: string | null
          updated_at: string | null
          user_id: string
          voice_agent_enabled: boolean | null
          voice_agent_id: string | null
        }
        Insert: {
          aethernet_connection_id?: string | null
          created_at?: string | null
          eld_integration_enabled?: boolean | null
          id?: string
          integration_name: string
          integration_type: string
          is_active?: boolean | null
          ntg_account_id?: string | null
          ntg_api_key_encrypted?: string | null
          otr_factoring_enabled?: boolean | null
          otr_fuel_card_enabled?: boolean | null
          status?: string
          telematics_provider?: string | null
          updated_at?: string | null
          user_id: string
          voice_agent_enabled?: boolean | null
          voice_agent_id?: string | null
        }
        Update: {
          aethernet_connection_id?: string | null
          created_at?: string | null
          eld_integration_enabled?: boolean | null
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean | null
          ntg_account_id?: string | null
          ntg_api_key_encrypted?: string | null
          otr_factoring_enabled?: boolean | null
          otr_fuel_card_enabled?: boolean | null
          status?: string
          telematics_provider?: string | null
          updated_at?: string | null
          user_id?: string
          voice_agent_enabled?: boolean | null
          voice_agent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ntg_freight_aethernet_fkey"
            columns: ["aethernet_connection_id"]
            isOneToOne: false
            referencedRelation: "aethernet_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ntg_freight_voice_agent_fkey"
            columns: ["voice_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_auth_requests: {
        Row: {
          client_id: string
          code_challenge: string | null
          code_challenge_method: string | null
          created_at: string | null
          expires_at: string
          id: string
          redirect_uri: string
          scope: string | null
          state: string | null
          user_id: string | null
        }
        Insert: {
          client_id: string
          code_challenge?: string | null
          code_challenge_method?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          redirect_uri: string
          scope?: string | null
          state?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string
          code_challenge?: string | null
          code_challenge_method?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          redirect_uri?: string
          scope?: string | null
          state?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          introductory_period_end: string | null
          is_introductory_pricing: boolean | null
          organization_id: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          introductory_period_end?: string | null
          is_introductory_pricing?: boolean | null
          organization_id?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          introductory_period_end?: string | null
          is_introductory_pricing?: boolean | null
          organization_id?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          company_size: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          name: string
          slug: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging_order_items: {
        Row: {
          created_at: string | null
          dimensions: Json | null
          has_iot_sensors: boolean | null
          id: string
          iot_sensor_count: number | null
          material_type: string
          order_id: string
          package_type: string
          quantity: number
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          dimensions?: Json | null
          has_iot_sensors?: boolean | null
          id?: string
          iot_sensor_count?: number | null
          material_type: string
          order_id: string
          package_type: string
          quantity: number
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          dimensions?: Json | null
          has_iot_sensors?: boolean | null
          id?: string
          iot_sensor_count?: number | null
          material_type?: string
          order_id?: string
          package_type?: string
          quantity?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packaging_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "packaging_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging_orders: {
        Row: {
          created_at: string | null
          design_data: Json | null
          design_files: Json[] | null
          dimensions: Json | null
          has_iot_sensors: boolean | null
          id: string
          iot_sensor_count: number | null
          material_type: string
          order_type: string
          profile_id: string | null
          quantity: number
          special_instructions: string | null
          status: string
          total_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          design_data?: Json | null
          design_files?: Json[] | null
          dimensions?: Json | null
          has_iot_sensors?: boolean | null
          id?: string
          iot_sensor_count?: number | null
          material_type: string
          order_type: string
          profile_id?: string | null
          quantity: number
          special_instructions?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          design_data?: Json | null
          design_files?: Json[] | null
          dimensions?: Json | null
          has_iot_sensors?: boolean | null
          id?: string
          iot_sensor_count?: number | null
          material_type?: string
          order_type?: string
          profile_id?: string | null
          quantity?: number
          special_instructions?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packaging_orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      plaid_accounts: {
        Row: {
          account_subtype: string | null
          account_type: string
          available_balance: number | null
          created_at: string | null
          credit_limit: number | null
          currency_code: string | null
          current_balance: number | null
          id: string
          institution_id: string | null
          institution_name: string | null
          is_imported_as_asset: boolean | null
          item_id: string
          last_synced_at: string | null
          linked_asset_id: string | null
          mask: string | null
          name: string
          official_name: string | null
          plaid_account_id: string
          plaid_connection_id: string
          plaid_metadata: Json | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_subtype?: string | null
          account_type: string
          available_balance?: number | null
          created_at?: string | null
          credit_limit?: number | null
          currency_code?: string | null
          current_balance?: number | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          is_imported_as_asset?: boolean | null
          item_id: string
          last_synced_at?: string | null
          linked_asset_id?: string | null
          mask?: string | null
          name: string
          official_name?: string | null
          plaid_account_id: string
          plaid_connection_id: string
          plaid_metadata?: Json | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_subtype?: string | null
          account_type?: string
          available_balance?: number | null
          created_at?: string | null
          credit_limit?: number | null
          currency_code?: string | null
          current_balance?: number | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          is_imported_as_asset?: boolean | null
          item_id?: string
          last_synced_at?: string | null
          linked_asset_id?: string | null
          mask?: string | null
          name?: string
          official_name?: string | null
          plaid_account_id?: string
          plaid_connection_id?: string
          plaid_metadata?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plaid_accounts_linked_asset_id_fkey"
            columns: ["linked_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plaid_accounts_plaid_connection_id_fkey"
            columns: ["plaid_connection_id"]
            isOneToOne: false
            referencedRelation: "plaid_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      plaid_connections: {
        Row: {
          access_token: string
          created_at: string | null
          error_message: string | null
          id: string
          institution_id: string | null
          institution_name: string | null
          item_id: string
          last_synced_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          item_id: string
          last_synced_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          item_id?: string
          last_synced_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prices: {
        Row: {
          active: boolean | null
          aggregate_usage: string | null
          billing_scheme: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          interval: string | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          product_name: string | null
          statement_descriptor: string | null
          tax_behavior: string | null
          tax_code: string | null
          trial_period_days: number | null
          type: string | null
          unit_amount: number | null
          usage_type: string | null
        }
        Insert: {
          active?: boolean | null
          aggregate_usage?: string | null
          billing_scheme?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: string | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          product_name?: string | null
          statement_descriptor?: string | null
          tax_behavior?: string | null
          tax_code?: string | null
          trial_period_days?: number | null
          type?: string | null
          unit_amount?: number | null
          usage_type?: string | null
        }
        Update: {
          active?: boolean | null
          aggregate_usage?: string | null
          billing_scheme?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: string | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          product_name?: string | null
          statement_descriptor?: string | null
          tax_behavior?: string | null
          tax_code?: string | null
          trial_period_days?: number | null
          type?: string | null
          unit_amount?: number | null
          usage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      private_stablecoins: {
        Row: {
          audit_frequency: string | null
          backing_ratio: number | null
          backing_type: string
          blockchain_network: string | null
          canton_contract_id: string | null
          collateral_ratio: number
          compliance_framework: string | null
          config: Json
          contract_address: string | null
          created_at: string
          decimals: number
          id: string
          is_active: boolean | null
          issuer_party_id: string | null
          last_audit_at: string | null
          max_supply: number | null
          name: string
          organization_id: string | null
          regulator_approved: boolean | null
          reserve_asset: string | null
          reserve_custodian: string | null
          status: string
          symbol: string
          total_supply: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audit_frequency?: string | null
          backing_ratio?: number | null
          backing_type: string
          blockchain_network?: string | null
          canton_contract_id?: string | null
          collateral_ratio?: number
          compliance_framework?: string | null
          config?: Json
          contract_address?: string | null
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean | null
          issuer_party_id?: string | null
          last_audit_at?: string | null
          max_supply?: number | null
          name: string
          organization_id?: string | null
          regulator_approved?: boolean | null
          reserve_asset?: string | null
          reserve_custodian?: string | null
          status?: string
          symbol: string
          total_supply?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audit_frequency?: string | null
          backing_ratio?: number | null
          backing_type?: string
          blockchain_network?: string | null
          canton_contract_id?: string | null
          collateral_ratio?: number
          compliance_framework?: string | null
          config?: Json
          contract_address?: string | null
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean | null
          issuer_party_id?: string | null
          last_audit_at?: string | null
          max_supply?: number | null
          name?: string
          organization_id?: string | null
          regulator_approved?: boolean | null
          reserve_asset?: string | null
          reserve_custodian?: string | null
          status?: string
          symbol?: string
          total_supply?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_stablecoins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          card_style: Json | null
          company: string | null
          company_logo_url: string | null
          created_at: string | null
          email: string | null
          email_preferences: Json | null
          email_verified: boolean | null
          email_verified_at: string | null
          full_name: string | null
          id: string
          job_title: string | null
          linkedin_url: string | null
          public_access: boolean
          public_id: string | null
          role: Database["public"]["Enums"]["app_role_enum"] | null
          stripe_customer_id: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          waddress: string | null
          website: string | null
          xhandle: string | null
        }
        Insert: {
          avatar_url?: string | null
          card_style?: Json | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          email?: string | null
          email_preferences?: Json | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          public_access?: boolean
          public_id?: string | null
          role?: Database["public"]["Enums"]["app_role_enum"] | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          waddress?: string | null
          website?: string | null
          xhandle?: string | null
        }
        Update: {
          avatar_url?: string | null
          card_style?: Json | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          email?: string | null
          email_preferences?: Json | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          public_access?: boolean
          public_id?: string | null
          role?: Database["public"]["Enums"]["app_role_enum"] | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          current_shipment_id: string | null
          description: string | null
          dimensions: Json
          expected_lifetime: number | null
          id: string
          iot_data: Json | null
          iot_enabled: boolean
          iot_sensor_id: string | null
          last_used: string | null
          location_id: string | null
          material: string | null
          metadata: Json | null
          name: string
          nfc_tag_id: string | null
          order_id: string | null
          package_id: string
          purchase_date: string | null
          reuse_count: number | null
          shipment_history: string[] | null
          status: string | null
          updated_at: string | null
          weight_capacity: number
        }
        Insert: {
          created_at?: string | null
          current_shipment_id?: string | null
          description?: string | null
          dimensions: Json
          expected_lifetime?: number | null
          id?: string
          iot_data?: Json | null
          iot_enabled?: boolean
          iot_sensor_id?: string | null
          last_used?: string | null
          location_id?: string | null
          material?: string | null
          metadata?: Json | null
          name: string
          nfc_tag_id?: string | null
          order_id?: string | null
          package_id: string
          purchase_date?: string | null
          reuse_count?: number | null
          shipment_history?: string[] | null
          status?: string | null
          updated_at?: string | null
          weight_capacity: number
        }
        Update: {
          created_at?: string | null
          current_shipment_id?: string | null
          description?: string | null
          dimensions?: Json
          expected_lifetime?: number | null
          id?: string
          iot_data?: Json | null
          iot_enabled?: boolean
          iot_sensor_id?: string | null
          last_used?: string | null
          location_id?: string | null
          material?: string | null
          metadata?: Json | null
          name?: string
          nfc_tag_id?: string | null
          order_id?: string | null
          package_id?: string
          purchase_date?: string | null
          reuse_count?: number | null
          shipment_history?: string[] | null
          status?: string | null
          updated_at?: string | null
          weight_capacity?: number
        }
        Relationships: [
          {
            foreignKeyName: "reusable_packages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "packaging_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      roi_calc_comparable_plans: {
        Row: {
          active: boolean | null
          brand: string | null
          created_at: string | null
          custom_pricing: boolean | null
          features: string[]
          id: string
          is_introductory: boolean | null
          is_kronova_plan: boolean | null
          is_resend_it_plan: boolean | null
          limits: Json
          monthly_price: number | null
          monthly_standard_price: number | null
          name: string
          pay_as_you_go: boolean | null
          plan_id: string
          provider: string
          recommended: boolean | null
          supported_model_ids: string[] | null
          updated_at: string | null
          yearly_price: number | null
          yearly_standard_price: number | null
        }
        Insert: {
          active?: boolean | null
          brand?: string | null
          created_at?: string | null
          custom_pricing?: boolean | null
          features: string[]
          id?: string
          is_introductory?: boolean | null
          is_kronova_plan?: boolean | null
          is_resend_it_plan?: boolean | null
          limits: Json
          monthly_price?: number | null
          monthly_standard_price?: number | null
          name: string
          pay_as_you_go?: boolean | null
          plan_id: string
          provider: string
          recommended?: boolean | null
          supported_model_ids?: string[] | null
          updated_at?: string | null
          yearly_price?: number | null
          yearly_standard_price?: number | null
        }
        Update: {
          active?: boolean | null
          brand?: string | null
          created_at?: string | null
          custom_pricing?: boolean | null
          features?: string[]
          id?: string
          is_introductory?: boolean | null
          is_kronova_plan?: boolean | null
          is_resend_it_plan?: boolean | null
          limits?: Json
          monthly_price?: number | null
          monthly_standard_price?: number | null
          name?: string
          pay_as_you_go?: boolean | null
          plan_id?: string
          provider?: string
          recommended?: boolean | null
          supported_model_ids?: string[] | null
          updated_at?: string | null
          yearly_price?: number | null
          yearly_standard_price?: number | null
        }
        Relationships: []
      }
      roi_calc_plan_models: {
        Row: {
          created_at: string | null
          id: string
          included_in_plan: boolean | null
          model_id: string
          plan_id: string
          updated_at: string | null
          usage_limit_tokens_per_month: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          included_in_plan?: boolean | null
          model_id: string
          plan_id: string
          updated_at?: string | null
          usage_limit_tokens_per_month?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          included_in_plan?: boolean | null
          model_id?: string
          plan_id?: string
          updated_at?: string | null
          usage_limit_tokens_per_month?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roi_calc_plan_models_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "roi_calc_comparable_plans"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      roi_calculations: {
        Row: {
          avg_process_time_hours: number
          avg_salary: number
          company_size: string
          competitive_pressure: string | null
          compliance_requirements: boolean | null
          created_at: string | null
          current_ai_tools_count: number | null
          current_automation_level: string | null
          current_customer_satisfaction: number | null
          current_monthly_ai_spend: number | null
          data_preparation_costs: number | null
          data_quality_score: number | null
          employees: number
          error_rate_percentage: number | null
          id: string
          industry: string
          innovation_priority: string | null
          integration_complexity: string | null
          maintenance_costs: number | null
          process_frequency_per_month: number
          processes_to_automate: number
          results: Json
          selected_plan_id: string
          target_customer_satisfaction: number | null
          team_ai_readiness: string | null
          time_to_market_days: number | null
          training_costs: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avg_process_time_hours: number
          avg_salary: number
          company_size: string
          competitive_pressure?: string | null
          compliance_requirements?: boolean | null
          created_at?: string | null
          current_ai_tools_count?: number | null
          current_automation_level?: string | null
          current_customer_satisfaction?: number | null
          current_monthly_ai_spend?: number | null
          data_preparation_costs?: number | null
          data_quality_score?: number | null
          employees: number
          error_rate_percentage?: number | null
          id?: string
          industry: string
          innovation_priority?: string | null
          integration_complexity?: string | null
          maintenance_costs?: number | null
          process_frequency_per_month: number
          processes_to_automate: number
          results: Json
          selected_plan_id: string
          target_customer_satisfaction?: number | null
          team_ai_readiness?: string | null
          time_to_market_days?: number | null
          training_costs?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avg_process_time_hours?: number
          avg_salary?: number
          company_size?: string
          competitive_pressure?: string | null
          compliance_requirements?: boolean | null
          created_at?: string | null
          current_ai_tools_count?: number | null
          current_automation_level?: string | null
          current_customer_satisfaction?: number | null
          current_monthly_ai_spend?: number | null
          data_preparation_costs?: number | null
          data_quality_score?: number | null
          employees?: number
          error_rate_percentage?: number | null
          id?: string
          industry?: string
          innovation_priority?: string | null
          integration_complexity?: string | null
          maintenance_costs?: number | null
          process_frequency_per_month?: number
          processes_to_automate?: number
          results?: Json
          selected_plan_id?: string
          target_customer_satisfaction?: number | null
          team_ai_readiness?: string | null
          time_to_market_days?: number | null
          training_costs?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      roi_public_assessments: {
        Row: {
          adoption_risk: number
          ai_maturity_score: number
          annual_savings: number
          assessment_reference: string
          avg_salary: number
          change_readiness_score: number
          cloud_readiness_score: number
          company_name: string | null
          company_size: string
          competitive_pressure_score: number
          compliance_costs: number
          consent_follow_up: boolean | null
          consent_marketing: boolean | null
          created_at: string | null
          current_annual_cost: number
          data_preparation_costs: number | null
          data_quality_risk: number
          data_quality_score: number
          email: string | null
          employees: number
          error_rate_percentage: number
          error_reduction: number
          executive_support_score: number
          five_year_value: number
          hidden_cost_reduction: number
          id: string
          implementation_risk: number
          industry: string
          integration_complexity: number
          ip_address: unknown
          is_demo: boolean | null
          kronova_annual_cost: number
          last_pdf_generated_at: string | null
          legacy_system_age_years: number
          maintenance_costs: number | null
          manual_hours_per_week: number
          operational_savings: number
          payback_months: number
          pdf_generated_count: number | null
          productivity_gain: number
          quality_savings: number
          roi_percentage: number
          security_costs: number | null
          selected_plan: string
          source: string | null
          strategic_value: number
          system_downtime_percentage: number
          three_year_savings: number
          time_to_value_months: number
          training_costs: number | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          adoption_risk: number
          ai_maturity_score: number
          annual_savings: number
          assessment_reference: string
          avg_salary: number
          change_readiness_score: number
          cloud_readiness_score: number
          company_name?: string | null
          company_size: string
          competitive_pressure_score: number
          compliance_costs: number
          consent_follow_up?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string | null
          current_annual_cost: number
          data_preparation_costs?: number | null
          data_quality_risk: number
          data_quality_score: number
          email?: string | null
          employees: number
          error_rate_percentage: number
          error_reduction: number
          executive_support_score: number
          five_year_value: number
          hidden_cost_reduction: number
          id?: string
          implementation_risk: number
          industry: string
          integration_complexity: number
          ip_address?: unknown
          is_demo?: boolean | null
          kronova_annual_cost: number
          last_pdf_generated_at?: string | null
          legacy_system_age_years: number
          maintenance_costs?: number | null
          manual_hours_per_week: number
          operational_savings: number
          payback_months: number
          pdf_generated_count?: number | null
          productivity_gain: number
          quality_savings: number
          roi_percentage: number
          security_costs?: number | null
          selected_plan: string
          source?: string | null
          strategic_value: number
          system_downtime_percentage: number
          three_year_savings: number
          time_to_value_months: number
          training_costs?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          adoption_risk?: number
          ai_maturity_score?: number
          annual_savings?: number
          assessment_reference?: string
          avg_salary?: number
          change_readiness_score?: number
          cloud_readiness_score?: number
          company_name?: string | null
          company_size?: string
          competitive_pressure_score?: number
          compliance_costs?: number
          consent_follow_up?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string | null
          current_annual_cost?: number
          data_preparation_costs?: number | null
          data_quality_risk?: number
          data_quality_score?: number
          email?: string | null
          employees?: number
          error_rate_percentage?: number
          error_reduction?: number
          executive_support_score?: number
          five_year_value?: number
          hidden_cost_reduction?: number
          id?: string
          implementation_risk?: number
          industry?: string
          integration_complexity?: number
          ip_address?: unknown
          is_demo?: boolean | null
          kronova_annual_cost?: number
          last_pdf_generated_at?: string | null
          legacy_system_age_years?: number
          maintenance_costs?: number | null
          manual_hours_per_week?: number
          operational_savings?: number
          payback_months?: number
          pdf_generated_count?: number | null
          productivity_gain?: number
          quality_savings?: number
          roi_percentage?: number
          security_costs?: number | null
          selected_plan?: string
          source?: string | null
          strategic_value?: number
          system_downtime_percentage?: number
          three_year_savings?: number
          time_to_value_months?: number
          training_costs?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      shipping: {
        Row: {
          actual_delivery: string | null
          carrier: string | null
          carrier_api_response: Json | null
          cost: number | null
          created_at: string | null
          current_location: Json | null
          destination_address: Json
          dimensions: Json | null
          estimated_delivery: string | null
          id: string
          iot_data: Json | null
          iot_sensor_id: string | null
          label_image_base64: string | null
          last_updated: string | null
          metadata: Json | null
          origin_address: Json
          package_ids: Json | null
          public_id: string | null
          shipping_date: string | null
          status: string | null
          tracking_number: string
          transit_events: Json[] | null
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          actual_delivery?: string | null
          carrier?: string | null
          carrier_api_response?: Json | null
          cost?: number | null
          created_at?: string | null
          current_location?: Json | null
          destination_address: Json
          dimensions?: Json | null
          estimated_delivery?: string | null
          id?: string
          iot_data?: Json | null
          iot_sensor_id?: string | null
          label_image_base64?: string | null
          last_updated?: string | null
          metadata?: Json | null
          origin_address: Json
          package_ids?: Json | null
          public_id?: string | null
          shipping_date?: string | null
          status?: string | null
          tracking_number: string
          transit_events?: Json[] | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Update: {
          actual_delivery?: string | null
          carrier?: string | null
          carrier_api_response?: Json | null
          cost?: number | null
          created_at?: string | null
          current_location?: Json | null
          destination_address?: Json
          dimensions?: Json | null
          estimated_delivery?: string | null
          id?: string
          iot_data?: Json | null
          iot_sensor_id?: string | null
          label_image_base64?: string | null
          last_updated?: string | null
          metadata?: Json | null
          origin_address?: Json
          package_ids?: Json | null
          public_id?: string | null
          shipping_date?: string | null
          status?: string | null
          tracking_number?: string
          transit_events?: Json[] | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      stablecoin_holders: {
        Row: {
          address: string
          balance: string
          blacklisted: boolean
          created_at: string
          frozen: boolean
          id: string
          kyc_status: string
          party_id: string
          stablecoin_id: string
          updated_at: string
          user_id: string | null
          whitelisted: boolean
        }
        Insert: {
          address: string
          balance?: string
          blacklisted?: boolean
          created_at?: string
          frozen?: boolean
          id?: string
          kyc_status?: string
          party_id: string
          stablecoin_id: string
          updated_at?: string
          user_id?: string | null
          whitelisted?: boolean
        }
        Update: {
          address?: string
          balance?: string
          blacklisted?: boolean
          created_at?: string
          frozen?: boolean
          id?: string
          kyc_status?: string
          party_id?: string
          stablecoin_id?: string
          updated_at?: string
          user_id?: string | null
          whitelisted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "stablecoin_holders_stablecoin_id_fkey"
            columns: ["stablecoin_id"]
            isOneToOne: false
            referencedRelation: "private_stablecoins"
            referencedColumns: ["id"]
          },
        ]
      }
      stablecoin_operations: {
        Row: {
          amount: string | null
          canton_transaction_id: string | null
          created_at: string
          error_message: string | null
          id: string
          operation_type: string
          reason: string | null
          stablecoin_id: string
          status: string
          target_address: string | null
        }
        Insert: {
          amount?: string | null
          canton_transaction_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          operation_type: string
          reason?: string | null
          stablecoin_id: string
          status?: string
          target_address?: string | null
        }
        Update: {
          amount?: string | null
          canton_transaction_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          operation_type?: string
          reason?: string | null
          stablecoin_id?: string
          status?: string
          target_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stablecoin_operations_stablecoin_id_fkey"
            columns: ["stablecoin_id"]
            isOneToOne: false
            referencedRelation: "private_stablecoins"
            referencedColumns: ["id"]
          },
        ]
      }
      stablecoin_reserves: {
        Row: {
          chain: string
          circle_wallet_id: string | null
          collateral_amount: string
          created_at: string
          id: string
          last_verified_at: string | null
          reserve_address: string
          stablecoin_id: string
          updated_at: string
          verification_tx_hash: string | null
        }
        Insert: {
          chain: string
          circle_wallet_id?: string | null
          collateral_amount?: string
          created_at?: string
          id?: string
          last_verified_at?: string | null
          reserve_address: string
          stablecoin_id: string
          updated_at?: string
          verification_tx_hash?: string | null
        }
        Update: {
          chain?: string
          circle_wallet_id?: string | null
          collateral_amount?: string
          created_at?: string
          id?: string
          last_verified_at?: string | null
          reserve_address?: string
          stablecoin_id?: string
          updated_at?: string
          verification_tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stablecoin_reserves_stablecoin_id_fkey"
            columns: ["stablecoin_id"]
            isOneToOne: false
            referencedRelation: "private_stablecoins"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_subscriptions: {
        Row: {
          attrs: Json | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer: string | null
          id: string | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Relationships: []
      }
      stripe_webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          ai_requests_limit: number | null
          api_calls_limit: number | null
          created_at: string | null
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          managed_assets_limit: number | null
          name: Database["public"]["Enums"]["subscription_plan"]
          price_monthly: number
          price_monthly_standard: number | null
          price_yearly: number
          price_yearly_standard: number | null
          storage_limit_gb: number | null
          team_members_limit: number | null
          updated_at: string | null
        }
        Insert: {
          ai_requests_limit?: number | null
          api_calls_limit?: number | null
          created_at?: string | null
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          managed_assets_limit?: number | null
          name: Database["public"]["Enums"]["subscription_plan"]
          price_monthly: number
          price_monthly_standard?: number | null
          price_yearly: number
          price_yearly_standard?: number | null
          storage_limit_gb?: number | null
          team_members_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_requests_limit?: number | null
          api_calls_limit?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          managed_assets_limit?: number | null
          name?: Database["public"]["Enums"]["subscription_plan"]
          price_monthly?: number
          price_monthly_standard?: number | null
          price_yearly?: number
          price_yearly_standard?: number | null
          storage_limit_gb?: number | null
          team_members_limit?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active_workflows: number | null
          ai_tokens_limit: number | null
          ai_tokens_used: number | null
          assets_count: number | null
          assets_limit: number | null
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          has_api_access: boolean | null
          has_custom_analytics: boolean | null
          has_integrations: boolean | null
          id: string
          licensed_users: number | null
          metadata: Json | null
          plan_tier: string | null
          price_id: string | null
          quantity: number | null
          status: string | null
          storage_limit_gb: number | null
          storage_used_gb: number | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
          workflows_limit: number | null
        }
        Insert: {
          active_workflows?: number | null
          ai_tokens_limit?: number | null
          ai_tokens_used?: number | null
          assets_count?: number | null
          assets_limit?: number | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          has_api_access?: boolean | null
          has_custom_analytics?: boolean | null
          has_integrations?: boolean | null
          id: string
          licensed_users?: number | null
          metadata?: Json | null
          plan_tier?: string | null
          price_id?: string | null
          quantity?: number | null
          status?: string | null
          storage_limit_gb?: number | null
          storage_used_gb?: number | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
          workflows_limit?: number | null
        }
        Update: {
          active_workflows?: number | null
          ai_tokens_limit?: number | null
          ai_tokens_used?: number | null
          assets_count?: number | null
          assets_limit?: number | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          has_api_access?: boolean | null
          has_custom_analytics?: boolean | null
          has_integrations?: boolean | null
          id?: string
          licensed_users?: number | null
          metadata?: Json | null
          plan_tier?: string | null
          price_id?: string | null
          quantity?: number | null
          status?: string | null
          storage_limit_gb?: number | null
          storage_used_gb?: number | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
          workflows_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
        ]
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
          tx_hash: string
          user_id: string
        }
        Insert: {
          avatar_url: string
          blockchain?: string
          content_url: string
          created_at?: string | null
          domain_name: string
          id?: string
          name: string
          tx_hash: string
          user_id?: string
        }
        Update: {
          avatar_url?: string
          blockchain?: string
          content_url?: string
          created_at?: string | null
          domain_name?: string
          id?: string
          name?: string
          tx_hash?: string
          user_id?: string
        }
        Relationships: []
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
          user_id: string
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
          user_id?: string
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
          user_id?: string
        }
        Relationships: []
      }
      system_agent_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string
          difficulty: string | null
          estimated_setup_time: number | null
          icon: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          parameters: Json
          system_prompt: string
          tags: string[] | null
          template_id: string
          tools: Json
          updated_at: string | null
          use_cases: string[] | null
          version: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          difficulty?: string | null
          estimated_setup_time?: number | null
          icon: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          parameters?: Json
          system_prompt: string
          tags?: string[] | null
          template_id: string
          tools?: Json
          updated_at?: string | null
          use_cases?: string[] | null
          version?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string | null
          estimated_setup_time?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          parameters?: Json
          system_prompt?: string
          tags?: string[] | null
          template_id?: string
          tools?: Json
          updated_at?: string | null
          use_cases?: string[] | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_agent_templates_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["name"]
          },
        ]
      }
      system_workflow_templates: {
        Row: {
          ai_model: string | null
          category: string
          created_at: string | null
          description: string
          difficulty: string | null
          estimated_time: number | null
          expected_outcomes: string[] | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          prerequisites: string[] | null
          steps: Json
          tags: string[] | null
          template_id: string
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          ai_model?: string | null
          category: string
          created_at?: string | null
          description: string
          difficulty?: string | null
          estimated_time?: number | null
          expected_outcomes?: string[] | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          prerequisites?: string[] | null
          steps?: Json
          tags?: string[] | null
          template_id: string
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          ai_model?: string | null
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string | null
          estimated_time?: number | null
          expected_outcomes?: string[] | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          prerequisites?: string[] | null
          steps?: Json
          tags?: string[] | null
          template_id?: string
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_workflow_templates_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["name"]
          },
        ]
      }
      task_web3_actions: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          result: Json | null
          status: string
          task_id: string
          updated_at: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          result?: Json | null
          status?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          result?: Json | null
          status?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_web3_actions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          deadline: string | null
          details: Json | null
          id: string
          requester_id: string | null
          status: string
          task_type: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          deadline?: string | null
          details?: Json | null
          id?: string
          requester_id?: string | null
          status?: string
          task_type: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          deadline?: string | null
          details?: Json | null
          id?: string
          requester_id?: string | null
          status?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      template_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      template_usage_analytics: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          template_id: string
          template_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          template_id: string
          template_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          template_id?: string
          template_type?: string
          user_id?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          id: number
          inserted_at: string
          is_complete: boolean | null
          task: string | null
          user_id: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id?: string
        }
        Update: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id?: string
        }
        Relationships: []
      }
      token_marketplace_listings: {
        Row: {
          created_at: string | null
          id: string
          price_per_fraction: number
          seller_id: string
          sold_at: string | null
          status: string
          token_id: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_per_fraction: number
          seller_id: string
          sold_at?: string | null
          status?: string
          token_id: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price_per_fraction?: number
          seller_id?: string
          sold_at?: string | null
          status?: string
          token_id?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "token_marketplace_listings_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "asset_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_offers: {
        Row: {
          accepted_at: string | null
          buyer_id: string
          created_at: string | null
          expires_at: string
          fraction_count: number
          id: string
          offer_price: number
          pool_id: string
          status: string
          total_price: number
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          buyer_id: string
          created_at?: string | null
          expires_at: string
          fraction_count: number
          id?: string
          offer_price: number
          pool_id: string
          status?: string
          total_price: number
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          buyer_id?: string
          created_at?: string | null
          expires_at?: string
          fraction_count?: number
          id?: string
          offer_price?: number
          pool_id?: string
          status?: string
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_offers_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "fractionalization_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      token_price_history: {
        Row: {
          created_at: string | null
          id: string
          pool_id: string
          price_per_fraction: number
          source: string
          volume: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pool_id: string
          price_per_fraction: number
          source: string
          volume?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pool_id?: string
          price_per_fraction?: number
          source?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "token_price_history_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "fractionalization_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      token_transactions: {
        Row: {
          amount: number
          block_number: number | null
          created_at: string | null
          fraction_count: number
          from_address: string | null
          from_user_id: string | null
          gas_used: number | null
          id: string
          metadata: Json | null
          pool_id: string | null
          price: number
          price_at_transaction: number | null
          status: string
          to_address: string | null
          to_user_id: string | null
          token_id: string | null
          transaction_type: string
          tx_hash: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number
          block_number?: number | null
          created_at?: string | null
          fraction_count: number
          from_address?: string | null
          from_user_id?: string | null
          gas_used?: number | null
          id?: string
          metadata?: Json | null
          pool_id?: string | null
          price: number
          price_at_transaction?: number | null
          status?: string
          to_address?: string | null
          to_user_id?: string | null
          token_id?: string | null
          transaction_type: string
          tx_hash?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          block_number?: number | null
          created_at?: string | null
          fraction_count?: number
          from_address?: string | null
          from_user_id?: string | null
          gas_used?: number | null
          id?: string
          metadata?: Json | null
          pool_id?: string | null
          price?: number
          price_at_transaction?: number | null
          status?: string
          to_address?: string | null
          to_user_id?: string | null
          token_id?: string | null
          transaction_type?: string
          tx_hash?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "fractionalization_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      token_transfer_history: {
        Row: {
          created_at: string | null
          from_address: string
          id: string
          metadata: Json | null
          to_address: string
          token_id: string
          transfer_type: string
          transfer_value: number | null
          tx_hash: string
        }
        Insert: {
          created_at?: string | null
          from_address: string
          id?: string
          metadata?: Json | null
          to_address: string
          token_id: string
          transfer_type: string
          transfer_value?: number | null
          tx_hash: string
        }
        Update: {
          created_at?: string | null
          from_address?: string
          id?: string
          metadata?: Json | null
          to_address?: string
          token_id?: string
          transfer_type?: string
          transfer_value?: number | null
          tx_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transfer_history_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "asset_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_valuations: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          token_id: string
          valuation_amount: number
          valuation_method: string
          valuation_source: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          token_id: string
          valuation_amount: number
          valuation_method: string
          valuation_source?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          token_id?: string
          valuation_amount?: number
          valuation_method?: string
          valuation_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_valuations_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "asset_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          period_end: string
          period_start: string
          resource_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          period_end: string
          period_start: string
          resource_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          period_end?: string
          period_start?: string
          resource_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_managed_supabase_projects: {
        Row: {
          created_at: string
          db_host: string | null
          display_name: string
          encrypted_anon_key: string | null
          encrypted_service_role_key: string | null
          error_message: string | null
          id: string
          status: string
          supabase_plan: string
          supabase_project_id: string
          supabase_project_ref: string
          supabase_region: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          db_host?: string | null
          display_name: string
          encrypted_anon_key?: string | null
          encrypted_service_role_key?: string | null
          error_message?: string | null
          id?: string
          status?: string
          supabase_plan: string
          supabase_project_id: string
          supabase_project_ref: string
          supabase_region: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          db_host?: string | null
          display_name?: string
          encrypted_anon_key?: string | null
          encrypted_service_role_key?: string | null
          error_message?: string | null
          id?: string
          status?: string
          supabase_plan?: string
          supabase_project_id?: string
          supabase_project_ref?: string
          supabase_region?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          settings: Json
          settings_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings?: Json
          settings_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          settings?: Json
          settings_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tokens: {
        Row: {
          created_at: string | null
          id: number
          refresh_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          refresh_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          refresh_token?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_analysis_results: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          analysis_result: Json
          analysis_type: string
          audio_input_url: string | null
          audio_output_url: string | null
          confidence_score: number | null
          context_snapshot_id: string | null
          cost_usd: number | null
          created_at: string
          error_message: string | null
          execution_timestamp: string
          id: string
          metadata: Json | null
          processing_time_ms: number | null
          status: string | null
          tags: string[] | null
          tokens_used: number | null
          transcription_input: string | null
          transcription_output: string | null
          updated_at: string
          user_id: string
          voice_duration_seconds: number | null
          voice_execution_log_id: string | null
          voice_model: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          analysis_result: Json
          analysis_type: string
          audio_input_url?: string | null
          audio_output_url?: string | null
          confidence_score?: number | null
          context_snapshot_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          execution_timestamp?: string
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          status?: string | null
          tags?: string[] | null
          tokens_used?: number | null
          transcription_input?: string | null
          transcription_output?: string | null
          updated_at?: string
          user_id: string
          voice_duration_seconds?: number | null
          voice_execution_log_id?: string | null
          voice_model?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          analysis_result?: Json
          analysis_type?: string
          audio_input_url?: string | null
          audio_output_url?: string | null
          confidence_score?: number | null
          context_snapshot_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          execution_timestamp?: string
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          status?: string | null
          tags?: string[] | null
          tokens_used?: number | null
          transcription_input?: string | null
          transcription_output?: string | null
          updated_at?: string
          user_id?: string
          voice_duration_seconds?: number | null
          voice_execution_log_id?: string | null
          voice_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_analysis_results_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_analysis_results_context_snapshot_id_fkey"
            columns: ["context_snapshot_id"]
            isOneToOne: false
            referencedRelation: "voice_context_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_analysis_results_voice_execution_log_id_fkey"
            columns: ["voice_execution_log_id"]
            isOneToOne: false
            referencedRelation: "voice_execution_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_context_snapshots: {
        Row: {
          context_data: Json
          context_type: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_current: boolean | null
          sequence_number: number
          session_id: string
          snapshot_type: string
          turn_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_data?: Json
          context_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          sequence_number: number
          session_id: string
          snapshot_type: string
          turn_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_data?: Json
          context_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          sequence_number?: number
          session_id?: string
          snapshot_type?: string
          turn_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_context_snapshots_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_execution_logs: {
        Row: {
          aethernet_metadata: Json | null
          agent_id: string | null
          api_key_id: string | null
          asset_ids: string[] | null
          audio_duration: number | null
          audio_format: string | null
          auth_method: string | null
          completed_at: string | null
          confidence: number | null
          confidence_score: number | null
          context_type: string | null
          created_at: string | null
          duration_ms: number | null
          entities_extracted: Json | null
          error: string | null
          error_message: string | null
          execution_result: Json | null
          execution_type: string | null
          id: string
          input_audio_url: string | null
          input_transcript: string | null
          intent_action: string | null
          intent_confidence: number | null
          intent_detected: string | null
          intent_entities: Json | null
          language: string | null
          latency_ms: number | null
          metadata: Json | null
          output_audio_url: string | null
          output_text: string | null
          response_text: string | null
          sentiment_score: number | null
          session_id: string
          status: string | null
          tokens_used: number | null
          transcription: string
          user_id: string
        }
        Insert: {
          aethernet_metadata?: Json | null
          agent_id?: string | null
          api_key_id?: string | null
          asset_ids?: string[] | null
          audio_duration?: number | null
          audio_format?: string | null
          auth_method?: string | null
          completed_at?: string | null
          confidence?: number | null
          confidence_score?: number | null
          context_type?: string | null
          created_at?: string | null
          duration_ms?: number | null
          entities_extracted?: Json | null
          error?: string | null
          error_message?: string | null
          execution_result?: Json | null
          execution_type?: string | null
          id?: string
          input_audio_url?: string | null
          input_transcript?: string | null
          intent_action?: string | null
          intent_confidence?: number | null
          intent_detected?: string | null
          intent_entities?: Json | null
          language?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          output_audio_url?: string | null
          output_text?: string | null
          response_text?: string | null
          sentiment_score?: number | null
          session_id: string
          status?: string | null
          tokens_used?: number | null
          transcription: string
          user_id: string
        }
        Update: {
          aethernet_metadata?: Json | null
          agent_id?: string | null
          api_key_id?: string | null
          asset_ids?: string[] | null
          audio_duration?: number | null
          audio_format?: string | null
          auth_method?: string | null
          completed_at?: string | null
          confidence?: number | null
          confidence_score?: number | null
          context_type?: string | null
          created_at?: string | null
          duration_ms?: number | null
          entities_extracted?: Json | null
          error?: string | null
          error_message?: string | null
          execution_result?: Json | null
          execution_type?: string | null
          id?: string
          input_audio_url?: string | null
          input_transcript?: string | null
          intent_action?: string | null
          intent_confidence?: number | null
          intent_detected?: string | null
          intent_entities?: Json | null
          language?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          output_audio_url?: string | null
          output_text?: string | null
          response_text?: string | null
          sentiment_score?: number | null
          session_id?: string
          status?: string | null
          tokens_used?: number | null
          transcription?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_execution_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_sessions: {
        Row: {
          aethernet_connection_id: string | null
          context_type: string | null
          created_at: string | null
          ended_at: string | null
          failed_commands: number | null
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          session_name: string | null
          successful_commands: number | null
          total_audio_duration: number | null
          total_commands: number | null
          user_id: string
        }
        Insert: {
          aethernet_connection_id?: string | null
          context_type?: string | null
          created_at?: string | null
          ended_at?: string | null
          failed_commands?: number | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          session_name?: string | null
          successful_commands?: number | null
          total_audio_duration?: number | null
          total_commands?: number | null
          user_id: string
        }
        Update: {
          aethernet_connection_id?: string | null
          context_type?: string | null
          created_at?: string | null
          ended_at?: string | null
          failed_commands?: number | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          session_name?: string | null
          successful_commands?: number | null
          total_audio_duration?: number | null
          total_commands?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_sessions_aethernet_connection_id_fkey"
            columns: ["aethernet_connection_id"]
            isOneToOne: false
            referencedRelation: "aethernet_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          agreed_to_updates: boolean | null
          asset_types_to_tokenize: string[] | null
          company: string
          converted_at: string | null
          created_at: string | null
          email: string
          estimated_users: string | null
          first_name: string
          id: string
          interested_in_tokenization: boolean | null
          interested_plan: string | null
          ip_address: unknown
          last_name: string
          notified_at: string | null
          preferred_blockchain: string | null
          priority: string | null
          referrer: string | null
          role: string
          source: string | null
          status: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          agreed_to_updates?: boolean | null
          asset_types_to_tokenize?: string[] | null
          company: string
          converted_at?: string | null
          created_at?: string | null
          email: string
          estimated_users?: string | null
          first_name: string
          id?: string
          interested_in_tokenization?: boolean | null
          interested_plan?: string | null
          ip_address?: unknown
          last_name: string
          notified_at?: string | null
          preferred_blockchain?: string | null
          priority?: string | null
          referrer?: string | null
          role: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          agreed_to_updates?: boolean | null
          asset_types_to_tokenize?: string[] | null
          company?: string
          converted_at?: string | null
          created_at?: string | null
          email?: string
          estimated_users?: string | null
          first_name?: string
          id?: string
          interested_in_tokenization?: boolean | null
          interested_plan?: string | null
          ip_address?: unknown
          last_name?: string
          notified_at?: string | null
          preferred_blockchain?: string | null
          priority?: string | null
          referrer?: string | null
          role?: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          delivered_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          delivered_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          delivered_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          description: string | null
          events: string[]
          failure_count: number
          id: string
          is_active: boolean
          last_status: string | null
          last_triggered_at: string | null
          name: string
          secret: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_status?: string | null
          last_triggered_at?: string | null
          name: string
          secret: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_status?: string | null
          last_triggered_at?: string | null
          name?: string
          secret?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_execution_logs: {
        Row: {
          created_at: string | null
          error: string | null
          execution_time: number | null
          id: string
          input: Json | null
          output: Json | null
          status: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          execution_time?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          status: string
          user_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          execution_time?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          status?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_execution_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "ai_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_learning_data: {
        Row: {
          created_at: string | null
          decision_outcomes: Json | null
          id: string
          optimization_suggestions: Json | null
          performance_metrics: Json | null
          run_id: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          decision_outcomes?: Json | null
          id?: string
          optimization_suggestions?: Json | null
          performance_metrics?: Json | null
          run_id: string
          user_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          decision_outcomes?: Json | null
          id?: string
          optimization_suggestions?: Json | null
          performance_metrics?: Json | null
          run_id?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: []
      }
      xreserve_transactions: {
        Row: {
          amount: string
          canton_contract_id: string | null
          circle_transaction_id: string | null
          completed_at: string | null
          created_at: string
          destination_address: string | null
          destination_chain: string | null
          destination_party_id: string | null
          error_message: string | null
          id: string
          l1_tx_hash: string | null
          source_address: string | null
          source_chain: string | null
          source_party_id: string | null
          stablecoin_id: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: string
          canton_contract_id?: string | null
          circle_transaction_id?: string | null
          completed_at?: string | null
          created_at?: string
          destination_address?: string | null
          destination_chain?: string | null
          destination_party_id?: string | null
          error_message?: string | null
          id?: string
          l1_tx_hash?: string | null
          source_address?: string | null
          source_chain?: string | null
          source_party_id?: string | null
          stablecoin_id?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: string
          canton_contract_id?: string | null
          circle_transaction_id?: string | null
          completed_at?: string | null
          created_at?: string
          destination_address?: string | null
          destination_chain?: string | null
          destination_party_id?: string | null
          error_message?: string | null
          id?: string
          l1_tx_hash?: string | null
          source_address?: string | null
          source_chain?: string | null
          source_party_id?: string | null
          stablecoin_id?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xreserve_transactions_stablecoin_id_fkey"
            columns: ["stablecoin_id"]
            isOneToOne: false
            referencedRelation: "private_stablecoins"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      asset_analytics: {
        Row: {
          active_assets: number | null
          asset_type: string | null
          avg_asset_value: number | null
          iot_enabled_assets: number | null
          maintenance_assets: number | null
          total_asset_value: number | null
          total_assets: number | null
          total_insights: number | null
          total_lifecycle_events: number | null
          user_id: string | null
        }
        Relationships: []
      }
      asset_intelligence_learning_stats: {
        Row: {
          all_tags: string[] | null
          avg_quality_rating: number | null
          avg_success_score: number | null
          execution_type: string | null
          first_execution: string | null
          last_execution: string | null
          total_executions: number | null
          unique_executions: number | null
          user_id: string | null
        }
        Relationships: []
      }
      embedding_job_stats: {
        Row: {
          avg_processing_time_seconds: number | null
          first_job_at: string | null
          job_count: number | null
          job_type: string | null
          last_job_at: string | null
          status: string | null
          user_id: string | null
        }
        Relationships: []
      }
      iot_sensor_analytics: {
        Row: {
          avg_start_latitude: number | null
          avg_start_longitude: number | null
          impact_events: number | null
          low_battery_events: number | null
          refrigerated_shipments: number | null
          sensor_types: Json | null
          temperature_excursions: number | null
          total_iot_shipments: number | null
          user_id: string | null
        }
        Relationships: []
      }
      latest_asset_sensor_readings: {
        Row: {
          asset_id: string | null
          asset_identifier: string | null
          asset_name: string | null
          asset_status: string | null
          asset_type: string | null
          battery_level: number | null
          humidity: number | null
          id: string | null
          iot_sensor_id: string | null
          location: Json | null
          metadata: Json | null
          temperature: number | null
          timestamp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensor_data_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      package_shipment_details: {
        Row: {
          carrier: string | null
          destination_address: Json | null
          estimated_delivery: string | null
          origin_address: Json | null
          package_id: string | null
          package_name: string | null
          reuse_count: number | null
          shipment_id: string | null
          shipment_status: string | null
          shipping_date: string | null
          status: string | null
          tracking_code: string | null
          tracking_number: string | null
        }
        Relationships: []
      }
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
      packaging_order_analytics: {
        Row: {
          material_type: string | null
          order_count: number | null
          order_month: string | null
          order_type: string | null
          orders_with_iot: number | null
          total_iot_sensors: number | null
          total_quantity: number | null
          total_revenue: number | null
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
      unified_workflows: {
        Row: {
          ai_model: string | null
          asset_type: string | null
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string | null
          is_active: boolean | null
          last_executed_at: string | null
          name: string | null
          source_table: string | null
          steps: Json | null
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      user_oauth_clients: {
        Row: {
          allowed_scopes: string[] | null
          client_description: string | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          redirect_uris: string[] | null
          updated_at: string | null
        }
        Insert: {
          allowed_scopes?: string[] | null
          client_description?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          redirect_uris?: string[] | null
          updated_at?: string | null
        }
        Update: {
          allowed_scopes?: string[] | null
          client_description?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          redirect_uris?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_oauth_tokens: { Args: never; Returns: undefined }
      complete_job: {
        Args: { job_id: string; job_result?: Json }
        Returns: undefined
      }
      create_agent: {
        Args: {
          p_data_sources?: Json
          p_description?: string
          p_max_tokens?: number
          p_model?: string
          p_name: string
          p_system_prompt?: string
          p_temperature?: number
          p_tools?: Json
          p_user_id: string
        }
        Returns: Json
      }
      create_agent_context: {
        Args: {
          p_agent_id: string
          p_context_config?: Json
          p_context_name: string
          p_context_type: string
        }
        Returns: string
      }
      create_api_key: {
        Args: {
          p_expires_at?: string
          p_key_hash: string
          p_key_prefix: string
          p_name: string
          p_scopes?: Json
          p_user_id: string
        }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          key_prefix: string
          name: string
          scopes: Json
          user_id: string
        }[]
      }
      create_voice_context_snapshot: {
        Args: {
          p_context_data: Json
          p_session_id: string
          p_snapshot_type: string
        }
        Returns: string
      }
      create_workflow: {
        Args: {
          p_ai_model?: string
          p_description?: string
          p_name: string
          p_steps?: Json
          p_trigger_config?: Json
          p_trigger_type?: string
          p_user_id: string
        }
        Returns: Json
      }
      current_user_id: { Args: never; Returns: string }
      delete_agent: {
        Args: { p_agent_id: string; p_user_id: string }
        Returns: boolean
      }
      delete_api_key: { Args: { p_key_id: string }; Returns: boolean }
      delete_oauth_client: { Args: { p_client_id: string }; Returns: boolean }
      delete_workflow: {
        Args: { p_user_id: string; p_workflow_id: string }
        Returns: boolean
      }
      expire_old_offers: { Args: never; Returns: undefined }
      extract_tool_names: { Args: { tools_json: Json }; Returns: Json }
      fail_job: {
        Args: { error_message: string; job_id: string }
        Returns: undefined
      }
      generate_assessment_reference: { Args: never; Returns: string }
      get_agent_execution_history: {
        Args: { p_agent_id: string; p_limit?: number; p_user_id: string }
        Returns: Json
      }
      get_ai_request_volume: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          avg_response_time: number
          date: string
          failed_requests: number
          successful_requests: number
          total_cost: number
          total_requests: number
          total_tokens: number
        }[]
      }
      get_api_routes: { Args: never; Returns: Json }
      get_message_thread: {
        Args: { p_thread_id: string }
        Returns: {
          body: string
          id: string
          priority: string
          read_status: string
          sender_id: string
          sent_at: string
          subject: string
        }[]
      }
      get_oauth_client_by_id: {
        Args: { p_client_id: string }
        Returns: unknown
        SetofOptions: {
          from: "*"
          to: "oauth_clients"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_refrigerated_shipment_stats: {
        Args: { user_id: string }
        Returns: {
          avg_max_temp: number
          avg_min_temp: number
          excursion_rate: number
          total_refrigerated_shipments: number
        }[]
      }
      get_user_api_keys: {
        Args: { p_is_active?: boolean; p_limit?: number; p_user_id: string }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_request_at: string
          last_used_at: string
          name: string
          scopes: Json
          total_requests: number
          updated_at: string
          user_id: string
        }[]
      }
      get_user_oauth_clients: {
        Args: never
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "oauth_clients"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_workflow_execution_history: {
        Args: { p_limit?: number; p_user_id: string; p_workflow_id: string }
        Returns: Json
      }
      has_api_key_scope: { Args: { required_scope: string }; Returns: boolean }
      increment_reuse_count: { Args: { p_id: number }; Returns: number }
      increment_workflow_execution: {
        Args: { p_workflow_id: string }
        Returns: undefined
      }
      is_organization_admin: {
        Args: { check_user_id: string; org_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { check_user_id: string; org_id: string }
        Returns: boolean
      }
      log_agent_execution: {
        Args: {
          p_agent_id: string
          p_error?: string
          p_execution_time?: number
          p_input: string
          p_output?: string
          p_status: string
          p_user_id: string
        }
        Returns: string
      }
      log_email_send: {
        Args: {
          p_email_type: string
          p_message_id?: string
          p_metadata?: Json
          p_recipient_email: string
          p_subject: string
        }
        Returns: string
      }
      log_workflow_execution: {
        Args: {
          p_error?: string
          p_execution_time?: number
          p_input?: Json
          p_output?: Json
          p_status: string
          p_user_id: string
          p_workflow_id: string
        }
        Returns: string
      }
      mark_message_as_read: { Args: { p_message_id: string }; Returns: boolean }
      match_embeddings: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
          user_id: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_learning_data: {
        Args: {
          filter_asset_ids?: string[]
          filter_execution_type?: string
          filter_user_id: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          asset_context: Json
          created_at: string
          description: string
          execution_name: string
          execution_output: Json
          execution_type: string
          id: string
          name: string
          similarity: number
        }[]
      }
      register_oauth_client: {
        Args: {
          p_allowed_scopes?: string[]
          p_client_description?: string
          p_client_name: string
          p_redirect_uris?: string[]
        }
        Returns: Json
      }
      reset_monthly_usage: { Args: never; Returns: undefined }
      rotate_oauth_client_secret: {
        Args: { p_client_id: string }
        Returns: Json
      }
      search_shipments_by_iot_data: {
        Args: { search_query: string; user_id: string }
        Returns: {
          actual_delivery: string | null
          carrier: string | null
          carrier_api_response: Json | null
          cost: number | null
          created_at: string | null
          current_location: Json | null
          destination_address: Json
          dimensions: Json | null
          estimated_delivery: string | null
          id: string
          iot_data: Json | null
          iot_sensor_id: string | null
          label_image_base64: string | null
          last_updated: string | null
          metadata: Json | null
          origin_address: Json
          package_ids: Json | null
          public_id: string | null
          shipping_date: string | null
          status: string | null
          tracking_number: string
          transit_events: Json[] | null
          updated_at: string | null
          user_id: string
          weight: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "shipping"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      send_aethernet_message: {
        Args: {
          p_attachments?: Json
          p_body: string
          p_encrypted?: boolean
          p_priority?: string
          p_recipients: string[]
          p_subject: string
          p_thread_id?: string
        }
        Returns: string
      }
      start_job_processing: { Args: { job_id: string }; Returns: undefined }
      test_aethernet_connection: {
        Args: { p_connection_id: string }
        Returns: Json
      }
      update_agent: {
        Args: {
          p_agent_id: string
          p_data_sources?: Json
          p_description?: string
          p_is_active?: boolean
          p_max_tokens?: number
          p_model?: string
          p_name?: string
          p_system_prompt?: string
          p_temperature?: number
          p_tools?: Json
          p_user_id: string
        }
        Returns: Json
      }
      update_ai_model_type: { Args: never; Returns: undefined }
      update_api_key: {
        Args: {
          p_expires_at?: string
          p_is_active?: boolean
          p_key_id: string
          p_name?: string
        }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          key_prefix: string
          name: string
          scopes: Json
          updated_at: string
          user_id: string
        }[]
      }
      update_job_progress: {
        Args: { job_id: string; new_message?: string; new_progress: number }
        Returns: undefined
      }
      update_oauth_client: {
        Args: {
          p_allowed_scopes?: string[]
          p_client_description?: string
          p_client_id: string
          p_client_name?: string
          p_is_active?: boolean
          p_redirect_uris?: string[]
        }
        Returns: unknown
        SetofOptions: {
          from: "*"
          to: "oauth_clients"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_workflow: {
        Args: {
          p_ai_model?: string
          p_description?: string
          p_is_active?: boolean
          p_name?: string
          p_steps?: Json
          p_trigger_config?: Json
          p_trigger_type?: string
          p_user_id: string
          p_workflow_id: string
        }
        Returns: Json
      }
      validate_api_key:
        | {
            Args: {
              p_expected_user_id?: string
              p_key_hash: string
              p_key_prefix: string
              p_mark_usage?: boolean
              p_required_scopes?: Json
            }
            Returns: {
              expires_at: string
              is_active: boolean
              is_valid: boolean
              key_id: string
              key_prefix: string
              last_used_at: string
              name: string
              scopes: Json
              user_id: string
            }[]
          }
        | {
            Args: {
              x_expected_user_id?: string
              x_key_hash: string
              x_key_prefix: string
              x_mark_usage?: boolean
              x_required_scopes?: Json
            }
            Returns: {
              api_key_id: string
              error_message: string
              is_valid: boolean
              scopes: Json
              user_id: string
            }[]
          }
    }
    Enums: {
      app_role_enum: "admin" | "editor" | "viewer"
      continents:
        | "Africa"
        | "Antarctica"
        | "Asia"
        | "Europe"
        | "Oceania"
        | "North America"
        | "South America"
      database_connection_status: "pending_test" | "success" | "failed"
      database_connection_type:
        | "postgresql"
        | "mysql"
        | "sqlserver"
        | "bigquery"
        | "snowflake"
      integration_provider: "shopify" | "wix"
      integration_status: "active" | "revoked" | "error" | "pending"
      subscription_plan: "lite" | "starter" | "professional" | "enterprise"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "incomplete"
      sync_status: "idle" | "syncing" | "completed" | "failed"
      user_role: "owner" | "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  realtime: {
    Tables: {
      messages: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_01_26: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_01_27: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_01_28: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_01_29: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_01_30: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_01_31: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_02_01: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_02_02: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_02_03: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_02_04: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_02_05: {
        Row: {
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          inserted_at: string | null
          version: number
        }
        Insert: {
          inserted_at?: string | null
          version: number
        }
        Update: {
          inserted_at?: string | null
          version?: number
        }
        Relationships: []
      }
      subscription: {
        Row: {
          claims: Json
          claims_role: unknown
          created_at: string
          entity: unknown
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id: number
          subscription_id: string
        }
        Insert: {
          claims: Json
          claims_role?: unknown
          created_at?: string
          entity: unknown
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id?: never
          subscription_id: string
        }
        Update: {
          claims?: Json
          claims_role?: unknown
          created_at?: string
          entity?: unknown
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id?: never
          subscription_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_rls: {
        Args: { max_record_bytes?: number; wal: Json }
        Returns: Database["realtime"]["CompositeTypes"]["wal_rls"][]
        SetofOptions: {
          from: "*"
          to: "wal_rls"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      broadcast_changes: {
        Args: {
          event_name: string
          level?: string
          new: Record<string, unknown>
          old: Record<string, unknown>
          operation: string
          table_name: string
          table_schema: string
          topic_name: string
        }
        Returns: undefined
      }
      build_prepared_statement_sql: {
        Args: {
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][]
          entity: unknown
          prepared_statement_name: string
        }
        Returns: string
      }
      cast: { Args: { type_: unknown; val: string }; Returns: Json }
      check_equality_op: {
        Args: {
          op: Database["realtime"]["Enums"]["equality_op"]
          type_: unknown
          val_1: string
          val_2: string
        }
        Returns: boolean
      }
      is_visible_through_filters: {
        Args: {
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][]
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
        }
        Returns: boolean
      }
      list_changes: {
        Args: {
          max_changes: number
          max_record_bytes: number
          publication: unknown
          slot_name: unknown
        }
        Returns: Database["realtime"]["CompositeTypes"]["wal_rls"][]
        SetofOptions: {
          from: "*"
          to: "wal_rls"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      quote_wal2json: { Args: { entity: unknown }; Returns: string }
      send: {
        Args: { event: string; payload: Json; private?: boolean; topic: string }
        Returns: undefined
      }
      to_regrole: { Args: { role_name: string }; Returns: unknown }
      topic: { Args: never; Returns: string }
    }
    Enums: {
      action: "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE" | "ERROR"
      equality_op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in"
    }
    CompositeTypes: {
      user_defined_filter: {
        column_name: string | null
        op: Database["realtime"]["Enums"]["equality_op"] | null
        value: string | null
      }
      wal_column: {
        name: string | null
        type_name: string | null
        type_oid: unknown
        value: Json | null
        is_pkey: boolean | null
        is_selectable: boolean | null
      }
      wal_rls: {
        wal: Json | null
        is_rls_enabled: boolean | null
        subscription_ids: string[] | null
        errors: string[] | null
      }
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
          type: Database["storage"]["Enums"]["buckettype"]
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
          type?: Database["storage"]["Enums"]["buckettype"]
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
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
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
          level: number | null
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
          level?: number | null
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
          level?: number | null
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
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
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
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role_enum: ["admin", "editor", "viewer"],
      continents: [
        "Africa",
        "Antarctica",
        "Asia",
        "Europe",
        "Oceania",
        "North America",
        "South America",
      ],
      database_connection_status: ["pending_test", "success", "failed"],
      database_connection_type: [
        "postgresql",
        "mysql",
        "sqlserver",
        "bigquery",
        "snowflake",
      ],
      integration_provider: ["shopify", "wix"],
      integration_status: ["active", "revoked", "error", "pending"],
      subscription_plan: ["lite", "starter", "professional", "enterprise"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "incomplete",
      ],
      sync_status: ["idle", "syncing", "completed", "failed"],
      user_role: ["owner", "admin", "member", "viewer"],
    },
  },
  realtime: {
    Enums: {
      action: ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR"],
      equality_op: ["eq", "neq", "lt", "lte", "gt", "gte", "in"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
