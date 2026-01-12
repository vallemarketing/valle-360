/**
 * Serviço Unificado de Email com Sistema de Fallback
 * 
 * Ordem de tentativa:
 * 1. SendGrid (principal)
 * 2. Resend (fallback)
 * 3. Retorna credenciais para exibição manual
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: {
    email: string;
    name: string;
  };
}

export interface EmailResult {
  success: boolean;
  provider?: 'sendgrid' | 'resend' | 'manual';
  message: string;
  error?: string;
  fallbackMode?: boolean;
  credentials?: {
    email: string;
    senha: string;
    webmailUrl: string;
    loginUrl: string;
  };
}

// ============================================
// SENDGRID
// ============================================
async function sendViaSendGrid(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = (process.env.SENDGRID_API_KEY || '').trim();
  
  if (!apiKey) {
    return { success: false, message: 'SendGrid não configurado', error: 'API_KEY_MISSING' };
  }

  try {
    const fromEmail = payload.from?.email || process.env.SENDGRID_FROM_EMAIL || 'noreply@valle360.com.br';
    const fromName = payload.from?.name || process.env.SENDGRID_FROM_NAME || 'Valle 360';

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: fromEmail, name: fromName },
        subject: payload.subject,
        content: [{ type: 'text/html', value: payload.html }],
      }),
    });

    if (response.status === 202 || response.ok) {
      console.log(`✅ [SendGrid] Email enviado para: ${payload.to}`);
      return { success: true, provider: 'sendgrid', message: 'Email enviado via SendGrid' };
    }

    const errorText = await response.text();
    console.error(`❌ [SendGrid] Erro ${response.status}:`, errorText);
    return { 
      success: false, 
      message: `SendGrid retornou status ${response.status}`,
      error: errorText 
    };
  } catch (error: any) {
    console.error('❌ [SendGrid] Exceção:', error);
    return { success: false, message: 'Erro ao enviar via SendGrid', error: error.message };
  }
}

// ============================================
// RESEND
// ============================================
async function sendViaResend(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  
  if (!apiKey) {
    return { success: false, message: 'Resend não configurado', error: 'API_KEY_MISSING' };
  }

  try {
    const fromEmail = payload.from?.email || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = payload.from?.name || process.env.RESEND_FROM_NAME || 'Valle 360';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const data = await response.json();

    if (response.ok && data.id) {
      console.log(`✅ [Resend] Email enviado para: ${payload.to} (ID: ${data.id})`);
      return { success: true, provider: 'resend', message: 'Email enviado via Resend' };
    }

    console.error('❌ [Resend] Erro:', data);
    return { 
      success: false, 
      message: data.message || 'Erro no Resend',
      error: JSON.stringify(data) 
    };
  } catch (error: any) {
    console.error('❌ [Resend] Exceção:', error);
    return { success: false, message: 'Erro ao enviar via Resend', error: error.message };
  }
}

// ============================================
// FUNÇÃO PRINCIPAL COM FALLBACK
// ============================================
export async function sendEmailWithFallback(
  payload: EmailPayload,
  credentials?: {
    email: string;
    senha: string;
  }
): Promise<EmailResult> {
  console.log(`📧 Iniciando envio de email para: ${payload.to}`);

  // 1. Tenta SendGrid
  console.log('🔄 Tentando SendGrid...');
  const sendgridResult = await sendViaSendGrid(payload);
  if (sendgridResult.success) {
    return sendgridResult;
  }
  console.log(`⚠️ SendGrid falhou: ${sendgridResult.message}`);

  // 2. Tenta Resend
  console.log('🔄 Tentando Resend...');
  const resendResult = await sendViaResend(payload);
  if (resendResult.success) {
    return resendResult;
  }
  console.log(`⚠️ Resend falhou: ${resendResult.message}`);

  // 3. Fallback: Retorna credenciais para exibição manual
  console.log('📋 Ativando modo fallback manual...');
  
  const webmailUrl = process.env.WEBMAIL_URL || 'https://webmail.vallegroup.com.br/';
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.valle360.com.br/login';

  return {
    success: false,
    fallbackMode: true,
    provider: 'manual',
    message: 'Não foi possível enviar email. Use as credenciais abaixo para enviar manualmente.',
    credentials: credentials ? {
      email: credentials.email,
      senha: credentials.senha,
      webmailUrl,
      loginUrl,
    } : undefined,
    error: `SendGrid: ${sendgridResult.error || sendgridResult.message} | Resend: ${resendResult.error || resendResult.message}`,
  };
}

// ============================================
// TEMPLATES DE EMAIL
// ============================================

export function generateWelcomeEmailHTML(data: {
  nome: string;
  emailCorporativo: string;
  senha: string;
  areasTexto?: string;
  tipo: 'colaborador' | 'cliente';
}): string {
  const webmailUrl = process.env.WEBMAIL_URL || 'https://webmail.vallegroup.com.br/';
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.valle360.com.br/login';
  
  const isCliente = data.tipo === 'cliente';
  const titulo = isCliente ? 'Bem-vindo ao Valle 360!' : 'Bem-vindo à Família Valle 360!';
  const subtitulo = isCliente 
    ? 'Sua jornada de sucesso começa agora!' 
    : 'Estamos juntos nessa jornada de sucesso!';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1672d6 0%, #001533 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 ${titulo}</h1>
              <p style="color: #ffffff; opacity: 0.9; margin: 10px 0 0 0; font-size: 16px;">${subtitulo}</p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${data.nome}</strong>,
              </p>
              
              ${isCliente ? `
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                É com grande alegria que damos as <strong>BOAS-VINDAS</strong> à Valle 360! 🎊
                Estamos ansiosos para impulsionar o sucesso da sua empresa!
              </p>
              ` : `
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                É com o coração cheio de alegria que damos as <strong>BOAS-VINDAS</strong> à família Valle 360! 🎊
              </p>

              ${data.areasTexto ? `
              <div style="background-color: #f0f6ff; border-left: 4px solid #1672d6; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #2c3e50; font-size: 14px; margin: 0;">
                  <strong>💼 Você fará parte do time de:</strong><br>
                  <span style="color: #1672d6; font-weight: 600;">${data.areasTexto}</span>
                </p>
              </div>
              ` : ''}
              `}

              <!-- Credenciais -->
              <div style="background: linear-gradient(135deg, #1672d6 0%, #001533 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
                  🔐 Seus Dados de Acesso
                </h2>
                
                <div style="background-color: rgba(255,255,255,0.95); border-radius: 8px; padding: 20px;">
                  <table width="100%" cellpadding="8" cellspacing="0">
                    <tr>
                      <td style="color: #666; font-size: 14px; font-weight: 600; padding: 8px 0;">📧 Email:</td>
                    </tr>
                    <tr>
                      <td style="color: #1672d6; font-size: 16px; font-weight: 700; padding: 0 0 15px 0;">${data.emailCorporativo}</td>
                    </tr>
                    <tr>
                      <td style="color: #666; font-size: 14px; font-weight: 600; padding: 8px 0;">🔑 Senha Provisória:</td>
                    </tr>
                    <tr>
                      <td style="color: #e74c3c; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace; padding: 0 0 15px 0;">${data.senha}</td>
                    </tr>
                  </table>
                </div>

                <div style="text-align: center; margin: 25px 0 10px 0;">
                  <a href="${loginUrl}" style="display: inline-block; background-color: #ffffff; color: #1672d6; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                    ➜ Acessar Sistema Valle 360
                  </a>
                </div>

                <div style="background-color: rgba(255,255,255,0.95); border-radius: 8px; padding: 18px; margin: 15px 0;">
                  <p style="margin: 0 0 10px 0; color: #2c3e50; font-size: 14px; font-weight: 700;">
                    📬 Acesso ao seu Email Corporativo (Webmail)
                  </p>
                  <p style="margin: 0 0 8px 0; color: #2c3e50; font-size: 14px;">
                    <strong>Link:</strong> <a href="${webmailUrl}" style="color: #1672d6; text-decoration: underline;">${webmailUrl}</a>
                  </p>
                  <p style="margin: 0 0 8px 0; color: #2c3e50; font-size: 14px;">
                    <strong>Login:</strong> ${data.emailCorporativo}
                  </p>
                  <p style="margin: 0; color: #2c3e50; font-size: 14px;">
                    <strong>Senha:</strong> ${data.senha}
                  </p>
                </div>
              </div>

              <!-- Aviso -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #856404; font-size: 14px; margin: 0; font-weight: 600;">
                  ⚠️ IMPORTANTE: Altere sua senha no primeiro acesso para garantir a segurança!
                </p>
              </div>

              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
                <strong>Bem-vindo à Valle 360! 🚀</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 12px; margin: 0 0 10px 0;">
                Valle 360 - Sistema de Marketing Inteligente
              </p>
              <p style="color: #6c757d; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Valle 360. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ============================================
// ENVIO DE EMAIL DE BOAS-VINDAS
// ============================================
export async function sendWelcomeEmail(data: {
  emailDestino: string;
  emailCorporativo: string;
  senha: string;
  nome: string;
  areasTexto?: string;
  tipo: 'colaborador' | 'cliente';
}): Promise<EmailResult> {
  const html = generateWelcomeEmailHTML({
    nome: data.nome,
    emailCorporativo: data.emailCorporativo,
    senha: data.senha,
    areasTexto: data.areasTexto,
    tipo: data.tipo,
  });

  const subject = data.tipo === 'cliente'
    ? '🎉 Bem-vindo ao Valle 360! Seus Dados de Acesso'
    : '🎉 Bem-vindo à Família Valle 360! Seus Dados de Acesso 🚀';

  return sendEmailWithFallback(
    {
      to: data.emailDestino,
      subject,
      html,
    },
    {
      email: data.emailCorporativo,
      senha: data.senha,
    }
  );
}
