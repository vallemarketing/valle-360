'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export interface HistoryEntry {
  id: string;
  type: 'created' | 'moved' | 'updated' | 'comment';
  fromPhase?: string;
  toPhase?: string;
  user: string;
  timestamp: Date;
  data?: Record<string, any>;
  comment?: string;
}

interface CardHistoryProps {
  history: HistoryEntry[];
  phaseColors: Record<string, string>;
  phaseNames: Record<string, string>;
}

export function CardHistory({ history, phaseColors, phaseNames }: CardHistoryProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <FileText className="w-4 h-4" />;
      case 'moved':
        return <ArrowRight className="w-4 h-4" />;
      case 'updated':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'comment':
        return <User className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionText = (entry: HistoryEntry) => {
    switch (entry.type) {
      case 'created':
        return 'criou este card';
      case 'moved':
        return (
          <span className="flex items-center gap-1 flex-wrap">
            moveu de{' '}
            <span 
              className="px-2 py-0.5 rounded text-xs text-white font-medium"
              style={{ backgroundColor: phaseColors[entry.fromPhase || ''] || '#6b7280' }}
            >
              {phaseNames[entry.fromPhase || ''] || entry.fromPhase}
            </span>
            <ArrowRight className="w-3 h-3" />
            <span 
              className="px-2 py-0.5 rounded text-xs text-white font-medium"
              style={{ backgroundColor: phaseColors[entry.toPhase || ''] || '#6b7280' }}
            >
              {phaseNames[entry.toPhase || ''] || entry.toPhase}
            </span>
          </span>
        );
      case 'updated':
        return 'atualizou informações';
      case 'comment':
        return 'adicionou um comentário';
      default:
        return 'realizou uma ação';
    }
  };

  const renderFilledFields = (data: Record<string, any>) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    // Filtrar campos internos
    const displayData = Object.entries(data).filter(([key]) => !key.startsWith('_'));
    
    if (displayData.length === 0) return null;

    return (
      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs font-medium text-gray-500 mb-1">Campos preenchidos:</p>
        <div className="space-y-1">
          {displayData.slice(0, 5).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-600">
              <span className="font-medium">{formatFieldName(key)}:</span>{' '}
              <span>{formatFieldValue(value)}</span>
            </div>
          ))}
          {displayData.length > 5 && (
            <p className="text-xs text-gray-400">+{displayData.length - 5} campos</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Histórico
      </h4>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="space-y-4">
          {history.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-10"
            >
              {/* Timeline dot */}
              <div 
                className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                  entry.type === 'created' ? 'bg-green-100 text-green-600' :
                  entry.type === 'moved' ? 'bg-blue-100 text-blue-600' :
                  entry.type === 'updated' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}
              >
                {getIcon(entry.type)}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{entry.user}</span>{' '}
                      {getActionText(entry)}
                    </p>
                    
                    {entry.comment && (
                      <p className="mt-1 text-sm text-gray-600 italic">"{entry.comment}"</p>
                    )}
                    
                    {entry.data && renderFilledFields(entry.data)}
                  </div>
                  
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(entry.timestamp, { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-1">
                  {format(entry.timestamp, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Funções auxiliares
function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatFieldValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }
  if (value instanceof Date) {
    return format(value, 'dd/MM/yyyy', { locale: ptBR });
  }
  return String(value);
}

