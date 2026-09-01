/**
 * src/lib/database.types.ts
 * Types TypeScript générés manuellement depuis le schéma de migration F1.
 *
 * IMPORTANT: Ces types doivent être régénérés après chaque modification de migration :
 *   supabase gen types typescript --local > src/lib/database.types.ts
 *
 * Fichier généré la première fois manuellement car Docker n'était pas disponible
 * dans l'environnement de build. À régénérer via CLI lors du premier `supabase start`.
 *
 * @generated — ne pas modifier manuellement après régénération CLI.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MembershipRole = "owner" | "admin" | "staff" | "viewer";

export interface Database {
  public: {
    Tables: {
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      membership_role: MembershipRole;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Helpers de raccourci pour les types de tables
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
