import { Database } from '@supabase/supabase-js';

declare global {
  type Tables = Database['public']['Tables'];
  type Enums = Database['public']['Enums'];
} 