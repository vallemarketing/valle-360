'use client';

import { Bell, ChevronDown, Layout, Menu, Search, Settings, MessageSquare, HelpCircle, User as UserIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export function ColaboradorHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyIcon, setCompanyIcon] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchUser();
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const { data: branding } = await supabase
        .from('company_branding')
        .select('logo_url, icon_url, company_name')
        .single();
      
      if (branding) {
        setCompanyLogo(branding.logo_url || '');
        setCompanyIcon(branding.icon_url || '');
      }
    } catch (error) {
      console.error('Erro ao carregar branding:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Buscar dados do employee (incluindo avatar)
        const { data: employee } = await supabase
          .from('employees')
          .select('full_name, avatar, area_of_expertise')
          .eq('user_id', user.id)
          .single();
        
        if (employee) {
          setUserName(employee.full_name || user.email?.split('@')[0] || 'Colaborador');
          setUserAvatar(employee.avatar || '');
          // Formatar área de expertise
          const areaFormatted = employee.area_of_expertise
            ?.split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') || 'Colaborador';
          setUserRole(areaFormatted);
        } else {
          // Fallback para user_profiles
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, role')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
            setUserName(profile.full_name || user.email?.split('@')[0] || 'Colaborador');
            setUserRole(profile.role === 'super_admin' ? 'Super Admin' : 'Colaborador');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de busca global aqui
    console.log('Searching for:', searchQuery);
  };

  // Atalho Cmd+K para busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm h-[73px]">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Logo da Empresa */}
        <div className="flex items-center gap-4 w-64">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt="Logo" 
              className="h-10 max-w-[160px] object-contain"
            />
          ) : companyIcon ? (
            <div className="flex items-center gap-2">
              <img 
                src={companyIcon} 
                alt="Ícone" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-gray-900 font-bold text-xl">Valle 360</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-900 font-bold text-xl">
              <span className="text-blue-600">Valle</span>
              <span>360</span>
            </div>
          )}
        </div>

        {/* Barra de Busca Central */}
        <div className="flex-1 max-w-2xl px-8">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              id="global-search"
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
              placeholder="Buscar tarefas, clientes ou arquivos... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5">⌘K</span>
            </div>
          </form>
        </div>

        {/* Ações do Usuário */}
        <div className="flex items-center gap-4">
          {/* Notificações */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {/* Ajuda */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* Perfil */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="flex flex-col text-right hidden md:block">
              <span className="text-sm font-semibold text-gray-900">{userName}</span>
              <span className="text-xs text-gray-500">{userRole}</span>
            </div>
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt={userName}
                className="h-10 w-10 rounded-full object-cover shadow-md cursor-pointer hover:shadow-lg transition-all ring-2 ring-blue-100"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-all">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
