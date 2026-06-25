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
      appeals: {
        Row: {
          admin_note: string | null
          created_at: string | null
          email: string | null
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appeals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appeals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discord_roles: {
        Row: {
          discord_role_id: string
          name: string
        }
        Insert: {
          discord_role_id: string
          name: string
        }
        Update: {
          discord_role_id?: string
          name?: string
        }
        Relationships: []
      }
      inhouse_participants: {
        Row: {
          id: string
          joined_at: string | null
          room_id: string | null
          team: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          room_id?: string | null
          team?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          room_id?: string | null
          team?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inhouse_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "inhouse_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inhouse_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inhouse_rooms: {
        Row: {
          created_at: string | null
          game_type: string
          host_id: string | null
          id: string
          is_private: boolean | null
          max_players: number
          scheduled_at: string | null
          status: string
          team_mode: string
          tier_max: string | null
          tier_min: string | null
          title: string
          winner_team: string | null
        }
        Insert: {
          created_at?: string | null
          game_type?: string
          host_id?: string | null
          id?: string
          is_private?: boolean | null
          max_players?: number
          scheduled_at?: string | null
          status?: string
          team_mode?: string
          tier_max?: string | null
          tier_min?: string | null
          title: string
          winner_team?: string | null
        }
        Update: {
          created_at?: string | null
          game_type?: string
          host_id?: string | null
          id?: string
          is_private?: boolean | null
          max_players?: number
          scheduled_at?: string | null
          status?: string
          team_mode?: string
          tier_max?: string | null
          tier_min?: string | null
          title?: string
          winner_team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inhouse_rooms_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          admin_reply: string | null
          content: string
          created_at: string | null
          id: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          content: string
          created_at?: string | null
          id?: string
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          content?: string
          created_at?: string | null
          id?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_links: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          target_id: string
          token: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          target_id: string
          token?: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          target_id?: string
          token?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      manner_logs: {
        Row: {
          created_at: string
          delta: number
          from_user_id: string
          id: string
          match_id: string
          reason: Database["public"]["Enums"]["manner_reason"]
          to_user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          from_user_id: string
          id?: string
          match_id: string
          reason: Database["public"]["Enums"]["manner_reason"]
          to_user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          from_user_id?: string
          id?: string
          match_id?: string
          reason?: Database["public"]["Enums"]["manner_reason"]
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manner_logs_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manner_logs_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "scrim_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manner_logs_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      match_maps: {
        Row: {
          id: string
          map_name: string | null
          map_number: number | null
          match_id: string | null
          round_results: string | null
          team1_score: number | null
          team2_score: number | null
        }
        Insert: {
          id?: string
          map_name?: string | null
          map_number?: number | null
          match_id?: string | null
          round_results?: string | null
          team1_score?: number | null
          team2_score?: number | null
        }
        Update: {
          id?: string
          map_name?: string | null
          map_number?: number | null
          match_id?: string | null
          round_results?: string | null
          team1_score?: number | null
          team2_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_maps_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_player_stats: {
        Row: {
          acs: number | null
          adr: number | null
          assists: number | null
          deaths: number | null
          fd: number | null
          fk: number | null
          hs_pct: number | null
          id: string
          kast: number | null
          kills: number | null
          map_id: string | null
          match_id: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          acs?: number | null
          adr?: number | null
          assists?: number | null
          deaths?: number | null
          fd?: number | null
          fk?: number | null
          hs_pct?: number | null
          id?: string
          kast?: number | null
          kills?: number | null
          map_id?: string | null
          match_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          acs?: number | null
          adr?: number | null
          assists?: number | null
          deaths?: number | null
          fd?: number | null
          fk?: number | null
          hs_pct?: number | null
          id?: string
          kast?: number | null
          kills?: number | null
          map_id?: string | null
          match_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_player_stats_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "match_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_player_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_player_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_player_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      match_results: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          match_id: string
          score_away: number
          score_home: number
          submitted_by: string
          winner_team_id: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          match_id: string
          score_away?: number
          score_home?: number
          submitted_by: string
          winner_team_id: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          match_id?: string
          score_away?: number
          score_home?: number
          submitted_by?: string
          winner_team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_results_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "scrim_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          discord_channel_id: string | null
          format: string | null
          id: string
          match_date: string | null
          scrim_post_id: string | null
          status: string | null
          team1_id: string | null
          team2_id: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          discord_channel_id?: string | null
          format?: string | null
          id?: string
          match_date?: string | null
          scrim_post_id?: string | null
          status?: string | null
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          discord_channel_id?: string | null
          format?: string | null
          id?: string
          match_date?: string | null
          scrim_post_id?: string | null
          status?: string | null
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_scrim_post_id_fkey"
            columns: ["scrim_post_id"]
            isOneToOne: false
            referencedRelation: "scrim_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team1_id_fkey"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_id_fkey"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaking_queue: {
        Row: {
          created_at: string | null
          format: string
          game_type: string
          id: string
          match_id: string | null
          server: string
          status: string
          team_id: string | null
          tier_rank: number
        }
        Insert: {
          created_at?: string | null
          format?: string
          game_type: string
          id?: string
          match_id?: string | null
          server?: string
          status?: string
          team_id?: string | null
          tier_rank?: number
        }
        Update: {
          created_at?: string | null
          format?: string
          game_type?: string
          id?: string
          match_id?: string | null
          server?: string
          status?: string
          team_id?: string | null
          tier_rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "matchmaking_queue_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaking_queue_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      no_show_reports: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          match_id: string
          reported_team_id: string
          reporter_team_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          match_id: string
          reported_team_id: string
          reporter_team_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          match_id?: string
          reported_team_id?: string
          reporter_team_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "no_show_reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "scrim_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "no_show_reports_reported_team_id_fkey"
            columns: ["reported_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "no_show_reports_reporter_team_id_fkey"
            columns: ["reporter_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          link: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_posts: {
        Row: {
          created_at: string | null
          discord_tag: string | null
          game_type: string
          id: string
          note: string | null
          roles: string[] | null
          status: string | null
          team_id: string | null
          tier: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discord_tag?: string | null
          game_type: string
          id?: string
          note?: string | null
          roles?: string[] | null
          status?: string | null
          team_id?: string | null
          tier?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          discord_tag?: string | null
          game_type?: string
          id?: string
          note?: string | null
          roles?: string[] | null
          status?: string | null
          team_id?: string | null
          tier?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_posts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          action: string | null
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          action?: string | null
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scrim_applications: {
        Row: {
          applying_team_id: string
          created_at: string | null
          id: string
          match_id: string | null
          scrim_post_id: string
          status: string | null
        }
        Insert: {
          applying_team_id: string
          created_at?: string | null
          id?: string
          match_id?: string | null
          scrim_post_id: string
          status?: string | null
        }
        Update: {
          applying_team_id?: string
          created_at?: string | null
          id?: string
          match_id?: string | null
          scrim_post_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrim_applications_applying_team_id_fkey"
            columns: ["applying_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrim_applications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrim_applications_scrim_post_id_fkey"
            columns: ["scrim_post_id"]
            isOneToOne: false
            referencedRelation: "scrim_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      scrim_matches: {
        Row: {
          away_confirmed: boolean
          away_team_id: string
          created_at: string
          game_type: Database["public"]["Enums"]["game_type"]
          home_confirmed: boolean
          home_team_id: string
          id: string
          post_id: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["match_status"]
        }
        Insert: {
          away_confirmed?: boolean
          away_team_id: string
          created_at?: string
          game_type: Database["public"]["Enums"]["game_type"]
          home_confirmed?: boolean
          home_team_id: string
          id?: string
          post_id?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["match_status"]
        }
        Update: {
          away_confirmed?: boolean
          away_team_id?: string
          created_at?: string
          game_type?: Database["public"]["Enums"]["game_type"]
          home_confirmed?: boolean
          home_team_id?: string
          id?: string
          post_id?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["match_status"]
        }
        Relationships: [
          {
            foreignKeyName: "scrim_matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrim_matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scrim_matches_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "scrim_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      scrim_posts: {
        Row: {
          created_at: string
          format: string
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          note: string | null
          preferred_date: string
          server: string | null
          status: Database["public"]["Enums"]["scrim_post_status"]
          team_id: string
          tier_max: string | null
          tier_min: string | null
          tier_range_max: string | null
          tier_range_min: string | null
        }
        Insert: {
          created_at?: string
          format?: string
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          note?: string | null
          preferred_date: string
          server?: string | null
          status?: Database["public"]["Enums"]["scrim_post_status"]
          team_id: string
          tier_max?: string | null
          tier_min?: string | null
          tier_range_max?: string | null
          tier_range_min?: string | null
        }
        Update: {
          created_at?: string
          format?: string
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          note?: string | null
          preferred_date?: string
          server?: string | null
          status?: Database["public"]["Enums"]["scrim_post_status"]
          team_id?: string
          tier_max?: string | null
          tier_min?: string | null
          tier_range_max?: string | null
          tier_range_min?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scrim_posts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string
          invited_user_id: string
          status: string | null
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by: string
          invited_user_id: string
          status?: string | null
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string
          invited_user_id?: string
          status?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invites_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_join_requests: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_join_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          is_igl: boolean | null
          joined_at: string
          role: Database["public"]["Enums"]["member_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_igl?: boolean | null
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_igl?: boolean | null
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          team_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          team_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          abbreviation: string | null
          captain_id: string
          created_at: string
          discord_role_id: string | null
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          is_open: boolean | null
          logo_url: string | null
          loss_count: number
          losses: number | null
          name: string
          tier_avg: string | null
          win_count: number
          wins: number | null
        }
        Insert: {
          abbreviation?: string | null
          captain_id: string
          created_at?: string
          discord_role_id?: string | null
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          is_open?: boolean | null
          logo_url?: string | null
          loss_count?: number
          losses?: number | null
          name: string
          tier_avg?: string | null
          win_count?: number
          wins?: number | null
        }
        Update: {
          abbreviation?: string | null
          captain_id?: string
          created_at?: string
          discord_role_id?: string | null
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          is_open?: boolean | null
          logo_url?: string | null
          loss_count?: number
          losses?: number | null
          name?: string
          tier_avg?: string | null
          win_count?: number
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          discord_id: string | null
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          is_admin: boolean
          is_banned: boolean
          lol_gamename: string | null
          lol_tagline: string | null
          lol_tier: string | null
          manner_score: number
          rank: string | null
          riot_gamename: string | null
          riot_puuid: string | null
          riot_tagline: string | null
          summoner_name: string | null
          suspended: boolean
          suspended_at: string | null
          tier: string | null
          updated_at: string
          val_gamename: string | null
          val_tagline: string | null
          val_tier: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          discord_id?: string | null
          game_type?: Database["public"]["Enums"]["game_type"]
          id: string
          is_admin?: boolean
          is_banned?: boolean
          lol_gamename?: string | null
          lol_tagline?: string | null
          lol_tier?: string | null
          manner_score?: number
          rank?: string | null
          riot_gamename?: string | null
          riot_puuid?: string | null
          riot_tagline?: string | null
          summoner_name?: string | null
          suspended?: boolean
          suspended_at?: string | null
          tier?: string | null
          updated_at?: string
          val_gamename?: string | null
          val_tagline?: string | null
          val_tier?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          discord_id?: string | null
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          is_admin?: boolean
          is_banned?: boolean
          lol_gamename?: string | null
          lol_tagline?: string | null
          lol_tier?: string | null
          manner_score?: number
          rank?: string | null
          riot_gamename?: string | null
          riot_puuid?: string | null
          riot_tagline?: string | null
          summoner_name?: string | null
          suspended?: boolean
          suspended_at?: string | null
          tier?: string | null
          updated_at?: string
          val_gamename?: string | null
          val_tagline?: string | null
          val_tier?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_losses: { Args: { team_id: string }; Returns: undefined }
      increment_wins: { Args: { team_id: string }; Returns: undefined }
    }
    Enums: {
      game_type: "valorant" | "lol"
      manner_reason: "no_show" | "toxic" | "gg" | "positive"
      match_status: "scheduled" | "played" | "no_show" | "cancelled"
      member_role:
        | "captain"
        | "member"
        | "player"
        | "igl"
        | "head_coach"
        | "coach"
      report_status: "pending" | "confirmed" | "rejected"
      scrim_post_status: "open" | "matched" | "done" | "cancelled"
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
      game_type: ["valorant", "lol"],
      manner_reason: ["no_show", "toxic", "gg", "positive"],
      match_status: ["scheduled", "played", "no_show", "cancelled"],
      member_role: [
        "captain",
        "member",
        "player",
        "igl",
        "head_coach",
        "coach",
      ],
      report_status: ["pending", "confirmed", "rejected"],
      scrim_post_status: ["open", "matched", "done", "cancelled"],
    },
  },
} as const
