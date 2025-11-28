'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Smile, Search, Phone, Video,
  MoreVertical, Check, CheckCheck, Image, File,
  Users, User, ArrowLeft, Plus
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isOnline?: boolean;
}

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    type: 'group',
    name: 'Equipe Design',
    participants: ['1', '2', '3'],
    lastMessage: {
      id: '1',
      content: 'O banner ficou ótimo!',
      senderId: '2',
      senderName: 'Maria',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      timestamp: new Date(Date.now() - 300000),
      status: 'read',
      type: 'text'
    },
    unreadCount: 0
  },
  {
    id: '2',
    type: 'direct',
    name: 'João Silva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    participants: ['1', '4'],
    lastMessage: {
      id: '2',
      content: 'Pode me ajudar com o projeto?',
      senderId: '4',
      senderName: 'João Silva',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
      timestamp: new Date(Date.now() - 3600000),
      status: 'delivered',
      type: 'text'
    },
    unreadCount: 2,
    isOnline: true
  },
  {
    id: '3',
    type: 'group',
    name: 'Aprovações - Tech Corp',
    participants: ['1', '2', '5', '6'],
    lastMessage: {
      id: '3',
      content: 'Cliente aprovou o vídeo!',
      senderId: '5',
      senderName: 'Ana',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      timestamp: new Date(Date.now() - 7200000),
      status: 'read',
      type: 'text'
    },
    unreadCount: 0
  }
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Oi pessoal! O cliente mandou feedback sobre o banner.',
    senderId: '2',
    senderName: 'Maria',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    timestamp: new Date(Date.now() - 3600000),
    status: 'read',
    type: 'text'
  },
  {
    id: '2',
    content: 'Qual foi o feedback?',
    senderId: '1',
    senderName: 'Você',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
    timestamp: new Date(Date.now() - 3500000),
    status: 'read',
    type: 'text'
  },
  {
    id: '3',
    content: 'Ele pediu para aumentar um pouco a logo e mudar a cor do CTA para verde.',
    senderId: '2',
    senderName: 'Maria',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    timestamp: new Date(Date.now() - 3400000),
    status: 'read',
    type: 'text'
  },
  {
    id: '4',
    content: 'Beleza, vou ajustar agora!',
    senderId: '1',
    senderName: 'Você',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
    timestamp: new Date(Date.now() - 3300000),
    status: 'read',
    type: 'text'
  },
  {
    id: '5',
    content: 'O banner ficou ótimo!',
    senderId: '2',
    senderName: 'Maria',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    timestamp: new Date(Date.now() - 300000),
    status: 'read',
    type: 'text'
  }
];

export default function ChatPage() {
  const { user } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(SAMPLE_CONVERSATIONS[0]);
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: user?.id || '1',
      senderName: user?.fullName || 'Você',
      senderAvatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
      timestamp: new Date(),
      status: 'sent',
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate status update
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'delivered' } : m
      ));
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Conversations List */}
      <div 
        className={`${showMobileList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r`}
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Mensagens
            </h1>
            <button 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <Plus className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
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

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <motion.button
              key={conversation.id}
              whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
              onClick={() => {
                setSelectedConversation(conversation);
                setShowMobileList(false);
              }}
              className={`w-full p-4 flex items-center gap-3 border-b transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-opacity-50' : ''
              }`}
              style={{ 
                borderColor: 'var(--border-light)',
                backgroundColor: selectedConversation?.id === conversation.id 
                  ? 'var(--primary-50)' 
                  : 'transparent'
              }}
            >
              {/* Avatar */}
              <div className="relative">
                {conversation.type === 'group' ? (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--primary-100)' }}
                  >
                    <Users className="w-6 h-6" style={{ color: 'var(--primary-500)' }} />
                  </div>
                ) : (
                  <img 
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                {conversation.isOnline && (
                  <div 
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                    style={{ 
                      backgroundColor: 'var(--success-500)',
                      borderColor: 'var(--bg-primary)'
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {conversation.name}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                {conversation.lastMessage && (
                  <p 
                    className="text-sm truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {conversation.type === 'group' && `${conversation.lastMessage.senderName}: `}
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>

              {/* Unread Badge */}
              {conversation.unreadCount > 0 && (
                <span 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: 'var(--primary-500)' }}
                >
                  {conversation.unreadCount}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className={`${showMobileList ? 'hidden' : 'flex'} md:flex flex-col flex-1`}>
          {/* Chat Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowMobileList(true)}
                className="md:hidden p-2 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>

              {selectedConversation.type === 'group' ? (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary-100)' }}
                >
                  <Users className="w-5 h-5" style={{ color: 'var(--primary-500)' }} />
                </div>
              ) : (
                <img 
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}

              <div>
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedConversation.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {selectedConversation.type === 'group' 
                    ? `${selectedConversation.participants.length} participantes`
                    : selectedConversation.isOnline ? 'Online' : 'Offline'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <Phone className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
              <button 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <Video className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
              <button 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <MoreVertical className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            {messages.map((message, index) => {
              const isOwn = message.senderId === (user?.id || '1');
              const showAvatar = !isOwn && (
                index === 0 || 
                messages[index - 1].senderId !== message.senderId
              );

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwn && showAvatar && (
                    <img 
                      src={message.senderAvatar}
                      alt={message.senderName}
                      className="w-8 h-8 rounded-full mr-2 self-end"
                    />
                  )}
                  {!isOwn && !showAvatar && <div className="w-8 mr-2" />}

                  <div className={`max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
                    {!isOwn && showAvatar && selectedConversation.type === 'group' && (
                      <p className="text-xs mb-1 ml-1" style={{ color: 'var(--text-tertiary)' }}>
                        {message.senderName}
                      </p>
                    )}
                    <div 
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                      }`}
                      style={{
                        backgroundColor: isOwn ? 'var(--primary-500)' : 'var(--bg-primary)',
                        color: isOwn ? 'white' : 'var(--text-primary)'
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {formatTime(message.timestamp)}
                      </span>
                      {isOwn && (
                        message.status === 'read' ? (
                          <CheckCheck className="w-3 h-3" style={{ color: 'var(--primary-500)' }} />
                        ) : message.status === 'delivered' ? (
                          <CheckCheck className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                        ) : (
                          <Check className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            className="p-4 border-t"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div 
              className="flex items-end gap-2 p-2 rounded-xl border"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)'
              }}
            >
              <button className="p-2 rounded-lg transition-colors hover:bg-white/50">
                <Paperclip className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              </button>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm p-2"
                style={{ 
                  color: 'var(--text-primary)',
                  maxHeight: '120px'
                }}
              />
              <button className="p-2 rounded-lg transition-colors hover:bg-white/50">
                <Smile className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: newMessage.trim() ? 'var(--primary-500)' : 'var(--neutral-300)',
                  color: 'white'
                }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-center">
            <Users 
              className="w-16 h-16 mx-auto mb-4 opacity-20"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>
              Selecione uma conversa para começar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


