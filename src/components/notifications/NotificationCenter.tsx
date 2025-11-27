'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, Check, CheckCheck, Trash2, 
  MessageSquare, Calendar, AlertTriangle, 
  Trophy, FileText, Users, Clock
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  info: <Bell className="w-4 h-4" />,
  success: <Check className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  error: <AlertTriangle className="w-4 h-4" />,
  task: <FileText className="w-4 h-4" />,
  approval: <Clock className="w-4 h-4" />,
  mention: <MessageSquare className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  achievement: <Trophy className="w-4 h-4" />,
  team: <Users className="w-4 h-4" />
};

const NOTIFICATION_COLORS: Record<string, string> = {
  info: 'var(--primary-500)',
  success: 'var(--success-500)',
  warning: 'var(--warning-500)',
  error: 'var(--error-500)',
  task: 'var(--primary-500)',
  approval: 'var(--warning-500)',
  mention: 'var(--purple-500)',
  meeting: 'var(--info-500)',
  achievement: 'var(--warning-500)',
  team: 'var(--success-500)'
};

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors"
        style={{ backgroundColor: isOpen ? 'var(--bg-tertiary)' : 'transparent' }}
      >
        <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--error-500)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-xl border z-50 overflow-hidden"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)'
              }}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Notificações
                  </h3>
                  {unreadCount > 0 && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)'
                      }}
                    >
                      {unreadCount} novas
                    </span>
                  )}
                </div>
                
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: 'var(--primary-500)' }}
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell 
                      className="w-12 h-12 mx-auto mb-3 opacity-20" 
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      Nenhuma notificação
                    </p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                    {notifications.map((notification) => (
                      <motion.button
                        key={notification.id}
                        whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full p-4 text-left transition-colors"
                        style={{
                          backgroundColor: notification.read 
                            ? 'transparent' 
                            : 'var(--primary-50)'
                        }}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ 
                              backgroundColor: `${NOTIFICATION_COLORS[notification.type]}20`,
                              color: NOTIFICATION_COLORS[notification.type]
                            }}
                          >
                            {NOTIFICATION_ICONS[notification.type] || <Bell className="w-4 h-4" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p 
                              className={`text-sm ${notification.read ? '' : 'font-semibold'}`}
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {notification.title}
                            </p>
                            <p 
                              className="text-xs mt-0.5 line-clamp-2"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {notification.message}
                            </p>
                            <p 
                              className="text-xs mt-1"
                              style={{ color: 'var(--text-tertiary)' }}
                            >
                              {formatDistanceToNow(notification.createdAt, { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                              style={{ backgroundColor: 'var(--primary-500)' }}
                            />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div 
                  className="p-3 border-t text-center"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <a
                    href="/colaborador/notificacoes"
                    className="text-sm font-medium transition-colors hover:underline"
                    style={{ color: 'var(--primary-500)' }}
                  >
                    Ver todas as notificações
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

