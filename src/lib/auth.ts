import { supabase } from './supabase';

export type UserRole = 'super_admin' | 'colaborador' | 'employee' | 'cliente';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function signUp(email: string, password: string, name: string, role: UserRole, phone?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        phone
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  console.log('🔍 getCurrentUser: Iniciando busca de usuário...');
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e7496d7c-c166-4b65-854d-05abdab472d9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:46',message:'Getting current user',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'login-loop'})}).catch(()=>{});
  // #endregion
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('❌ getCurrentUser: Nenhum usuário autenticado');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e7496d7c-c166-4b65-854d-05abdab472d9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:50',message:'No authenticated user',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'login-loop'})}).catch(()=>{});
    // #endregion
    return null;
  }

  console.log('✅ getCurrentUser: Usuário autenticado:', user.email, 'ID:', user.id);

  // Tentar buscar role do user_profiles primeiro
  console.log('📋 getCurrentUser: Buscando em user_profiles...');
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('full_name, role, user_type')
    .eq('user_id', user.id)
    .single();

  console.log('📋 getCurrentUser: Resultado user_profiles:', profileData, 'Erro:', profileError);

  if (profileData) {
    // Normalizar 'employee' para 'colaborador' para compatibilidade
    let role = (profileData.user_type || profileData.role) as UserRole;
    console.log('🔄 getCurrentUser: Role original do profile:', role);
    if (role === 'employee') {
      console.log('🔄 getCurrentUser: Normalizando employee → colaborador');
      role = 'colaborador';
    }
    const userData = {
      id: user.id,
      email: user.email!,
      name: profileData.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
      role: role || 'super_admin' // Default para super_admin se não encontrar
    };
    console.log('✅ getCurrentUser: Retornando dados do user_profiles:', userData);
    return userData;
  }

  // Fallback: tentar buscar da tabela users
  console.log('📋 getCurrentUser: Buscando em users...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('full_name, role, user_type')
    .eq('id', user.id)
    .single();

  console.log('📋 getCurrentUser: Resultado users:', userData, 'Erro:', userError);

  if (userData) {
    // Normalizar 'employee' para 'colaborador' para compatibilidade
    let role = (userData.user_type || userData.role) as UserRole;
    console.log('🔄 getCurrentUser: Role original do users:', role);
    if (role === 'employee') {
      console.log('🔄 getCurrentUser: Normalizando employee → colaborador');
      role = 'colaborador';
    }
    const finalUserData = {
      id: user.id,
      email: user.email!,
      name: userData.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
      role: role || 'colaborador'
    };
    console.log('✅ getCurrentUser: Retornando dados do users:', finalUserData);
    return finalUserData;
  }

  // Último fallback: usar metadata ou definir como super_admin se for email Valle
  const isValleEmail = user.email?.includes('@vallegroup.com.br') || user.email?.includes('@valle360.com.br');
  console.log('📧 getCurrentUser: Email Valle?', isValleEmail);
  
  const fallbackData = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || user.email?.split('@')[0] || '',
    role: isValleEmail ? 'super_admin' : (user.user_metadata?.role as UserRole || 'cliente')
  };
  console.log('⚠️ getCurrentUser: Usando fallback:', fallbackData);
  return fallbackData;
}

export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/admin/dashboard';
    case 'colaborador':
    case 'employee':  // Mapear employee para mesma rota de colaborador
      return '/colaborador/dashboard';
    case 'cliente':
      return '/cliente/dashboard';
    default:
      return '/cliente/dashboard';
  }
}

export async function verifyUserRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export function getRoleFromPath(path: string): UserRole | null {
  if (path.startsWith('/admin')) return 'super_admin';
  if (path.startsWith('/app')) return 'colaborador';
  if (path.startsWith('/cliente')) return 'cliente';
  return null;
}
