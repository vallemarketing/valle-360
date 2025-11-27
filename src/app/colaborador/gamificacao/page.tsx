'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Download, Share2, TrendingUp, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PodiumDisplay } from '@/components/gamification/PodiumDisplay';
import { GamificationKPICards } from '@/components/gamification/GamificationKPICards';
import { RankingTable } from '@/components/gamification/RankingTable';
import { AchievementBadges, SAMPLE_ACHIEVEMENTS } from '@/components/gamification/AchievementBadges';
import { FilterSidebar, FilterBar } from '@/components/gamification/FilterSidebar';

interface RankedUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  previousPosition?: number;
  area?: string;
  department?: string;
}

export default function GamificacaoPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserPosition, setCurrentUserPosition] = useState<number | null>(null);
  
  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('points');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadRankingData();
  }, [selectedPeriod, selectedArea, selectedMetric]);

  const loadRankingData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Fetch ranking data from gamification table
      let query = supabase
        .from('employee_gamification')
        .select(`
          *,
          employees (
            id,
            full_name,
            avatar,
            department,
            employee_areas_of_expertise (area_name)
          )
        `)
        .order('total_points', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar ranking:', error);
        // Use mock data if table doesn't exist
        setUsers(MOCK_USERS);
        return;
      }

      if (data && data.length > 0) {
        const rankedUsers: RankedUser[] = data.map((item, index) => ({
          id: item.employee_id,
          name: item.employees?.full_name || 'Colaborador',
          avatar: item.employees?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.employee_id}`,
          points: item.total_points || 0,
          position: index + 1,
          previousPosition: item.previous_position,
          area: item.employees?.employee_areas_of_expertise?.[0]?.area_name,
          department: item.employees?.department
        }));

        // Filter by area if needed
        const filteredUsers = selectedArea === 'all' 
          ? rankedUsers 
          : rankedUsers.filter(u => u.area?.toLowerCase().includes(selectedArea.toLowerCase()));

        setUsers(filteredUsers);

        // Find current user position
        const currentUser = filteredUsers.find(u => u.id === user?.id);
        if (currentUser) {
          setCurrentUserPosition(currentUser.position);
        }
      } else {
        setUsers(MOCK_USERS);
      }
    } catch (error) {
      console.error('Erro:', error);
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedPeriod('month');
    setSelectedArea('all');
    setSelectedMetric('points');
  };

  const handleExport = () => {
    // TODO: Implement PDF/Excel export
    alert('Exportação em desenvolvimento');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    alert('Compartilhamento em desenvolvimento');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--primary-500)' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Trophy className="w-8 h-8" style={{ color: 'var(--warning-500)' }} />
              Ranking de Gamificação
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Acompanhe sua posição e conquistas
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUserPosition && (
              <div 
                className="px-4 py-2 rounded-xl font-medium"
                style={{ 
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)'
                }}
              >
                Sua posição: #{currentUserPosition}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              className="p-2 rounded-lg border transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)'
              }}
            >
              <Download className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="p-2 rounded-lg border transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)'
              }}
            >
              <Share2 className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Filter Bar */}
        <FilterBar
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          onOpenFullFilters={() => setShowFilters(true)}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block">
            <FilterSidebar
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              selectedArea={selectedArea}
              onAreaChange={setSelectedArea}
              selectedMetric={selectedMetric}
              onMetricChange={setSelectedMetric}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* KPI Cards */}
            <GamificationKPICards cards={[
              {
                id: '1',
                label: 'Faturamento Top #3',
                value: users.slice(0, 3).reduce((acc, u) => acc + u.points, 0).toLocaleString('pt-BR'),
                subValue: '53% do total',
                icon: <TrendingUp className="w-6 h-6" />,
                color: '#10B981',
                trend: { value: 12, isPositive: true }
              },
              {
                id: '2',
                label: 'Média de Pontos',
                value: Math.round(users.reduce((acc, u) => acc + u.points, 0) / users.length || 0).toLocaleString('pt-BR'),
                subValue: 'Por colaborador',
                icon: <Trophy className="w-6 h-6" />,
                color: '#3B82F6',
                trend: { value: 8, isPositive: true }
              },
              {
                id: '3',
                label: 'Participantes',
                value: users.length.toString(),
                subValue: 'Colaboradores ativos',
                icon: <Trophy className="w-6 h-6" />,
                color: '#F59E0B'
              }
            ]} />

            {/* Podium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 border"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)'
              }}
            >
              <h2 className="text-lg font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
                🏆 Top 3 do Mês
              </h2>
              <PodiumDisplay 
                users={users.slice(0, 3)} 
                metricLabel="pontos"
              />
            </motion.div>

            {/* Ranking Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Ranking Completo
              </h2>
              <RankingTable 
                users={users}
                startPosition={4}
                metricLabel="Pontos"
              />
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6 border"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)'
              }}
            >
              <AchievementBadges achievements={SAMPLE_ACHIEVEMENTS} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 h-full w-80 overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <FilterSidebar
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              selectedArea={selectedArea}
              onAreaChange={setSelectedArea}
              selectedMetric={selectedMetric}
              onMetricChange={setSelectedMetric}
              onClearFilters={handleClearFilters}
              isOpen={true}
              onClose={() => setShowFilters(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Mock data for development
const MOCK_USERS: RankedUser[] = [
  { id: '1', name: 'Carla Ferreira', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carla', points: 2380000, position: 1, previousPosition: 2, area: 'Comercial' },
  { id: '2', name: 'Julio Lima', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julio', points: 1770000, position: 2, previousPosition: 1, area: 'Comercial' },
  { id: '3', name: 'Gustavo Gomes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gustavo', points: 1260000, position: 3, previousPosition: 3, area: 'Comercial' },
  { id: '4', name: 'Felipe Gonçalves', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=felipe', points: 996370, position: 4, previousPosition: 5, area: 'Tráfego' },
  { id: '5', name: 'Leonardo Cardoso', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leonardo', points: 900329, position: 5, previousPosition: 4, area: 'Social Media' },
  { id: '6', name: 'Mateus Costa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mateus', points: 638027, position: 6, previousPosition: 6, area: 'Design' },
  { id: '7', name: 'Gustavo Barros', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gustavo2', points: 565360, position: 7, previousPosition: 8, area: 'Web Design' },
  { id: '8', name: 'Julia Silva', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julia', points: 557800, position: 8, previousPosition: 7, area: 'Social Media' },
  { id: '9', name: 'Kaua Araujo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kaua', points: 551957, position: 9, previousPosition: 10, area: 'Tráfego' },
  { id: '10', name: 'Isabella Sousa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabella', points: 310324, position: 10, previousPosition: 9, area: 'Design' },
];
