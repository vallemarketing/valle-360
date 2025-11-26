import React from 'react';
import { getDashboardConfig } from '@/lib/dashboard-config';
import { 
  Monitor, 
  TrendingUp, 
  Layout, 
  MessageSquare,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RoleBasedDashboardProps {
  role: string;
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ role }) => {
  const config = getDashboardConfig(role);

  // Mapeamento de componentes de widgets (Placeholder por enquanto, será expandido)
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
      {/* Cabeçalho do Dashboard Específico */}
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

      {/* Grid de Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {config.widgets.map(widgetId => renderWidget(widgetId))}
      </div>
    </div>
  );
};

// --- Widgets Componentes (Serão movidos para arquivos próprios depois) ---

const TrendsWidget = () => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-500" />
        Tendências de Design
      </h3>
      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Novidades</span>
    </div>
    <div className="space-y-4">
      <div className="group cursor-pointer">
        <div className="h-32 bg-gray-100 rounded-lg mb-2 overflow-hidden relative">
           <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" alt="Trend" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Glassmorphism 2.0: O retorno</p>
      </div>
      <div className="group cursor-pointer">
         <div className="h-32 bg-gray-100 rounded-lg mb-2 overflow-hidden relative">
           <img src="https://images.unsplash.com/photo-1558655146-d09347e0c766?q=80&w=1000&auto=format&fit=crop" alt="Trend" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Tipografia cinética em alta</p>
      </div>
    </div>
  </motion.div>
);

const ToolsWidget = () => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <Layout className="w-5 h-5 text-blue-500" />
        Ferramentas Rápidas
      </h3>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <a href="https://www.figma.com" target="_blank" rel="noreferrer" className="p-3 bg-gray-50 hover:bg-blue-50 rounded-lg flex flex-col items-center gap-2 transition-colors group">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" className="w-8 h-8 group-hover:scale-110 transition-transform" alt="Figma" />
        <span className="text-xs font-medium text-gray-600">Figma</span>
      </a>
      <a href="https://www.behance.net" target="_blank" rel="noreferrer" className="p-3 bg-gray-50 hover:bg-blue-50 rounded-lg flex flex-col items-center gap-2 transition-colors group">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Behance_logo.svg" className="w-8 h-8 group-hover:scale-110 transition-transform" alt="Behance" />
        <span className="text-xs font-medium text-gray-600">Behance</span>
      </a>
      <a href="https://bolt.new" target="_blank" rel="noreferrer" className="p-3 bg-gray-50 hover:bg-blue-50 rounded-lg flex flex-col items-center gap-2 transition-colors group">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs group-hover:scale-110 transition-transform">B</div>
        <span className="text-xs font-medium text-gray-600">Bolt</span>
      </a>
      <div className="p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all">
         <span className="text-xs text-gray-400">+ Add</span>
      </div>
    </div>
  </motion.div>
);

const ValQuickChatWidget = () => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white relative overflow-hidden"
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
    
    <button className="w-full bg-white text-indigo-600 py-3 rounded-lg font-bold shadow-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 relative z-10">
      <Sparkles className="w-4 h-4" />
      Iniciar Chat Agora
    </button>
  </motion.div>
);

