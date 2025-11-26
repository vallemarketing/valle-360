import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Criar cliente Supabase com Service Role (admin powers)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const userId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'
    const email = 'guilherme@vallegroup.com.br'
    const password = '*Valle2307'

    // 1. Deletar usuário existente se houver
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.log('Usuário antigo deletado')
    } catch (deleteError) {
      console.log('Nenhum usuário antigo encontrado')
    }

    // 2. Criar novo usuário no auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      id: userId,
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Guilherme Valle',
        role: 'super_admin'
      },
      app_metadata: {
        provider: 'email',
        providers: ['email'],
        role: 'super_admin'
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário auth:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log('✅ Usuário criado no auth.users:', authData.user.id)

    // 3. Atualizar user_profiles
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: userId,
        user_id: userId,
        full_name: 'Guilherme Valle',
        email,
        role: 'super_admin',
        user_type: 'super_admin',
        is_active: true,
        phone: '(11) 99999-9999',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
    } else {
      console.log('✅ Perfil criado/atualizado')
    }

    // 4. Atualizar users
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email,
        full_name: 'Guilherme Valle',
        role: 'super_admin',
        is_active: true,
        email_verified: true,
        two_factor_enabled: false,
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (usersError) {
      console.error('Erro ao criar user:', usersError)
    } else {
      console.log('✅ User criado/atualizado')
    }

    // 5. Verificar se employee existe
    const { data: existingEmployee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('email', email)
      .single()

    let employeeId = existingEmployee?.id

    if (!employeeId) {
      // Criar employee se não existir
      const { data: newEmployee, error: employeeError } = await supabaseAdmin
        .from('employees')
        .insert({
          user_id: userId,
          full_name: 'Guilherme Valle',
          email,
          phone: '(11) 99999-9999',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guilherme',
          department: 'Administração',
          position: 'CEO',
          area_of_expertise: 'Gestão',
          hire_date: '2020-01-01',
          birth_date: '1985-01-01',
          emergency_contact: 'Contato Emergência',
          emergency_phone: '(11) 98888-8888',
          pix_key: email,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (employeeError) {
        console.error('Erro ao criar employee:', employeeError)
      } else {
        employeeId = newEmployee.id
        console.log('✅ Employee criado:', employeeId)
      }
    }

    return NextResponse.json({
      success: true,
      message: '✅ Admin Guilherme criado com sucesso!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'super_admin'
      },
      credentials: {
        email,
        password,
        loginUrl: 'http://localhost:3000/login'
      }
    })

  } catch (error: any) {
    console.error('Erro geral:', error)
    return NextResponse.json({
      error: error.message || 'Erro desconhecido'
    }, { status: 500 })
  }
}



