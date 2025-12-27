import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export { projectId, publicAnonKey };

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a0489752`;
