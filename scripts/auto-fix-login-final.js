const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ikjgsqtykkhqimypacro.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlramdzcXR5a2tocWlteXBhY3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTE4OTksImV4cCI6MjA3ODc4Nzg5OX0.vgVCpFIt-5ajFhcXg65dqrEw915pqW8fGZ8xgJxrnxI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseFinal() {
  console.log('🔧 Iniciando correção FINAL (Baseada nas colunas detectadas)...');

  const email = 'designer@valle360.com';
  const password = 'Valle@2024';

  // 1. Obter User ID
  const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
  let userId = loginData.user?.id;

  if (!userId) {
    console.log('Criando usuário Auth...');
    const { data: signUpData } = await supabase.auth.signUp({ email, password });
    userId = signUpData.user?.id;
  }

  if (!userId) {
    console.error('❌ Não foi possível obter o User ID.');
    return;
  }

  console.log(`🆔 User ID: ${userId}`);

  // 2. Inserir em Employees usando APENAS colunas que existem
  // Colunas detectadas: id, user_id, full_name, email, phone, avatar, department, position, area_of_expertise, is_active...
  const employeePayload = {
    user_id: userId,
    full_name: 'Designer Valle',
    email: email,
    department: 'Design',
    position: 'Designer',
    area_of_expertise: 'Designer', // Importante para o dashboard
    is_active: true // Usar is_active em vez de active
  };

  console.log('📝 Inserindo em employees...');
  const { error: empError } = await supabase
    .from('employees')
    .upsert(employeePayload, { onConflict: 'user_id' });

  if (empError) {
    console.error(`❌ Erro ao inserir em employees: ${empError.message}`);
  } else {
    console.log('✅ Sucesso! Tabela employees atualizada.');
  }

  // 3. Inserir em User Profiles
  console.log('📝 Inserindo em user_profiles...');
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      email: email,
      full_name: 'Designer Valle',
      user_type: 'employee',
      is_active: true
    }, { onConflict: 'user_id' });

  if (profileError) {
    console.error(`❌ Erro ao inserir em user_profiles: ${profileError.message}`);
  } else {
    console.log('✅ Sucesso! Tabela user_profiles atualizada.');
  }

  console.log('\n🎉 TUDO PRONTO! Pode logar.');
}

fixDatabaseFinal();

