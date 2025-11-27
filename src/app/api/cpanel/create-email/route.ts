import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Extrair username e domain do email
    const [username, domain] = email.split('@')

    // Credenciais do cPanel (configurar no .env.local)
    const cpanelUser = process.env.CPANEL_USER
    const cpanelPassword = process.env.CPANEL_PASSWORD
    const cpanelDomain = process.env.CPANEL_DOMAIN || 'https://seu-servidor.com:2083'

    if (!cpanelUser || !cpanelPassword) {
      console.warn('⚠️ Credenciais do cPanel não configuradas')
      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenciais do cPanel não configuradas. Email não criado na hospedagem.',
          email 
        },
        { status: 200 }
      )
    }

    // Criar Basic Auth
    const auth = Buffer.from(`${cpanelUser}:${cpanelPassword}`).toString('base64')

    // Construir URL da API do cPanel (UAPI)
    const apiUrl = `${cpanelDomain}/execute/Email/add_pop?email=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&domain=${encodeURIComponent(domain)}&quota=500`

    // Fazer requisição para o cPanel
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
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



