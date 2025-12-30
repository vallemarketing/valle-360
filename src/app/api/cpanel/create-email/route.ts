import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

function normalizeCpanelBaseUrl(raw: string) {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return ''

  const withScheme =
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  // Remove trailing slash
  return withScheme.replace(/\/+$/, '')
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Somente admin (provisionamento de mailbox)
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_admin')
    if (isAdminError || !isAdmin) {
      return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Extrair username e domain do email
    const [username, domain] = email.split('@')
    if (!username || !domain) {
      return NextResponse.json(
        { success: false, message: 'Email inválido (formato esperado: usuario@dominio)' },
        { status: 400 }
      )
    }

    // Credenciais do cPanel (configurar no .env.local)
    const cpanelUser = process.env.CPANEL_USER
    const cpanelPassword = process.env.CPANEL_PASSWORD
    const cpanelDomain = process.env.CPANEL_DOMAIN

    if (!cpanelUser || !cpanelPassword || !cpanelDomain) {
      console.warn('⚠️ Credenciais do cPanel não configuradas')
      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenciais do cPanel não configuradas. Configure CPANEL_USER, CPANEL_PASSWORD e CPANEL_DOMAIN (ex.: https://SEU_HOST:2083).',
          email 
        },
        { status: 200 }
      )
    }

    // Criar Basic Auth
    const basicAuth = Buffer.from(`${cpanelUser}:${cpanelPassword}`).toString('base64')

    // Construir URL da API do cPanel (UAPI)
    const baseUrl = normalizeCpanelBaseUrl(cpanelDomain)
    const apiUrl = `${baseUrl}/execute/Email/add_pop?email=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&domain=${encodeURIComponent(domain)}&quota=500`

    // Fazer requisição para o cPanel
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (data.result?.status === 1) {
      console.log(`✅ Email criado no cPanel: ${email}`)
      return NextResponse.json({
        success: true,
        message: 'Email criado com sucesso no cPanel',
        email,
        data: data.result.data
      })
    } else {
      console.error('❌ Erro ao criar email no cPanel:', data.result?.errors)
      return NextResponse.json({
        success: false,
        message: 'Erro ao criar email no cPanel',
        errors: data.result?.errors || ['Erro desconhecido']
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Erro na API de criação de email:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido'
    }, { status: 500 })
  }
}



