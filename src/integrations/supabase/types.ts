export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      deposit_methods: {
        Row: {
          created_at: string | null
          crypto: string
          addresses: {
            address: string
            label: string
          }[]
          id: string
          is_active: boolean | null
          network: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crypto: string
          deposit_address: string
          deposit_group_id?: string | null
          id?: string
          is_active?: boolean | null
          network: string
          qr_code_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crypto?: string
          deposit_address?: string
          deposit_group_id?: string | null
          id?: string
          is_active?: boolean | null
          network?: string
          qr_code_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string | null
          crypto_type: string
          deposit_address: string
          id: string
          status: Database["public"]["Enums"]["deposit_status"] | null
          total_usd_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          crypto_type: string
          deposit_address: string
          id?: string
          status?: Database["public"]["Enums"]["deposit_status"] | null
          total_usd_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          crypto_type?: string
          deposit_address?: string
          id?: string
          status?: Database["public"]["Enums"]["deposit_status"] | null
          total_usd_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          address_proof: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          document_url: string | null
          full_name: string | null
          funds_proof: string | null
          id: string
          level_1_approved_at: string | null
          level_1_approved_by: string | null
          level_1_submitted: boolean | null
          level_1_verified: boolean | null
          level_2_approved_at: string | null
          level_2_approved_by: string | null
          level_2_submitted: boolean | null
          level_2_verified: boolean | null
          occupation: string | null
          residential_address: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_proof?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          document_url?: string | null
          full_name?: string | null
          funds_proof?: string | null
          id?: string
          level_1_approved_at?: string | null
          level_1_approved_by?: string | null
          level_1_submitted?: boolean | null
          level_1_verified?: boolean | null
          level_2_approved_at?: string | null
          level_2_approved_by?: string | null
          level_2_submitted?: boolean | null
          level_2_verified?: boolean | null
          occupation?: string | null
          residential_address?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_proof?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          document_url?: string | null
          full_name?: string | null
          funds_proof?: string | null
          id?: string
          level_1_approved_at?: string | null
          level_1_approved_by?: string | null
          level_1_submitted?: boolean | null
          level_1_verified?: boolean | null
          level_2_approved_at?: string | null
          level_2_approved_by?: string | null
          level_2_submitted?: boolean | null
          level_2_verified?: boolean | null
          occupation?: string | null
          residential_address?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_level_1_approved_by_fkey"
            columns: ["level_1_approved_by"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_verifications_level_2_approved_by_fkey"
            columns: ["level_2_approved_by"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      news_trades: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payout: number
          prediction: string
          question_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payout: number
          prediction: string
          question_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payout?: number
          prediction?: string
          question_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_trades_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          profile_image_url: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id: string
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          link: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          link?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          link?: string | null
          title?: string
        }
        Relationships: []
      }
      question_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: Database["public"]["Enums"]["question_category"]
          created_at: string | null
          created_by: string
          end_datetime: string
          id: string
          no_value: number
          question: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["question_status"] | null
          yes_value: number
        }
        Insert: {
          category: Database["public"]["Enums"]["question_category"]
          created_at?: string | null
          created_by: string
          end_datetime: string
          id?: string
          no_value: number
          question: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["question_status"] | null
          yes_value: number
        }
        Update: {
          category?: Database["public"]["Enums"]["question_category"]
          created_at?: string | null
          created_by?: string
          end_datetime?: string
          id?: string
          no_value?: number
          question?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["question_status"] | null
          yes_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_relationships: {
        Row: {
          id: string
          referred_id: string
          referrer_id: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          referred_id: string
          referrer_id: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          referred_id?: string
          referrer_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_relationships_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_relationships_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_events: {
        Row: {
          country: string
          created_at: string | null
          created_by: string | null
          id: string
          sport: string
          title: string
        }
        Insert: {
          country: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          sport: string
          title: string
        }
        Update: {
          country?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          sport?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sport_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_matches: {
        Row: {
          created_at: string | null
          created_by: string | null
          event_id: string | null
          id: string
          live_start_time: string
          title: string
          trade_end_time: string
          trade_start_time: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          id?: string
          live_start_time: string
          title: string
          trade_end_time: string
          trade_start_time: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          id?: string
          live_start_time?: string
          title?: string
          trade_end_time?: string
          trade_start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "sport_matches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "sport_events"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_questions: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          end_datetime: string
          id: string
          match_id: string | null
          no_value: number
          question: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          yes_value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          end_datetime: string
          id?: string
          match_id?: string | null
          no_value: number
          question: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          yes_value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          end_datetime?: string
          id?: string
          match_id?: string | null
          no_value?: number
          question?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          yes_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sport_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_questions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "sport_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_questions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_trades: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payout: number
          prediction: string
          sport_question_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payout: number
          prediction: string
          sport_question_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payout?: number
          prediction?: string
          sport_question_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sport_trades_sport_question_id_fkey"
            columns: ["sport_question_id"]
            isOneToOne: false
            referencedRelation: "sport_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payout: number
          prediction: string
          question_id: string
          status: Database["public"]["Enums"]["trade_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payout: number
          prediction: string
          question_id: string
          status?: Database["public"]["Enums"]["trade_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payout?: number
          prediction?: string
          question_id?: string
          status?: Database["public"]["Enums"]["trade_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_question"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          trade_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          trade_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          trade_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          bnb_balance: number | null
          created_at: string
          eth_balance: number | null
          id: string
          total_usd_value: number | null
          updated_at: string
          usdt_balance: number | null
          user_id: string
        }
        Insert: {
          bnb_balance?: number | null
          created_at?: string
          eth_balance?: number | null
          id?: string
          total_usd_value?: number | null
          updated_at?: string
          usdt_balance?: number | null
          user_id: string
        }
        Update: {
          bnb_balance?: number | null
          created_at?: string
          eth_balance?: number | null
          id?: string
          total_usd_value?: number | null
          updated_at?: string
          usdt_balance?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          network: Database["public"]["Enums"]["crypto_network"]
          processed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"] | null
          token: Database["public"]["Enums"]["crypto_token"]
          updated_at: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          network: Database["public"]["Enums"]["crypto_network"]
          processed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          token: Database["public"]["Enums"]["crypto_token"]
          updated_at?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          network?: Database["public"]["Enums"]["crypto_network"]
          processed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          token?: Database["public"]["Enums"]["crypto_token"]
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      question_participation: {
        Row: {
          no_participants: number | null
          question_id: string | null
          total_participants: number | null
          yes_participants: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_question"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      sport_question_participation: {
        Row: {
          no_participants: number | null
          question_id: string | null
          total_participants: number | null
          yes_participants: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sport_trades_sport_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "sport_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_statistics: {
        Row: {
          balance: number | null
          country: string | null
          date_of_birth: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          document_url: string | null
          email: string | null
          full_name: string | null
          id: string | null
          joined_at: string | null
          level_1_verified: boolean | null
          level_2_verified: boolean | null
          occupation: string | null
          questions_participated: number | null
          residential_address: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_kyc_level: {
        Args: {
          p_user_id: string
          p_level: number
        }
        Returns: undefined
      }
      check_column_exists: {
        Args: {
          table_name: string
          column_name: string
        }
        Returns: boolean
      }
      check_table_exists: {
        Args: {
          p_table_name: string
        }
        Returns: boolean
      }
      create_sport_trade: {
        Args: {
          p_id: string
          p_user_id: string
          p_sport_question_id: string
          p_amount: number
          p_prediction: string
          p_payout: number
        }
        Returns: string
      }
      create_sport_trade_transaction: {
        Args: {
          p_user_id: string
          p_amount: number
          p_trade_id: string
          p_description: string
        }
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_referrer_chain: {
        Args: {
          user_id: string
        }
        Returns: {
          referrer_id: string
          level: number
        }[]
      }
      handle_trade_placement: {
        Args: {
          p_user_id: string
          p_question_id: string
          p_amount: number
          p_prediction: string
          p_payout: number
        }
        Returns: string
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      resolve_news_question: {
        Args: {
          p_question_id: string
          p_winning_prediction: string
        }
        Returns: undefined
      }
      resolve_news_question_trade: {
        Args: {
          p_question_id: string
          p_winning_prediction: string
        }
        Returns: undefined
      }
      resolve_news_trade: {
        Args: {
          p_trade_id: string
          p_user_id: string
          p_amount: number
          p_description: string
        }
        Returns: string
      }
      resolve_sport_trade: {
        Args: {
          p_trade_id: string
          p_user_id: string
          p_amount: number
          p_description: string
        }
        Returns: string
      }
      resolve_trades_for_question: {
        Args: {
          p_question_id: string
          p_winning_prediction: string
        }
        Returns: undefined
      }
      update_user_balance: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      crypto_network: "TRC20" | "ERC20" | "BEP20"
      crypto_token: "USDT" | "USDC"
      deposit_status: "pending" | "approved" | "rejected"
      document_type: "passport" | "national_id" | "driving_license"
      question_category:
        | "Politics"
        | "News"
        | "India"
        | "USA"
        | "Crypto"
        | "Space"
        | "Technology"
        | "Sports"
      question_category_type:
        | "Politics"
        | "News"
        | "India"
        | "USA"
        | "Crypto"
        | "Space"
        | "Technology"
        | "Others"
      question_status: "active" | "resolved_yes" | "resolved_no"
      trade_status: "pending" | "completed" | "failed"
      transaction_type:
        | "deposit"
        | "trade_placement"
        | "trade_payout"
        | "referral_commission"
        | "withdrawal"
      withdrawal_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
