import { supabase } from './supabase';

export async function runDiagnostics(): Promise<void> {
  console.log('🔍 Running Supabase diagnostics...');
  
  if (!supabase) {
    console.error('❌ Supabase client is null');
    console.log('Check:');
    console.log('1. NEXT_PUBLIC_SUPABASE_URL is set:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('2. NEXT_PUBLIC_SUPABASE_ANON_KEY is set:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    return;
  }

  console.log('✅ Supabase client initialized');

  // Test sprints table
  console.log('\n📊 Testing sprints table...');
  try {
    const { data: sprintsData, error: sprintsError } = await supabase
      .from('sprints')
      .select('*')
      .limit(1);

    if (sprintsError) {
      console.error('❌ Sprints table error:', sprintsError);
      if (sprintsError.code === '42P01') {
        console.error('💡 Table "sprints" does not exist. Run the SQL schema!');
      } else if (sprintsError.code === '42501') {
        console.error('💡 Permission denied. Check RLS policies!');
      }
    } else {
      console.log('✅ Sprints table accessible');
      console.log(`   Found ${sprintsData?.length || 0} sprints`);
    }
  } catch (error) {
    console.error('❌ Exception testing sprints:', error);
  }

  // Test tasks table
  console.log('\n📋 Testing tasks table...');
  try {
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);

    if (tasksError) {
      console.error('❌ Tasks table error:', tasksError);
      if (tasksError.code === '42P01') {
        console.error('💡 Table "tasks" does not exist. Run the SQL schema!');
      } else if (tasksError.code === '42501') {
        console.error('💡 Permission denied. Check RLS policies!');
      }
    } else {
      console.log('✅ Tasks table accessible');
      console.log(`   Found ${tasksData?.length || 0} tasks`);
    }
  } catch (error) {
    console.error('❌ Exception testing tasks:', error);
  }

  // Test insert capability
  console.log('\n💾 Testing insert capability...');
  try {
    const testSprint = {
      id: `test-${Date.now()}`,
      name: 'Test Sprint',
      goal: 'Testing connection',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      status: 'planning',
      capacity: 25,
    };

    const { data: insertData, error: insertError } = await supabase
      .from('sprints')
      .insert(testSprint)
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error message:', insertError.message);
      console.error('Error details:', insertError.details);
    } else {
      console.log('✅ Insert test successful');
      // Clean up test data
      await supabase.from('sprints').delete().eq('id', testSprint.id);
      console.log('   Test data cleaned up');
    }
  } catch (error) {
    console.error('❌ Exception in insert test:', error);
  }

  console.log('\n✅ Diagnostics complete');
}

