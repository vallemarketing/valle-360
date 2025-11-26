const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials that we know are correct for the project we want to target
const supabaseUrl = 'https://ikjgsqtykkhqimypacro.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlramdzcXR5a2tocWlteXBhY3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTE4OTksImV4cCI6MjA3ODc4Nzg5OX0.vgVCpFIt-5ajFhcXg65dqrEw915pqW8fGZ8xgJxrnxI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAuthUser() {
  console.log('🔧 Iniciando correção de usuário via API...');
  
  const email = 'designer@valle360.com';
  const password = 'Valle@2024';

  // 1. Tentar login para ver se já está certo
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (!loginError && loginData.user) {
    console.log('✅ Login via API funcionou! O usuário e senha estão corretos no Supabase.');
    console.log('User ID:', loginData.user.id);
  } else {
    console.log('❌ Login via API falhou. Recriando usuário...');
    console.log('Erro:', loginError?.message);

    // 2. Se falhou, tentar criar (SignUp)
    // O SignUp pode falhar se o usuário já existe mas a senha está errada.
    // Como não tenho service_role aqui para deletar via admin api, 
    // vou assumir que o usuário foi deletado via SQL antes (vou rodar o SQL de delete antes de rodar esse script).
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Designer Valle'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Erro no SignUp:', signUpError.message);
    } else {
      console.log('✅ SignUp realizado com sucesso!');
      console.log('User ID:', signUpData.user?.id);
      
      // 3. Verificar se precisa de confirmação de email
      if (signUpData.session === null && signUpData.user) {
        console.log('⚠️ Usuário criado mas email não confirmado. Logar pode falhar se email confirm for required.');
      }
    }
  }
}

fixAuthUser();

