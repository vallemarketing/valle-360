'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Calendar, 
  MessageSquare, 
  FolderOpen, 
  Users, 
  TrendingUp, 
  Award, 
  Settings,
  HelpCircle,
  LogOut,
  FileText
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/colaborador/dashboard' },
  { name: 'Kanban', icon: KanbanSquare, href: '/colaborador/kanban' },
  { name: 'Agenda', icon: Calendar, href: '/colaborador/agenda' },
  { name: 'Mensagens', icon: MessageSquare, href: '/colaborador/mensagens' },
  { name: 'Arquivos', icon: FolderOpen, href: '/colaborador/arquivos' },
  { name: 'Clientes', icon: Users, href: '/colaborador/clientes' },
  { name: 'Desempenho', icon: TrendingUp, href: '/colaborador/desempenho' },
  { name: 'Gamificação', icon: Award, href: '/colaborador/gamificacao' },
  { name: 'Solicitações', icon: FileText, href: '/colaborador/solicitacoes' },
];

const bottomItems = [
  { name: 'Configurações', icon: Settings, href: '/colaborador/configuracoes' },
  { name: 'Suporte', icon: HelpCircle, href: '/colaborador/suporte' },
];

export function ColaboradorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-[73px] bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-40 flex flex-col">
      <div className="flex-1 py-6 px-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu Principal</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-200">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sistema</p>
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
