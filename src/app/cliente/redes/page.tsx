'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, HelpCircle } from 'lucide-react';
import { SocialAccountConnect } from '@/components/social/SocialAccountConnect';

export default function RedesSociaisClientePage() {
  const handleConnect = (platform: string) => {
    console.log('Conectar:', platform);
    // TODO: Redirect to OAuth
  };

  const handleDisconnect = (accountId: string) => {
    console.log('Desconectar:', accountId);
    // TODO: Revoke access
  };

  const handleRefresh = (accountId: string) => {
    console.log('Atualizar token:', accountId);
    // TODO: Refresh OAuth token
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #E4405F 0%, #F77737 100%)' }}
          >
            <Globe className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Minhas Redes Sociais
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Conecte suas contas para agendamento automático de posts
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 flex items-start gap-4"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary-100) 0%, var(--purple-100) 100%)',
            border: '1px solid var(--primary-200)'
          }}
        >
          <Shield className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--primary-600)' }} />
          <div>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--primary-800)' }}>
              Conexão Segura
            </h3>
            <p className="text-sm" style={{ color: 'var(--primary-700)' }}>
              Suas credenciais são protegidas. Utilizamos OAuth, o padrão de segurança 
              das maiores empresas de tecnologia. Sua senha nunca é compartilhada conosco 
              e você pode revogar o acesso a qualquer momento.
            </p>
          </div>
        </motion.div>

        {/* Social Accounts */}
        <SocialAccountConnect
          clientId="client-123"
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onRefresh={handleRefresh}
          isClientView={true}
        />

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-6 border"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-light)'
          }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <HelpCircle className="w-5 h-5" style={{ color: 'var(--primary-500)' }} />
            Perguntas Frequentes
          </h3>

          <div className="space-y-4">
            <FAQItem 
              question="Por que preciso conectar minhas redes?"
              answer="Ao conectar suas redes sociais, nossa equipe pode agendar e publicar conteúdo diretamente, sem que você precise fazer isso manualmente. Isso agiliza o processo e garante que os posts sejam publicados nos melhores horários."
            />
            <FAQItem 
              question="Minhas senhas ficam salvas?"
              answer="Não! Utilizamos OAuth, um protocolo seguro que permite acesso às suas redes sem que sua senha seja compartilhada conosco. Você faz login diretamente na rede social e apenas autoriza permissões específicas."
            />
            <FAQItem 
              question="Posso remover o acesso a qualquer momento?"
              answer="Sim! Você pode desconectar qualquer rede social a qualquer momento, tanto aqui na plataforma quanto nas configurações de segurança da própria rede social."
            />
            <FAQItem 
              question="Quais permissões são solicitadas?"
              answer="Solicitamos apenas as permissões necessárias para publicar conteúdo e acessar métricas básicas. Nunca solicitamos acesso a mensagens privadas ou informações pessoais."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div 
      className="border-b last:border-0 pb-4 last:pb-0"
      style={{ borderColor: 'var(--border-light)' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {question}
        </span>
        <span 
          className="text-xl transition-transform"
          style={{ 
            color: 'var(--text-tertiary)',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
          }}
        >
          +
        </span>
      </button>
      {isOpen && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-sm mt-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {answer}
        </motion.p>
      )}
    </div>
  );
}

