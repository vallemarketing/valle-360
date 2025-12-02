'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Filter, Search, Instagram, Facebook, Linkedin } from 'lucide-react';
import { PostCalendar } from '@/components/social/PostCalendar';

export default function CalendarioSocialPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');

  const handleAddPost = (date: Date) => {
    console.log('Adicionar post para:', date);
    // TODO: Open post creation modal
  };

  const handleEditPost = (post: any) => {
    console.log('Editar post:', post);
    // TODO: Open post edit modal
  };

  const handleDeletePost = (postId: string) => {
    console.log('Deletar post:', postId);
    // TODO: Confirm and delete post
  };

  const handleViewPost = (post: any) => {
    console.log('Ver post:', post);
    // TODO: Open post preview modal
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--pink-100, #FCE7F3)' }}
            >
              <Calendar className="w-7 h-7" style={{ color: 'var(--pink-500, #EC4899)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Calendário de Posts
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Agende e gerencie publicações nas redes sociais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAddPost(new Date())}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white"
              style={{ backgroundColor: 'var(--primary-500)' }}
            >
              <Plus className="w-4 h-4" />
              Novo Post
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar post..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>

          {/* Platform Filter */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todas', icon: null },
              { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" />, color: '#E4405F' },
              { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-4 h-4" />, color: '#1877F2' },
              { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, color: '#0A66C2' }
            ].map((platform) => (
              <button
                key={platform.id}
                onClick={() => setFilterPlatform(platform.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: filterPlatform === platform.id 
                    ? platform.color || 'var(--primary-500)' 
                    : 'var(--bg-primary)',
                  color: filterPlatform === platform.id 
                    ? 'white' 
                    : 'var(--text-secondary)',
                  border: `1px solid ${filterPlatform === platform.id ? platform.color || 'var(--primary-500)' : 'var(--border-light)'}`
                }}
              >
                {platform.icon}
                <span className="hidden md:inline">{platform.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Agendados"
            value="24"
            color="var(--primary-500)"
          />
          <StatCard 
            label="Publicados (Mês)"
            value="87"
            color="var(--success-500)"
          />
          <StatCard 
            label="Rascunhos"
            value="12"
            color="var(--warning-500)"
          />
          <StatCard 
            label="Clientes Ativos"
            value="15"
            color="var(--purple-500)"
          />
        </div>

        {/* Calendar */}
        <PostCalendar
          onAddPost={handleAddPost}
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
          onViewPost={handleViewPost}
        />

        {/* Best Times Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 border"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-light)'
          }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="text-lg">🤖</span>
            Sugestão da Val: Melhores Horários
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TimeSlot platform="Instagram" time="18:00 - 21:00" engagement="+45%" />
            <TimeSlot platform="Facebook" time="13:00 - 15:00" engagement="+32%" />
            <TimeSlot platform="LinkedIn" time="08:00 - 10:00" engagement="+28%" />
            <TimeSlot platform="Stories" time="12:00 - 14:00" engagement="+38%" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div 
      className="rounded-xl p-4 border"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-light)'
      }}
    >
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
}

// Time Slot Component
function TimeSlot({ platform, time, engagement }: { platform: string; time: string; engagement: string }) {
  return (
    <div 
      className="p-3 rounded-lg"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{platform}</p>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{time}</p>
      <p className="text-xs font-medium mt-1" style={{ color: 'var(--success-500)' }}>{engagement} engajamento</p>
    </div>
  );
}






