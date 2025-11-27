'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Image as ImageIcon,
  File,
  Plus,
  X,
  Check,
  CheckCheck,
  Filter
} from 'lucide-react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_avatar: string
  timestamp: Date
  read: boolean
  attachments?: Array<{
    type: 'image' | 'file' | 'drive'
    url: string
    name: string
  }>
}

interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_avatar: string
  participant_role: string
  last_message: string
  last_message_time: Date
  unread_count: number
  is_online: boolean
}

export default function MensagensPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all')
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)

      // Carregar conversas simuladas (você adaptará para seu schema)
      const mockConversations: Conversation[] = [
        {
          id: '1',
          participant_id: 'user2',
          participant_name: 'Maria Silva',
          participant_avatar: 'https://ui-avatars.com/api/?name=Maria+Silva',
          participant_role: 'Designer',
          last_message: 'Oi! Conseguiu ver o projeto?',
          last_message_time: new Date(Date.now() - 5 * 60000),
          unread_count: 2,
          is_online: true
        },
        {
          id: '2',
          participant_id: 'user3',
          participant_name: 'João Santos',
          participant_avatar: 'https://ui-avatars.com/api/?name=Joao+Santos',
          participant_role: 'Desenvolvedor',
          last_message: 'Perfeito, vou ajustar!',
          last_message_time: new Date(Date.now() - 30 * 60000),
          unread_count: 0,
          is_online: false
        }
      ]

      setConversations(mockConversations)

      // Carregar usuários disponíveis para nova conversa
      const { data: employees } = await supabase
        .from('employees')
        .select('user_id, full_name, employee_areas_of_expertise(area_name)')
      
      setAvailableUsers(employees || [])
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    // Mensagens simuladas (adaptar para seu schema)
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Oi! Como vai o projeto?',
        sender_id: 'user2',
        sender_name: 'Maria Silva',
        sender_avatar: 'https://ui-avatars.com/api/?name=Maria+Silva',
        timestamp: new Date(Date.now() - 60 * 60000),
        read: true
      },
      {
        id: '2',
        content: 'Vai bem! Estou terminando o design.',
        sender_id: currentUserId,
        sender_name: 'Você',
        sender_avatar: '',
        timestamp: new Date(Date.now() - 55 * 60000),
        read: true
      },
      {
        id: '3',
        content: 'Ótimo! Conseguiu ver o projeto?',
        sender_id: 'user2',
        sender_name: 'Maria Silva',
        sender_avatar: 'https://ui-avatars.com/api/?name=Maria+Silva',
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
        attachments: [
          {
            type: 'image',
            url: 'https://via.placeholder.com/400x300',
            name: 'design-mockup.png'
          }
        ]
      }
    ]

    setMessages(mockMessages)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: currentUserId,
      sender_name: 'Você',
      sender_avatar: '',
      timestamp: new Date(),
      read: false
    }

    setMessages([...messages, message])
    setNewMessage('')

    // TODO: Salvar mensagem no banco
    // await supabase.from('messages').insert({ ... })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // TODO: Upload para Supabase Storage ou Google Drive
    console.log('📎 Arquivos selecionados:', files)
  }

  const startNewConversation = (userId: string) => {
    const user = availableUsers.find(u => u.user_id === userId)
    if (!user) return

    const newConv: Conversation = {
      id: `new-${Date.now()}`,
      participant_id: userId,
      participant_name: user.full_name,
      participant_avatar: `https://ui-avatars.com/api/?name=${user.full_name}`,
      participant_role: user.employee_areas_of_expertise?.[0]?.area_name || 'Colaborador',
      last_message: '',
      last_message_time: new Date(),
      unread_count: 0,
      is_online: false
    }

    setConversations([newConv, ...conversations])
    setSelectedConversation(newConv)
    setMessages([])
    setShowNewConversation(false)
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || (filterType === 'unread' && conv.unread_count > 0)
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--primary-500)' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Carregando mensagens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      
      {/* Sidebar - Lista de Conversas */}
      <div 
        className="w-full md:w-80 border-r flex flex-col"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)'
        }}
      >
        {/* Header da Sidebar */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Mensagens
            </h2>
            <button
              onClick={() => setShowNewConversation(!showNewConversation)}
              className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
              style={{ backgroundColor: 'var(--primary-500)', color: 'white' }}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Busca */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all' ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: filterType === 'all' ? 'var(--primary-100)' : 'var(--bg-secondary)',
                color: filterType === 'all' ? 'var(--primary-700)' : 'var(--text-secondary)',
                // ringColor não é uma propriedade CSS válida, usando boxShadow ou outline se necessário
                // ringColor: 'var(--primary-500)'
              }}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'unread' ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: filterType === 'unread' ? 'var(--primary-100)' : 'var(--bg-secondary)',
                color: filterType === 'unread' ? 'var(--primary-700)' : 'var(--text-secondary)',
                // ringColor removido
                // ringColor: 'var(--primary-500)'
              }}
            >
              Não lidas
            </button>
          </div>
        </div>

        {/* Nova Conversa */}
        <AnimatePresence>
          {showNewConversation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b overflow-hidden"
              style={{ 
                backgroundColor: 'var(--primary-50)',
                borderColor: 'var(--border-light)'
              }}
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Nova Conversa
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableUsers.map(user => (
                    <button
                      key={user.user_id}
                      onClick={() => startNewConversation(user.user_id)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-opacity-80 transition-all text-left"
                      style={{ backgroundColor: 'var(--bg-primary)' }}
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.full_name}`}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {user.full_name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {user.employee_areas_of_expertise?.[0]?.area_name || 'Colaborador'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`w-full flex items-center gap-3 p-4 border-b hover:bg-opacity-50 transition-all ${
                selectedConversation?.id === conv.id ? 'bg-opacity-30' : ''
              }`}
              style={{
                borderColor: 'var(--border-light)',
                backgroundColor: selectedConversation?.id === conv.id ? 'var(--primary-50)' : 'transparent'
              }}
            >
              <div className="relative">
                <img
                  src={conv.participant_avatar}
                  alt={conv.participant_name}
                  className="w-12 h-12 rounded-full"
                />
                {conv.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {conv.participant_name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {conv.last_message_time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {conv.last_message}
                  </p>
                  {conv.unread_count > 0 && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: 'var(--primary-500)' }}
                    >
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Área de Mensagens */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          
          {/* Header da Conversa */}
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedConversation.participant_avatar}
                  alt={selectedConversation.participant_name}
                  className="w-10 h-10 rounded-full"
                />
                {selectedConversation.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedConversation.participant_name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {selectedConversation.is_online ? 'Online' : 'Offline'} • {selectedConversation.participant_role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <Phone className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <Video className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <MoreVertical className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-md ${msg.sender_id === currentUserId ? 'order-2' : 'order-1'}`}>
                  {msg.sender_id !== currentUserId && (
                    <p className="text-xs mb-1 ml-1" style={{ color: 'var(--text-tertiary)' }}>
                      {msg.sender_name}
                    </p>
                  )}
                  <div
                    className="px-4 py-2 rounded-2xl"
                    style={{
                      backgroundColor: msg.sender_id === currentUserId 
                        ? 'var(--primary-500)' 
                        : 'var(--bg-primary)',
                      color: msg.sender_id === currentUserId 
                        ? 'white' 
                        : 'var(--text-primary)'
                    }}
                  >
                    <p className="text-sm">{msg.content}</p>
                    
                    {/* Anexos */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.attachments.map((att, idx) => (
                          <div key={idx}>
                            {att.type === 'image' ? (
                              <img 
                                src={att.url} 
                                alt={att.name}
                                className="rounded-lg max-w-full"
                              />
                            ) : (
                              <div 
                                className="flex items-center gap-2 p-2 rounded-lg"
                                style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                              >
                                <File className="w-4 h-4" />
                                <span className="text-xs">{att.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 ml-1">
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.sender_id === currentUserId && (
                      msg.read ? 
                        <CheckCheck className="w-3 h-3" style={{ color: 'var(--primary-500)' }} /> :
                        <Check className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <div 
            className="p-4 border-t"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div className="flex items-end gap-2">
              
              {/* Botões de Ação */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <Paperclip className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <Smile className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </button>
              </div>

              {/* Input */}
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  rows={1}
                  className="w-full px-4 py-3 rounded-xl border resize-none focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-primary)'
                  }}
                />

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 left-0 z-50">
                    <Picker 
                      data={data} 
                      onEmojiSelect={(emoji: any) => {
                        setNewMessage(prev => prev + emoji.native)
                        setShowEmojiPicker(false)
                      }}
                      theme="light"
                    />
                  </div>
                )}
              </div>

              {/* Botão Enviar */}
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: 'var(--primary-500)',
                  color: 'white'
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="flex-1 flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Selecione uma conversa
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Escolha uma conversa existente ou inicie uma nova
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
