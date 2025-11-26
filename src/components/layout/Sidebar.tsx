'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  KanbanSquare,
  MessageSquare,
  Users,
  FileText,
  Calendar,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

const appNavItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/kanban', label: 'Kanban', icon: KanbanSquare },
  { href: '/app/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/app/pessoas', label: 'Pessoas', icon: Users },
  { href: '/app/solicitacoes', label: 'Solicitações', icon: FileText },
  { href: '/app/agenda', label: 'Agenda', icon: Calendar },
  { href: '/app/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/app/financeiro', label: 'Financeiro', icon: DollarSign },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gradient-to-b from-valle-navy-900 to-valle-navy-950 border-r border-valle-navy-800 min-h-screen">
      <div className="p-6 border-b border-valle-navy-800">
        <Link href="/app/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center p-1">
            <Image
              src="/icons/ICON (1).png"
              alt="Valle 360"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-white">Valle 360</span>
        </Link>
      </div>

      <nav className="p-4 space-y-2">
        {appNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-gradient-to-r from-valle-blue-600 to-valle-blue-700 text-white shadow-lg'
                  : 'text-valle-silver-300 hover:text-white hover:bg-valle-navy-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
