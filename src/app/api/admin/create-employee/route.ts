import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nome, 
      sobrenome, 
      email, 
      emailPessoal,
      telefone,
      senha,
      areas,
      dataNascimento,
      contatoEmergencia,
      telefoneEmergencia,
      chavePix,
      fotoUrl,
      nivelHierarquico
    } = body

    // Criar cliente Supabase com Service Role (BYPASSA RLS)
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

    // 1. Criar usuário no auth.users usando Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        full_name: `${nome} ${sobrenome}`,
        role: 'employee'
      }
    })

    if (authError) {
      console.error('Erro ao criar no auth:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // 2. Criar na tabela users (com Service Role bypassa RLS)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: `${nome} ${sobrenome}`,
        role: 'employee',
        is_active: true,
        email_verified: true,
        two_factor_enabled: false,
        last_login_at: null
      })
      .select()
      .single()

    if (userError) {
      console.error('Erro ao criar na tabela users:', userError)
      // Se falhar, deletar o usuário do auth
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    // 3. Criar na tabela employees
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        user_id: userId,
        full_name: `${nome} ${sobrenome}`,
        email,
        phone: telefone,
        avatar: fotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        department: areas[0] || 'Geral',
        position: nivelHierarquico === 'lider' ? 'Líder' : 'Colaborador',
        area_of_expertise: areas.join(', '),
        hire_date: new Date().toISOString().split('T')[0],
        birth_date: dataNascimento || null,
        emergency_contact: contatoEmergencia || null,
        emergency_phone: telefoneEmergencia || null,
        pix_key: chavePix || null,
        is_active: true
      })
      .select()
      .single()

    if (employeeError) {
      console.error('Erro ao criar employee:', employeeError)
      // Rollback: deletar users e auth
      await supabaseAdmin.from('users').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: employeeError.message }, { status: 400 })
    }

    // 4. Criar permissões básicas
    const permissoesBasicas = [
      { name: 'dashboard', description: 'Acesso ao dashboard' },
      { name: 'kanban', description: 'Acesso ao Kanban' },
      { name: 'messages', description: 'Sistema de mensagens' },
      { name: 'files', description: 'Gerenciador de arquivos' }
    ]

    for (const permissao of permissoesBasicas) {
      await supabaseAdmin.from('employee_permissions').insert({
        employee_id: employeeData.id,
        permission_name: permissao.name,
        permission_description: permissao.description,
        is_active: true
      })
    }

    console.log('✅ Colaborador criado com sucesso:', email)

    return NextResponse.json({
      success: true,
      userId,
      employeeId: employeeData.id,
      email,
      emailPessoal
    })

  } catch (error: any) {
    console.error('Erro geral ao criar colaborador:', error)
    return NextResponse.json({
      error: error.message || 'Erro desconhecido'
    }, { status: 500 })
  }
}



