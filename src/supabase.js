import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://divrutcnpojwnxithlqg.supabase.co';
const supabaseAnonKey = 'sb_publishable_3SBySft4ko4NjhABPN9Hlg_hO4SYGdf';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
