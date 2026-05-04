-- Phase 1: Migrate from 5 roles to 9 roles
-- Add new role values to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'construction_head';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'interior_head';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'field_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'accounts_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'material_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hr_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'site_supervisor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';