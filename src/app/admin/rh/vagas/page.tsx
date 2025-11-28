'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Search, Filter, Users, Eye,
  Edit3, Trash2, Linkedin, Globe, Clock, MapPin,
  TrendingUp, CheckCircle, XCircle, Pause
} from 'lucide-react';
import { JobPostGenerator } from '@/components/rh/JobPostGenerator';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  contractType: string;
  status: 'draft' | 'active' | 'paused' | 'closed';
  applications: number;
  views: number;
  createdAt: Date;
  publishedAt?: Date;
  platforms: string[];
}

const SAMPLE_JOBS: Job[] = [
  {
    id: '1',
    title: 'Designer Gráfico Sênior',
    department: 'Design',
    location: 'São Paulo, SP',
    locationType: 'hybrid',
    contractType: 'CLT',
    status: 'active',
    applications: 47,
    views: 1234,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    platforms: ['linkedin', 'website']
  },
  {
    id: '2',
    title: 'Gestor de Tráfego Pago',
    department: 'Marketing',
    location: 'Remoto',
    locationType: 'remote',
    contractType: 'PJ',
    status: 'active',
    applications: 32,
    views: 890,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    platforms: ['linkedin']
  },
  {
    id: '3',
    title: 'Social Media Pleno',
    department: 'Marketing',
    location: 'São Paulo, SP',
    locationType: 'onsite',
    contractType: 'CLT',
    status: 'paused',
    applications: 18,
    views: 456,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    platforms: ['linkedin', 'website']
  },
  {
    id: '4',
    title: 'Desenvolvedor Front-end',
    department: 'Desenvolvimento',
    location: 'Remoto',
    locationType: 'remote',
    contractType: 'PJ',
    status: 'draft',
    applications: 0,
    views: 0,
    createdAt: new Date(),
    platforms: []
  }
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  draft: { color: 'var(--neutral-700)', bg: 'var(--neutral-100)', label: 'Rascunho', icon: <Edit3 className="w-4 h-4" /> },
  active: { color: 'var(--success-700)', bg: 'var(--success-100)', label: 'Ativa', icon: <CheckCircle className="w-4 h-4" /> },
  paused: { color: 'var(--warning-700)', bg: 'var(--warning-100)', label: 'Pausada', icon: <Pause className="w-4 h-4" /> },
  closed: { color: 'var(--error-700)', bg: 'var(--error-100)', label: 'Encerrada', icon: <XCircle className="w-4 h-4" /> }
};

export default function VagasPage() {
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    applications: jobs.reduce((sum, j) => sum + j.applications, 0),
    views: jobs.reduce((sum, j) => sum + j.views, 0)
  };

  const handleSaveJob = (jobData: any) => {
    console.log('Salvar vaga:', jobData);
    setShowCreateModal(false);
    // TODO: Save to database
  };

  const handlePublishJob = (jobData: any, platforms: string[]) => {
    console.log('Publicar vaga:', jobData, 'em:', platforms);
    setShowCreateModal(false);
    // TODO: Publish to platforms
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-100)' }}
            >
              <Briefcase className="w-7 h-7" style={{ color: 'var(--primary-500)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Gestão de Vagas
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Crie e gerencie vagas de emprego
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white"
            style={{ backgroundColor: 'var(--primary-500)' }}
          >
            <Plus className="w-4 h-4" />
            Nova Vaga
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total de Vagas" value={stats.total} icon={<Briefcase className="w-5 h-5" />} color="var(--primary-500)" />
          <StatCard label="Vagas Ativas" value={stats.active} icon={<CheckCircle className="w-5 h-5" />} color="var(--success-500)" />
          <StatCard label="Candidaturas" value={stats.applications} icon={<Users className="w-5 h-5" />} color="var(--purple-500)" />
          <StatCard label="Visualizações" value={stats.views} icon={<Eye className="w-5 h-5" />} color="var(--warning-500)" />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar vaga..."
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

          <div className="flex gap-2">
            {['all', 'active', 'paused', 'draft', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: filterStatus === status ? 'var(--primary-500)' : 'var(--bg-primary)',
                  color: filterStatus === status ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${filterStatus === status ? 'var(--primary-500)' : 'var(--border-light)'}`
                }}
              >
                {status === 'all' ? 'Todas' : STATUS_CONFIG[status]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => {
            const status = STATUS_CONFIG[job.status];
            
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl p-5 border"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-light)'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Status & Title */}
                    <div className="flex items-center gap-3 mb-2">
                      <span 
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: status.bg, color: status.color }}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {job.title}
                      </h3>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.contractType}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: 'var(--purple-500)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {job.applications} candidaturas
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" style={{ color: 'var(--primary-500)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {job.views} visualizações
                        </span>
                      </div>
                      {job.platforms.length > 0 && (
                        <div className="flex items-center gap-2">
                          {job.platforms.includes('linkedin') && (
                            <Linkedin className="w-4 h-4" style={{ color: '#0A66C2' }} />
                          )}
                          {job.platforms.includes('website') && (
                            <Globe className="w-4 h-4" style={{ color: 'var(--primary-500)' }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <Eye className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <button
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <Edit3 className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    {job.status === 'active' && (
                      <button
                        className="p-2 rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--warning-100)' }}
                      >
                        <Pause className="w-4 h-4" style={{ color: 'var(--warning-600)' }} />
                      </button>
                    )}
                    <button
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'var(--error-100)' }}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--error-600)' }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase 
                className="w-16 h-16 mx-auto mb-4 opacity-20"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <p style={{ color: 'var(--text-secondary)' }}>
                Nenhuma vaga encontrada
              </p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 z-50"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Criar Nova Vaga
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    ✕
                  </button>
                </div>
                <JobPostGenerator 
                  onSave={handleSaveJob}
                  onPublish={handlePublishJob}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div 
      className="rounded-xl p-4 border"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-light)'
      }}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  );
}


