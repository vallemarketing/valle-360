// WhatsApp Business API Integration - Valle 360

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
}

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: string;
  template?: {
    name: string;
    language: string;
    components?: any[];
  };
  media?: {
    url: string;
    caption?: string;
  };
}

interface WhatsAppTemplate {
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  components: any[];
}

// Templates pré-definidos para Valle 360
export const WHATSAPP_TEMPLATES = {
  // Cobrança de colaborador
  TASK_REMINDER: {
    name: 'task_reminder_v1',
    language: 'pt_BR',
    category: 'UTILITY' as const,
    components: [
      {
        type: 'BODY',
        text: 'Oi {{1}}! 👋\n\nNotei que a tarefa "{{2}}" está há {{3}} dias sem movimentação.\n\nPrecisa de ajuda? Responda:\n1️⃣ Estender prazo\n2️⃣ Pedir ajuda\n3️⃣ Falar com gestor'
      }
    ]
  },
  
  // Cobrança financeira
  PAYMENT_REMINDER: {
    name: 'payment_reminder_v1',
    language: 'pt_BR',
    category: 'UTILITY' as const,
    components: [
      {
        type: 'BODY',
        text: 'Olá {{1}}! 😊\n\nLembrando que a fatura #{{2}} no valor de R$ {{3}} venceu há {{4}} dias.\n\n💳 Link: {{5}}\n\nDúvidas? Responda esta mensagem!'
      }
    ]
  },
  
  // Aprovação pendente
  APPROVAL_PENDING: {
    name: 'approval_pending_v1',
    language: 'pt_BR',
    category: 'UTILITY' as const,
    components: [
      {
        type: 'BODY',
        text: 'Oi {{1}}!\n\nVocê tem {{2}} itens aguardando aprovação há {{3}} dias.\n\n👉 Aprovar: {{4}}\n\nLeva menos de 2 minutos! 😉'
      }
    ]
  },
  
  // NPS/Feedback
  NPS_REQUEST: {
    name: 'nps_request_v1',
    language: 'pt_BR',
    category: 'MARKETING' as const,
    components: [
      {
        type: 'BODY',
        text: '{{1}}, tudo bem?\n\nFaz {{2}} dias que não conversamos!\n\nDe 0 a 10, qual nota você daria para a Valle 360?\n\nSua opinião é super importante! 💜'
      }
    ]
  },
  
  // Boas-vindas
  WELCOME: {
    name: 'welcome_v1',
    language: 'pt_BR',
    category: 'MARKETING' as const,
    components: [
      {
        type: 'BODY',
        text: 'Bem-vindo à Valle 360, {{1}}! 🎉\n\nSou a Val, sua assistente virtual. Estou aqui para ajudar no que precisar.\n\nAcesse seu portal: {{2}}\n\nQualquer dúvida, é só me chamar!'
      }
    ]
  }
};

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  initialize(config: WhatsAppConfig) {
    this.config = config;
  }

  private getConfig(): WhatsAppConfig {
    if (!this.config) {
      this.config = {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
        webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || ''
      };
    }
    return this.config;
  }

  // Enviar mensagem de texto simples
  async sendText(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const config = this.getConfig();
      
      const response = await fetch(
        `${this.baseUrl}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'text',
            text: { body: text }
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        return { success: false, error: data.error.message };
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  // Enviar template
  async sendTemplate(
    to: string,
    templateName: string,
    language: string = 'pt_BR',
    parameters: string[] = []
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const config = this.getConfig();
      
      const components = parameters.length > 0 ? [{
        type: 'body',
        parameters: parameters.map(param => ({
          type: 'text',
          text: param
        }))
      }] : [];

      const response = await fetch(
        `${this.baseUrl}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'template',
            template: {
              name: templateName,
              language: { code: language },
              components
            }
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        return { success: false, error: data.error.message };
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      console.error('Erro ao enviar template WhatsApp:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  // Enviar lembrete de tarefa
  async sendTaskReminder(
    to: string,
    employeeName: string,
    taskTitle: string,
    daysOverdue: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplate(
      to,
      WHATSAPP_TEMPLATES.TASK_REMINDER.name,
      'pt_BR',
      [employeeName, taskTitle, daysOverdue.toString()]
    );
  }

  // Enviar lembrete de pagamento
  async sendPaymentReminder(
    to: string,
    clientName: string,
    invoiceNumber: string,
    amount: string,
    daysOverdue: number,
    paymentLink: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplate(
      to,
      WHATSAPP_TEMPLATES.PAYMENT_REMINDER.name,
      'pt_BR',
      [clientName, invoiceNumber, amount, daysOverdue.toString(), paymentLink]
    );
  }

  // Enviar lembrete de aprovação
  async sendApprovalReminder(
    to: string,
    clientName: string,
    pendingCount: number,
    daysPending: number,
    approvalLink: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplate(
      to,
      WHATSAPP_TEMPLATES.APPROVAL_PENDING.name,
      'pt_BR',
      [clientName, pendingCount.toString(), daysPending.toString(), approvalLink]
    );
  }

  // Enviar pesquisa NPS
  async sendNPSRequest(
    to: string,
    clientName: string,
    daysSinceLastContact: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplate(
      to,
      WHATSAPP_TEMPLATES.NPS_REQUEST.name,
      'pt_BR',
      [clientName, daysSinceLastContact.toString()]
    );
  }

  // Enviar boas-vindas
  async sendWelcome(
    to: string,
    clientName: string,
    portalLink: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplate(
      to,
      WHATSAPP_TEMPLATES.WELCOME.name,
      'pt_BR',
      [clientName, portalLink]
    );
  }

  // Enviar imagem
  async sendImage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const config = this.getConfig();
      
      const response = await fetch(
        `${this.baseUrl}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'image',
            image: {
              link: imageUrl,
              caption
            }
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        return { success: false, error: data.error.message };
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      console.error('Erro ao enviar imagem WhatsApp:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  // Enviar documento
  async sendDocument(
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const config = this.getConfig();
      
      const response = await fetch(
        `${this.baseUrl}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'document',
            document: {
              link: documentUrl,
              filename,
              caption
            }
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        return { success: false, error: data.error.message };
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (error) {
      console.error('Erro ao enviar documento WhatsApp:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  // Marcar mensagem como lida
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const config = this.getConfig();
      
      await fetch(
        `${this.baseUrl}/${config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId
          })
        }
      );

      return true;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      return false;
    }
  }

  // Formatar número de telefone
  private formatPhoneNumber(phone: string): string {
    // Remove caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    return cleaned;
  }

  // Verificar webhook (para validação do Meta)
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const config = this.getConfig();
    
    if (mode === 'subscribe' && token === config.webhookVerifyToken) {
      return challenge;
    }
    
    return null;
  }

  // Processar webhook de mensagem recebida
  processWebhook(body: any): {
    from: string;
    message: string;
    messageId: string;
    timestamp: number;
    type: string;
  } | null {
    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      
      if (!message) return null;

      return {
        from: message.from,
        message: message.text?.body || '',
        messageId: message.id,
        timestamp: parseInt(message.timestamp),
        type: message.type
      };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return null;
    }
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;

