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
      estimates: {
        Row: {
          created_at: string
          created_by: string
          estimate_type: string
          id: string
          payload: Json
          project_id: string | null
          total: number
        }
        Insert: {
          created_at?: string
          created_by: string
          estimate_type: string
          id?: string
          payload: Json
          project_id?: string | null
          total: number
        }
        Update: {
          created_at?: string
          created_by?: string
          estimate_type?: string
          id?: string
          payload?: Json
          project_id?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_audit_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          item_id: string
          item_name: string
          new_rate: number
          old_rate: number | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          item_id: string
          item_name: string
          new_rate: number
          old_rate?: number | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          item_id?: string
          item_name?: string
          new_rate?: number
          old_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_audit_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "pricing_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      pricing_items: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          notes: string | null
          rate: number
          unit: string
          updated_at: string
          updated_by: string | null
          vendor: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          rate?: number
          unit: string
          updated_at?: string
          updated_by?: string | null
          vendor?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          rate?: number
          unit?: string
          updated_at?: string
          updated_by?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "pricing_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assigned_site: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          assigned_site?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          assigned_site?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_rooms: {
        Row: {
          created_at: string
          doors: number | null
          height_ft: number | null
          id: string
          length_ft: number | null
          notes: string | null
          project_id: string
          room_name: string
          width_ft: number | null
          windows: number | null
        }
        Insert: {
          created_at?: string
          doors?: number | null
          height_ft?: number | null
          id?: string
          length_ft?: number | null
          notes?: string | null
          project_id: string
          room_name: string
          width_ft?: number | null
          windows?: number | null
        }
        Update: {
          created_at?: string
          doors?: number | null
          height_ft?: number | null
          id?: string
          length_ft?: number | null
          notes?: string | null
          project_id?: string
          room_name?: string
          width_ft?: number | null
          windows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_stages: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          photo_url: string | null
          progress: number
          project_id: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          photo_url?: string | null
          progress?: number
          project_id: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          photo_url?: string | null
          progress?: number
          project_id?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          area_sqft: number | null
          assigned_supervisor: string | null
          assigned_thekedar: string | null
          budget: number | null
          client_name: string | null
          created_at: string
          end_date: string | null
          id: string
          lead_id: string | null
          location: string | null
          name: string
          property_type: string | null
          start_date: string | null
          status: string
          style_preference: string | null
          timeline_weeks: number | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area_sqft?: number | null
          assigned_supervisor?: string | null
          assigned_thekedar?: string | null
          budget?: number | null
          client_name?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          name: string
          property_type?: string | null
          start_date?: string | null
          status?: string
          style_preference?: string | null
          timeline_weeks?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area_sqft?: number | null
          assigned_supervisor?: string | null
          assigned_thekedar?: string | null
          budget?: number | null
          client_name?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          name?: string
          property_type?: string | null
          start_date?: string | null
          status?: string
          style_preference?: string | null
          timeline_weeks?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "main_admin"
        | "contractor"
        | "subcontractor"
        | "mistri"
        | "labour"
        | "super_admin"
        | "construction_head"
        | "interior_head"
        | "field_manager"
        | "accounts_manager"
        | "material_manager"
        | "hr_manager"
        | "site_supervisor"
        | "viewer"
        | "telecaller_manager"
        | "telecaller"
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
      app_role: [
        "main_admin",
        "contractor",
        "subcontractor",
        "mistri",
        "labour",
        "super_admin",
        "construction_head",
        "interior_head",
        "field_manager",
        "accounts_manager",
        "material_manager",
        "hr_manager",
        "site_supervisor",
        "viewer",
        "telecaller_manager",
        "telecaller",
      ],
    },
  },
} as const
