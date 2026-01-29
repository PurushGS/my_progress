import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Using localStorage fallback.');
  console.warn('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.warn('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
} else {
  console.log('✅ Supabase credentials found. Using Supabase for data storage.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Test connection function
export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) {
    console.error('❌ Supabase client not initialized');
    return false;
  }

  try {
    const { data, error } = await supabase.from('sprints').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
}

