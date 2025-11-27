'use client'

import React, { useState, useEffect } from 'react';
import { getDashboardConfig } from '@/lib/dashboard-config';
import { 
  Monitor, 
  TrendingUp, 
  Layout, 
  MessageSquare,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Folder,
  Users,
  Target,
  Palette,
  Code,
  Figma,
  Globe,
  Zap,
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RoleBasedDashboardProps {
  role: string;
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ role }) => {
  const config = getDashboardConfig(role);
  const normalizedRole = role.toLowerCase().replace(' ', '_');

  // Renderizar dashboard específico por área
  if (normalizedRole === 'web_designer' || normalizedRole === 'designer') {
    return <WebDesignerDashboard config={config} />;
  }

  // Dashboard padrão para outras áreas
  return <DefaultDashboard config={config} />;
};

// ==================== WEB DESIGNER DASHBOARD ====================
const WebDesignerDashboard = ({ config }: { config: any }) => {
  const [activeProjects, setActiveProjects] = useState([
    { id: 1, name: 'Landing Page - Tech Solutions', status: 'em_andamento', progress: 65, deadline: '2 dias', client: 'Tech Solutions' },
    { id: 2, name: 'Redesign Homepage - E-commerce Plus', status: 'revisao', progress: 90, deadline: '5 dias', client: 'E-commerce Plus' },
    { id: 3, name: 'Banner Institucional', status: 'aguardando', progress: 30, deadline: '1 dia', client: 'Marketing Pro' }
  ]);

  const stats = {
    projectsThisMonth: 8,
    completedThisWeek: 3,
    pendingApproval: 2,
    avgDeliveryTime: '3.5 dias'
  };

  return (
    <div className="space-y-6">
      {/* Header com Gradiente */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl text-white shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #4F46E5 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
            <Monitor className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Painel do Web Designer</h2>
            <p className="text-white/80">Gerencie seus projetos e acompanhe entregas</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl shadow-sm"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <Folder className="w-5 h-5" style={{ color: '#8B5CF6' }} />
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">Este mês</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.projectsThisMonth}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Projetos</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl shadow-sm"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Semana</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.completedThisWeek}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Concluídos</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl shadow-sm"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">Pendente</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.pendingApproval}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Aguardando Aprovação</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl shadow-sm"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5" style={{ color: '#4370d1' }} />
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-100)', color: '#4370d1' }}>Média</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.avgDeliveryTime}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Tempo de Entrega</p>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projetos Ativos */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 p-6 rounded-xl shadow-sm"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Target className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              Projetos em Andamento
            </h3>
            <a href="/colaborador/kanban" className="text-sm font-medium" style={{ color: '#4370d1' }}>
              Ver todos →
            </a>
          </div>

          <div className="space-y-4">
            {activeProjects.map((project, idx) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="p-4 rounded-xl transition-all hover:shadow-md cursor-pointer"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{project.name}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{project.client}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    project.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' :
                    project.status === 'revisao' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status === 'em_andamento' ? 'Em Andamento' :
                     project.status === 'revisao' ? 'Em Revisão' : 'Aguardando'}
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>Progresso</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${project.progress}%`,
                        backgroundColor: project.progress >= 80 ? '#10b981' : project.progress >= 50 ? '#4370d1' : '#f59e0b'
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <Clock className="w-3 h-3" />
                  <span>Prazo: {project.deadline}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ferramentas Rápidas */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
          >
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Layout className="w-5 h-5" style={{ color: '#4370d1' }} />
              Ferramentas
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <a href="https://www.figma.com" target="_blank" rel="noreferrer" className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md hover:scale-105" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" className="w-8 h-8" alt="Figma" />
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Figma</span>
              </a>
              <a href="https://www.behance.net" target="_blank" rel="noreferrer" className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md hover:scale-105" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Behance_logo.svg" className="w-8 h-8" alt="Behance" />
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Behance</span>
              </a>
              <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md hover:scale-105" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">D</div>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Dribbble</span>
              </a>
              <a href="https://bolt.new" target="_blank" rel="noreferrer" className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md hover:scale-105" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs">B</div>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Bolt</span>
              </a>
              <a href="https://coolors.co" target="_blank" rel="noreferrer" className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md hover:scale-105" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Palette className="w-8 h-8 text-purple-500" />
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Coolors</span>
              </a>
              <a href="https://fonts.google.com" target="_blank" rel="noreferrer" className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md hover:scale-105" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">Aa</span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>Fonts</span>
              </a>
            </div>
          </motion.div>

          {/* Tendências */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
          >
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              Tendências
            </h3>
            <div className="space-y-3">
              <div className="group cursor-pointer">
                <div className="h-24 rounded-lg mb-2 overflow-hidden relative" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop" alt="Trend" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-sm font-medium group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>Glassmorphism 2.0</p>
              </div>
              <div className="group cursor-pointer">
                <div className="h-24 rounded-lg mb-2 overflow-hidden relative" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <img src="https://images.unsplash.com/photo-1558655146-d09347e0c766?q=80&w=400&auto=format&fit=crop" alt="Trend" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-sm font-medium group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>Tipografia Cinética</p>
              </div>
            </div>
          </motion.div>

          {/* Val Chat */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 rounded-xl shadow-lg text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4370d1 0%, #6366F1 100%)' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <h3 className="font-bold mb-3 flex items-center gap-2 relative z-10">
              <Sparkles className="w-5 h-5" />
              Fale com a Val
            </h3>
            
            <p className="text-sm text-white/80 mb-4 relative z-10">
              Precisa de inspiração ou ajuda com um layout? Estou aqui!
            </p>
            
            <a 
              href="/colaborador/val"
              className="w-full bg-white py-3 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 relative z-10"
              style={{ color: '#4370d1' }}
            >
              <MessageSquare className="w-4 h-4" />
              Iniciar Chat
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ==================== DEFAULT DASHBOARD ====================
const DefaultDashboard = ({ config }: { config: any }) => {
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'trends':
        return <TrendsWidget key={widgetId} />;
      case 'tools':
        return <ToolsWidget key={widgetId} />;
      case 'val-chat':
        return <ValQuickChatWidget key={widgetId} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl text-white shadow-lg ${config.primaryColor} bg-opacity-90 backdrop-blur-sm`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
            <config.icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Painel do {config.title}</h2>
            <p className="text-white/80">Visão geral e ferramentas para sua área.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.widgets.map((widgetId: string) => renderWidget(widgetId))}
      </div>
    </div>
  );
};

// --- Widget Components ---

const TrendsWidget = () => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 rounded-xl shadow-sm"
    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <TrendingUp className="w-5 h-5 text-purple-500" />
        Tendências
      </h3>
      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Novidades</span>
    </div>
    <div className="space-y-4">
      <div className="group cursor-pointer">
        <div className="h-32 rounded-lg mb-2 overflow-hidden relative" style={{ backgroundColor: 'var(--bg-secondary)' }}>
           <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Trend" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <p className="text-sm font-medium group-hover:text-purple-600 transition-colors" style={{ color: 'var(--text-primary)' }}>Glassmorphism 2.0: O retorno</p>
      </div>
    </div>
  </motion.div>
);

const ToolsWidget = () => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 rounded-xl shadow-sm"
    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Layout className="w-5 h-5" style={{ color: '#4370d1' }} />
        Ferramentas Rápidas
      </h3>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <a href="https://www.figma.com" target="_blank" rel="noreferrer" className="p-3 rounded-lg flex flex-col items-center gap-2 transition-colors group" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" className="w-8 h-8 group-hover:scale-110 transition-transform" alt="Figma" />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Figma</span>
      </a>
      <a href="https://www.behance.net" target="_blank" rel="noreferrer" className="p-3 rounded-lg flex flex-col items-center gap-2 transition-colors group" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Behance_logo.svg" className="w-8 h-8 group-hover:scale-110 transition-transform" alt="Behance" />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Behance</span>
      </a>
      <a href="https://bolt.new" target="_blank" rel="noreferrer" className="p-3 rounded-lg flex flex-col items-center gap-2 transition-colors group" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs group-hover:scale-110 transition-transform">B</div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Bolt</span>
      </a>
      <div className="p-3 rounded-lg flex flex-col items-center justify-center gap-2 border-2 border-dashed cursor-pointer hover:border-blue-300 transition-all" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
         <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>+ Add</span>
      </div>
    </div>
  </motion.div>
);

const ValQuickChatWidget = () => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 rounded-xl shadow-lg text-white relative overflow-hidden"
    style={{ background: 'linear-gradient(135deg, #4370d1 0%, #6366F1 100%)' }}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
    
    <div className="flex items-center justify-between mb-4 relative z-10">
      <h3 className="font-bold flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Fale com a Val
      </h3>
      <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">IA Specialist</span>
    </div>
    
    <p className="text-sm text-indigo-100 mb-6 relative z-10">
      Precisa de inspiração ou ajuda com um layout? Estou aqui para ajudar!
    </p>
    
    <a 
      href="/colaborador/val"
      className="w-full bg-white py-3 rounded-lg font-bold shadow-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 relative z-10"
      style={{ color: '#4370d1' }}
    >
      <Sparkles className="w-4 h-4" />
      Iniciar Chat Agora
    </a>
  </motion.div>
);
