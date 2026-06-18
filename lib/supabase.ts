import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://byjletcedogrbebccvoq.supabase.co';

const supabaseAnonKey =
  'sb_publishable_srVw6em-hYnL1URLksiplQ_frsC7xSh';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);