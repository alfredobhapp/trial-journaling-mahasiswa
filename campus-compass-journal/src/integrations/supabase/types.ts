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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      journal_entries: {
        Row: {
          body_reactions: string[]
          burden: string | null
          contact: string | null
          created_at: string
          dosen: string | null
          enthusiasm: number | null
          ews_result: Database["public"]["Enums"]["ews_status"]
          hambatan: string[]
          hambatan_personal: string[]
          help_need: string | null
          help_needs: string[]
          id: string
          moods: string[]
          physical: string[]
          profile_type: Database["public"]["Enums"]["profile_type"]
          referral_date: string | null
          referral_done: boolean
          referral_status: Database["public"]["Enums"]["referral_status"]
          referral_target: Database["public"]["Enums"]["referral_target"] | null
          referred_at: string | null
          self_reflection: string[]
          semester: number | null
          sleep: string | null
          social_reactions: string[]
          student_name: string
          student_nim: string
          thesis_stage: string | null
        }
        Insert: {
          body_reactions?: string[]
          burden?: string | null
          contact?: string | null
          created_at?: string
          dosen?: string | null
          enthusiasm?: number | null
          ews_result: Database["public"]["Enums"]["ews_status"]
          hambatan?: string[]
          hambatan_personal?: string[]
          help_need?: string | null
          help_needs?: string[]
          id?: string
          moods?: string[]
          physical?: string[]
          profile_type: Database["public"]["Enums"]["profile_type"]
          referral_date?: string | null
          referral_done?: boolean
          referral_status?: Database["public"]["Enums"]["referral_status"]
          referral_target?:
            | Database["public"]["Enums"]["referral_target"]
            | null
          referred_at?: string | null
          self_reflection?: string[]
          semester?: number | null
          sleep?: string | null
          social_reactions?: string[]
          student_name: string
          student_nim: string
          thesis_stage?: string | null
        }
        Update: {
          body_reactions?: string[]
          burden?: string | null
          contact?: string | null
          created_at?: string
          dosen?: string | null
          enthusiasm?: number | null
          ews_result?: Database["public"]["Enums"]["ews_status"]
          hambatan?: string[]
          hambatan_personal?: string[]
          help_need?: string | null
          help_needs?: string[]
          id?: string
          moods?: string[]
          physical?: string[]
          profile_type?: Database["public"]["Enums"]["profile_type"]
          referral_date?: string | null
          referral_done?: boolean
          referral_status?: Database["public"]["Enums"]["referral_status"]
          referral_target?:
            | Database["public"]["Enums"]["referral_target"]
            | null
          referred_at?: string | null
          self_reflection?: string[]
          semester?: number | null
          sleep?: string | null
          social_reactions?: string[]
          student_name?: string
          student_nim?: string
          thesis_stage?: string | null
        }
        Relationships: []
      }
      journal_reviews: {
        Row: {
          created_at: string
          id: string
          journal_id: string
          note: string
          reviewer_name: string
          reviewer_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          journal_id: string
          note: string
          reviewer_name?: string
          reviewer_role?: string
        }
        Update: {
          created_at?: string
          id?: string
          journal_id?: string
          note?: string
          reviewer_name?: string
          reviewer_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_reviews_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ews_status: "normal" | "akademik" | "konseling"
      profile_type: "awal" | "akhir"
      referral_status: "belum" | "dirujuk"
      referral_target: "pembimbing" | "konselor"
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
  public: {
    Enums: {
      ews_status: ["normal", "akademik", "konseling"],
      profile_type: ["awal", "akhir"],
      referral_status: ["belum", "dirujuk"],
      referral_target: ["pembimbing", "konselor"],
    },
  },
} as const
