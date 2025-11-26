const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ikjgsqtykkhqimypacro.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlramdzcXR5a2tocWlteXBhY3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTE4OTksImV4cCI6MjA3ODc4Nzg5OX0.vgVCpFIt-5ajFhcXg65dqrEw915pqW8fGZ8xgJxrnxI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  console.log('🔧 Iniciando correção automática do banco de dados...');

  // 1. Tentar descobrir a estrutura da tabela employees
  console.log('🔍 Verificando estrutura da tabela employees...');
  const { data: employeesData, error: employeesError } = await supabase
    .from('employees')
    .select('*')
    .limit(1);

  if (employeesError) {
    console.log('❌ Erro ao ler employees:', employeesError.message);
  } else {
    console.log('✅ Tabela employees acessível. Colunas detectadas:', employeesData.length > 0 ? Object.keys(employeesData[0]) : 'Nenhum dado para inferir colunas');
  }

  // 2. Executar SQL de correção via RPC (se disponível) ou instruir usuário
  console.log('⚙️  Tentando criar usuário via código direto...');

  const email = 'designer@valle360.com';
  const password = 'Valle@2024';

  // 2.1 Criar Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Designer Valle'
      }
    }
  });

  if (authError) {
    console.log('ℹ️  Usuário Auth já existe ou erro:', authError.message);
  } else {
    console.log('✅ Usuário Auth criado/verificado:', authData.user?.id);
  }

  const userId = authData.user?.id || (await supabase.auth.signInWithPassword({ email, password })).data.user?.id;

  if (!userId) {
    console.error('❌ Falha crítica: Não consegui obter o ID do usuário.');
    return;
  }

  console.log(`🆔 User ID alvo: ${userId}`);

  // 2.2 Inserir em Employees (Tentativa Adaptativa)
  const employeePayload = {
    user_id: userId,
    role: 'colaborador',
    area: 'Designer',
    active: true,
    // Tentar campos comuns
    first_name: 'Designer',
    last_name: 'Valle'
  };

  // Tenta inserir com first_name/last_name
  let { error: empInsertError } = await supabase
    .from('employees')
    .upsert(employeePayload, { onConflict: 'user_id' });

  if (empInsertError) {
    console.log(`⚠️  Falha com first_name/last_name: ${empInsertError.message}`);
    console.log('🔄 Tentando com coluna "name"...');
    
    delete employeePayload.first_name;
    delete employeePayload.last_name;
    employeePayload.name = 'Designer Valle';

    const { error: empInsertError2 } = await supabase
      .from('employees')
      .upsert(employeePayload, { onConflict: 'user_id' });
      
    if (empInsertError2) {
      console.error(`❌ Falha também com "name": ${empInsertError2.message}`);
      console.log('🚨 O esquema da tabela employees está diferente do esperado.');
    } else {
      console.log('✅ Sucesso! Inserido em employees usando coluna "name".');
    }
  } else {
    console.log('✅ Sucesso! Inserido em employees usando first_name/last_name.');
  }

  // 2.3 Inserir em User Profiles
  console.log('👤 Atualizando user_profiles...');
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
    console.error('❌ Erro em user_profiles:', profileError.message);
  } else {
    console.log('✅ User Profile atualizado.');
  }

  console.log('\n🎉 Processo finalizado. Tente fazer login agora!');
}

fixDatabase();

