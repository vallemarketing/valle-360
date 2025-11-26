import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { emailPessoal, emailCorporativo, nome, senha, areasTexto, loginUrl } = await request.json()

    if (!emailPessoal || !emailCorporativo || !nome || !senha) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // HTML do email de boas-vindas
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à Valle 360</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header com gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #4370d1 0%, #0f1b35 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Bem-vindo à Valle 360!</h1>
              <p style="color: #ffffff; opacity: 0.9; margin: 10px 0 0 0; font-size: 16px;">Estamos juntos nessa jornada de sucesso!</p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${nome}</strong>,
              </p>
              
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                É com o coração cheio de alegria que damos as <strong>BOAS-VINDAS</strong> à família Valle 360! 🎊
              </p>

              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hoje marca o início de uma parceria que promete ser repleta de conquistas, aprendizado e muito sucesso! 
                Acreditamos que juntos, vamos construir algo verdadeiramente extraordinário.
              </p>

              ${areasTexto ? `
              <div style="background-color: #f0f6ff; border-left: 4px solid #4370d1; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #2c3e50; font-size: 14px; margin: 0;">
                  <strong>💼 Você fará parte do time de:</strong><br>
                  <span style="color: #4370d1; font-weight: 600;">${areasTexto}</span>
                </p>
              </div>
              ` : ''}

              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Na Valle 360, não somos apenas colegas de trabalho - somos uma família que se apoia, 
                cresce junta e celebra cada vitória como se fosse a primeira! 🌟
              </p>

              <!-- Credenciais de Acesso -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
                  🔐 Seus Dados de Acesso
                </h2>
                
                <div style="background-color: rgba(255,255,255,0.95); border-radius: 8px; padding: 20px; margin: 15px 0;">
                  <table width="100%" cellpadding="8" cellspacing="0">
                    <tr>
                      <td style="color: #666; font-size: 14px; font-weight: 600; padding: 8px 0;">📧 Email Corporativo:</td>
                    </tr>
                    <tr>
                      <td style="color: #4370d1; font-size: 16px; font-weight: 700; padding: 0 0 15px 0;">${emailCorporativo}</td>
                    </tr>
                    <tr>
                      <td style="color: #666; font-size: 14px; font-weight: 600; padding: 8px 0;">🔑 Senha Provisória:</td>
                    </tr>
                    <tr>
                      <td style="color: #e74c3c; font-size: 18px; font-weight: 700; font-family: 'Courier New', monospace; padding: 0 0 15px 0;">${senha}</td>
                    </tr>
                  </table>
                </div>

                <div style="text-align: center; margin: 25px 0 10px 0;">
                  <a href="${loginUrl}" style="display: inline-block; background-color: #ffffff; color: #4370d1; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                    ➜ Acessar Sistema Valle 360
                  </a>
                </div>
              </div>

              <!-- Aviso Importante -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                <p style="color: #856404; font-size: 14px; margin: 0; font-weight: 600;">
                  ⚠️ IMPORTANTE: Altere sua senha no primeiro acesso para garantir a segurança da sua conta!
                </p>
              </div>

              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
                <strong>Bem-vindo à família Valle 360! 🚀</strong>
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
    `

    // Configurações do email
    const fromEmail = process.env.ADMIN_EMAIL_FROM || 'guilherme@vallegroup.com.br'
    const fromName = process.env.ADMIN_EMAIL_NAME || 'Guilherme Valle - Valle 360'
    
    console.log('📧 Email de boas-vindas preparado')
    console.log('  → De:', fromEmail)
    console.log('  → Para:', emailPessoal)
    console.log('  → Email corporativo criado:', emailCorporativo)
    console.log('  → Senha provisória:', senha)

    // TODO: Integrar com seu provedor de email
    // Opções suportadas:
    
    // 1. SendGrid (Recomendado - 100 emails/dia grátis)
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        
        await sgMail.send({
          to: emailPessoal,
          from: {
            email: fromEmail,
            name: fromName
          },
          subject: '🎉 Bem-vindo à Família Valle 360! Seus Dados de Acesso 🚀',
          html: htmlContent,
        })
        
        console.log('✅ Email enviado via SendGrid')
      } catch (sgError) {
        console.error('❌ Erro SendGrid:', sgError)
      }
    }
    
    // 2. Nodemailer (SMTP do seu servidor)
    else if (process.env.SMTP_HOST) {
      try {
        const nodemailer = require('nodemailer')
        
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || fromEmail,
            pass: process.env.SMTP_PASSWORD
          }
        })
        
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: emailPessoal,
          subject: '🎉 Bem-vindo à Família Valle 360! Seus Dados de Acesso 🚀',
          html: htmlContent
        })
        
        console.log('✅ Email enviado via SMTP')
      } catch (smtpError) {
        console.error('❌ Erro SMTP:', smtpError)
      }
    }
    
    // 3. Sem provedor configurado
    else {
      console.warn('⚠️ Nenhum provedor de email configurado')
      console.log('📋 Configure SendGrid ou SMTP no .env.local')
    }

    return NextResponse.json({
      success: true,
      message: 'Email preparado com sucesso',
      emailPessoal,
      emailCorporativo
    })

  } catch (error: any) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro desconhecido'
    }, { status: 500 })
  }
}

