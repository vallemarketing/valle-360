'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Filter, Search, Bell } from 'lucide-react';
import { ApprovalFlow } from '@/components/approvals/ApprovalFlow';

export default function AprovacoesPage() {
  const [viewMode, setViewMode] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = async (itemId: string, comment?: string) => {
    console.log('Aprovar:', itemId, comment);
    // TODO: Call API to approve
  };

  const handleReject = async (itemId: string, comment: string) => {
    console.log('Rejeitar:', itemId, comment);
    // TODO: Call API to reject
  };

  const handleRequestRevision = async (itemId: string, comment: string) => {
    console.log('Solicitar revisão:', itemId, comment);
    // TODO: Call API to request revision
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--success-100)' }}
            >
              <CheckCircle className="w-7 h-7" style={{ color: 'var(--success-500)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Aprovações
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Gerencie aprovações de conteúdo
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar aprovação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 pl-10 rounded-xl border"
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
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'pending', label: 'Pendentes', color: 'var(--warning-500)' },
            { id: 'all', label: 'Todas', color: 'var(--primary-500)' },
            { id: 'approved', label: 'Aprovadas', color: 'var(--success-500)' },
            { id: 'rejected', label: 'Rejeitadas', color: 'var(--error-500)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                backgroundColor: viewMode === tab.id ? tab.color : 'var(--bg-primary)',
                color: viewMode === tab.id ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${viewMode === tab.id ? tab.color : 'var(--border-light)'}`
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Approval Flow */}
        <ApprovalFlow
          viewMode={viewMode}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestRevision={handleRequestRevision}
        />
      </div>
    </div>
  );
}






