'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, AlertCircle, Calendar, Link as LinkIcon, Upload } from 'lucide-react';
import { PhaseField, PhaseConfig } from '@/lib/kanban/phaseFields';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface PhaseTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Record<string, any>) => void;
  fromPhase: PhaseConfig;
  toPhase: PhaseConfig;
  cardTitle: string;
  existingData?: Record<string, any>;
  clients?: Array<{ id: string; name: string }>;
  employees?: Array<{ id: string; name: string }>;
}

export function PhaseTransitionModal({
  isOpen,
  onClose,
  onConfirm,
  fromPhase,
  toPhase,
  cardTitle,
  existingData = {},
  clients = [],
  employees = []
}: PhaseTransitionModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(existingData);
      setErrors({});
    }
  }, [isOpen, existingData]);

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const handleMultiSelectChange = (fieldId: string, value: string, checked: boolean) => {
    const currentValues = formData[fieldId] || [];
    if (checked) {
      setFormData(prev => ({ ...prev, [fieldId]: [...currentValues, value] }));
    } else {
      setFormData(prev => ({ ...prev, [fieldId]: currentValues.filter((v: string) => v !== value) }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    toPhase.fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} é obrigatório`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm({
        ...formData,
        _transition: {
          from: fromPhase.id,
          to: toPhase.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const renderField = (field: PhaseField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    const baseInputClass = `w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
    }`;

    switch (field.type) {
      case 'text':
      case 'url':
      case 'number':
        return (
          <div className="relative">
            {field.type === 'url' && (
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
            <input
              type={field.type === 'url' ? 'url' : field.type}
              value={value}
              onChange={(e) => handleChange(field.id, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={field.placeholder}
              className={`${baseInputClass} ${field.type === 'url' ? 'pl-10' : ''}`}
            />
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={baseInputClass}
          />
        );

      case 'date':
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={`${baseInputClass} pl-10`}
            />
          </div>
        );

      case 'select':
        // Se for campo de cliente, usar lista de clientes
        if (field.id === 'client_id') {
          return (
            <select
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={baseInputClass}
            >
              <option value="">Selecione um cliente...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          );
        }
        // Se for campo de responsável, usar lista de colaboradores
        if (field.id === 'assignee' || field.id === 'reviewer') {
          return (
            <select
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={baseInputClass}
            >
              <option value="">Selecione...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          );
        }
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClass}
          >
            <option value="">Selecione...</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
            {field.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                <input
                  type="checkbox"
                  checked={(formData[field.id] || []).includes(opt.value)}
                  onChange={(e) => handleMultiSelectChange(field.id, opt.value, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Sim</span>
          </label>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Mover Card</h2>
                <p className="text-sm text-gray-600 mt-1">{cardTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Transition indicator */}
            <div className="flex items-center gap-3 mt-4">
              <div 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: fromPhase.color }}
              >
                {fromPhase.title}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: toPhase.color }}
              >
                {toPhase.title}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              {toPhase.fields.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {field.helpText && (
                    <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                  )}
                  {errors[field.id] && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirmar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

