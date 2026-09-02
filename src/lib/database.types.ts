/**
 * src/lib/database.types.ts
 * Types TypeScript générés manuellement depuis le schéma de migrations F1 + CORE-1.
 *
 * IMPORTANT: Régénérer après chaque modification de migration :
 *   supabase gen types typescript --local > src/lib/database.types.ts
 *
 * Fichier généré manuellement (Docker non disponible dans cet env de build).
 * À régénérer via CLI lors du premier `supabase start`.
 *
 * @generated — ne pas modifier manuellement après régénération CLI.
 * STACKED_ON_UNMERGED_F1: OUI
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MembershipRole = "owner" | "admin" | "staff" | "viewer";
export type RoomOperationalStatusEnum = "active" | "inactive" | "out_of_service";

export interface Database {
  public: {
    Tables: {
      // ─── F1 ───────────────────────────────────────────────────────────────
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          tenant_id: string;
          role: MembershipRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tenant_id: string;
          role: MembershipRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tenant_id?: string;
          role?: MembershipRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memberships_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      // ─── CORE-1 ───────────────────────────────────────────────────────────
      room_categories: {
        Row: {
          id: string;
          tenant_id: string;
          code: string;
          name: string;
          description: string | null;
          base_occupancy: number;
          max_adults: number;
          max_children: number;
          max_occupancy: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          code: string;
          name: string;
          description?: string | null;
          base_occupancy?: number;
          max_adults?: number;
          max_children?: number;
          max_occupancy?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          base_occupancy?: number;
          max_adults?: number;
          max_children?: number;
          max_occupancy?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "room_categories_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      rooms: {
        Row: {
          id: string;
          tenant_id: string;
          room_category_id: string;
          code: string;
          name: string | null;
          floor: string | null;
          description: string | null;
          operational_status: RoomOperationalStatusEnum;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          room_category_id: string;
          code: string;
          name?: string | null;
          floor?: string | null;
          description?: string | null;
          operational_status?: RoomOperationalStatusEnum;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          room_category_id?: string;
          code?: string;
          name?: string | null;
          floor?: string | null;
          description?: string | null;
          operational_status?: RoomOperationalStatusEnum;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rooms_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rooms_room_category_id_fkey";
            columns: ["room_category_id"];
            isOneToOne: false;
            referencedRelation: "room_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_operational_settings: {
        Row: {
          tenant_id: string;
          timezone: string;
          currency_code: string;
          locale: string;
          check_in_time: string | null;
          check_out_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tenant_id: string;
          timezone?: string;
          currency_code?: string;
          locale?: string;
          check_in_time?: string | null;
          check_out_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tenant_id?: string;
          timezone?: string;
          currency_code?: string;
          locale?: string;
          check_in_time?: string | null;
          check_out_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_operational_settings_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: true;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      membership_role: MembershipRole;
      room_operational_status: RoomOperationalStatusEnum;
    };
    CompositeTypes: Record<string, never>;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
// F1
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
// CORE-1
export type RoomCategory = Database["public"]["Tables"]["room_categories"]["Row"];
export type RoomCategoryInsert = Database["public"]["Tables"]["room_categories"]["Insert"];
export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
export type TenantOperationalSettings =
  Database["public"]["Tables"]["tenant_operational_settings"]["Row"];
