import { createClient } from '@supabase/supabase-js';

// Hardcoded para teste rápido
const supabaseUrl = 'https://ojlcvpqhbfnehuferyci.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbGN2cHFoYmZuZWh1ZmVyeWNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEzNDE1OSwiZXhwIjoyMDc4NzEwMTU5fQ.zyqsVmk0IblR8VKwd5PBqMrP-5VA_He9Cz5GMlS_mbo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWebDesigner() {
  const email = 'web@valle360.com';
  console.log(`🔍 Diagnóstico para: ${email}`);

  // 1. Auth
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    console.error('❌ Usuário não encontrado no Auth.');
    return;
  }
  console.log('✅ ID:', user.id);

  // 2. Employee Table (onde a role "Web Designer" pode estar escrita de várias formas)
  const { data: emp } = await supabase.from('employees').select('*').eq('user_id', user.id).single();
  console.log('📋 Tabela employees:');
  console.log('   - Department:', emp?.department);
  console.log('   - Position:', emp?.position);
  console.log('   - Area of Expertise:', emp?.area_of_expertise);

  // 3. User Profile
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
  console.log('👤 Tabela user_profiles:', profile);
}

checkWebDesigner();





