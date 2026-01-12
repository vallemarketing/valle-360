import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getSupabaseAdmin } from '@/lib/admin/supabaseAdmin';

export const dynamic = 'force-dynamic';

// GET - Obter detalhes de um colaborador específico
export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.res;

  const { employeeId } = params;
  const db = getSupabaseAdmin();

  try {
    // Buscar dados do employee
    const { data: employee, error: empError } = await db
      .from('employees')
      .select('*')
      .eq('user_id', employeeId)
      .single();

    if (empError || !employee) {
      return NextResponse.json(
        { error: 'Colaborador não encontrado' },
        { status: 404 }
      );
    }

    // Buscar dados do usuário
    const { data: user } = await db
      .from('users')
      .select('*')
      .eq('id', employeeId)
      .single();

    return NextResponse.json({
      employee: {
        ...employee,
        user,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar colaborador' },
      { status: 500 }
    );
  }
}

// Função auxiliar para deletar email do cPanel
async function deleteCpanelEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const cpanelUser = process.env.CPANEL_USER;
    const cpanelPassword = process.env.CPANEL_PASSWORD;
    const cpanelDomain = process.env.CPANEL_DOMAIN;

    if (!cpanelUser || !cpanelPassword || !cpanelDomain) {
      console.warn('⚠️ Credenciais do cPanel não configuradas - pulando exclusão de email');
      return { success: true, message: 'cPanel não configurado, email não deletado' };
    }

    const [username, domain] = email.split('@');
    if (!username || !domain) {
      return { success: false, message: 'Email inválido' };
    }

    const basicAuth = Buffer.from(`${cpanelUser}:${cpanelPassword}`).toString('base64');
    
    // Normalizar URL do cPanel
    let baseUrl = cpanelDomain.trim();
    if (!/^https?:\/\//i.test(baseUrl)) {
      baseUrl = `https://${baseUrl}`;
    }
    baseUrl = baseUrl.replace(/\/+$/, '');

    const apiUrl = `${baseUrl}/execute/Email/delete_pop?email=${encodeURIComponent(username)}&domain=${encodeURIComponent(domain)}`;

    console.log(`🗑️ Deletando email do cPanel: ${email}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('⚠️ cPanel retornou resposta não-JSON');
      return { success: false, message: 'cPanel retornou resposta inválida' };
    }

    const data = await response.json();

    if (data.result?.status === 1 || data.status === 1) {
      console.log(`✅ Email deletado do cPanel: ${email}`);
      return { success: true, message: 'Email deletado do cPanel' };
    } else {
      const errors = data.result?.errors || data.errors || [];
      const emailNotExists = errors.some((e: string) => 
        e.toLowerCase().includes('does not exist')
      );
      
      if (emailNotExists) {
        return { success: true, message: 'Email já não existe no cPanel' };
      }

      console.error('❌ Erro ao deletar email do cPanel:', errors);
      return { success: false, message: errors.join(', ') };
    }
  } catch (error: any) {
    console.error('Erro ao deletar email do cPanel:', error);
    return { success: false, message: error.message };
  }
}

// DELETE - Excluir um colaborador
export async function DELETE(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.res;

  const { employeeId } = params;
  const db = getSupabaseAdmin();

  try {
    // Primeiro, verificar se o colaborador existe
    const { data: employee, error: checkError } = await db
      .from('employees')
      .select('id, user_id, first_name, last_name')
      .eq('user_id', employeeId)
      .single();

    if (checkError || !employee) {
      return NextResponse.json(
        { error: 'Colaborador não encontrado' },
        { status: 404 }
      );
    }

    // Buscar email do usuário para deletar do cPanel
    let userEmail = '';
    const { data: user } = await db
      .from('users')
      .select('email')
      .eq('id', employeeId)
      .single();
    
    if (user?.email) {
      userEmail = user.email;
    }

    // Deletar email do cPanel (se configurado)
    let cpanelResult = { success: true, message: '' };
    if (userEmail && userEmail.includes('@')) {
      cpanelResult = await deleteCpanelEmail(userEmail);
      console.log(`📧 cPanel delete result: ${cpanelResult.message}`);
    }

    // Deletar atribuições de clientes
    await db
      .from('employee_client_assignments')
      .delete()
      .eq('employee_id', employeeId);

    // Deletar registro do employee
    const { error: deleteEmpError } = await db
      .from('employees')
      .delete()
      .eq('user_id', employeeId);

    if (deleteEmpError) {
      console.error('Erro ao deletar employee:', deleteEmpError);
    }

    // Atualizar user_profiles para marcar como inativo (soft delete)
    await db
      .from('user_profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', employeeId);

    // Atualizar users para marcar como deletado
    await db
      .from('users')
      .update({ 
        account_status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    // Deletar o usuário do Auth (hard delete)
    try {
      const { error: authError } = await db.auth.admin.deleteUser(employeeId);
      if (authError) {
        console.warn('Aviso: Não foi possível deletar usuário do Auth:', authError.message);
      }
    } catch (authErr) {
      console.warn('Aviso: Erro ao tentar deletar do Auth:', authErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Colaborador excluído com sucesso',
      deleted: {
        name: `${employee.first_name} ${employee.last_name}`,
        id: employeeId,
        email: userEmail,
      },
      cpanel: cpanelResult,
    });
  } catch (error: any) {
    console.error('Erro ao excluir colaborador:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir colaborador' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar dados do colaborador
export async function PATCH(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.res;

  const { employeeId } = params;
  const db = getSupabaseAdmin();
  const body = await request.json();

  try {
    // Atualizar employee
    if (body.first_name || body.last_name || body.areas || body.whatsapp) {
      const { error: empError } = await db
        .from('employees')
        .update({
          ...(body.first_name && { first_name: body.first_name }),
          ...(body.last_name && { last_name: body.last_name }),
          ...(body.areas && { areas: body.areas }),
          ...(body.whatsapp && { whatsapp: body.whatsapp }),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', employeeId);

      if (empError) throw empError;
    }

    // Atualizar user_profiles
    if (body.full_name || body.phone) {
      await db
        .from('user_profiles')
        .update({
          ...(body.full_name && { full_name: body.full_name }),
          ...(body.phone && { phone: body.phone }),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', employeeId);
    }

    return NextResponse.json({
      success: true,
      message: 'Colaborador atualizado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar colaborador:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar colaborador' },
      { status: 500 }
    );
  }
}
