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
  Mic,
  Plus,
  X,
  Check,
  CheckCheck,
  Users,
  Building2,
  ArrowLeft,
  Trash2,
  Reply,
  Heart,
  Play,
  Pause,
  Volume2,
  Clock,
  Edit3,
  MoreHorizontal
} from 'lucide-react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

// ==================== TIPOS ====================
interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_avatar: string
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read'
  type: 'text' | 'audio' | 'image' | 'file'
  audioUrl?: string
  audioDuration?: number
  reactions?: Array<{ emoji: string; userId: string }>
  replyTo?: { id: string; content: string; sender: string }
  isEdited?: boolean
  editedAt?: Date
}

interface Conversation {
  id: string
  type: 'team' | 'client' | 'group'
  participant_id?: string
  participant_name: string
  participant_avatar: string
  participant_role?: string
  last_message: string
  last_message_time: Date
  unread_count: number
  is_online: boolean
  is_typing?: boolean
  members?: number
}

type TabType = 'equipe' | 'clientes' | 'grupos'

// ==================== COMPONENTE PRINCIPAL ====================
export default function MensagensPage() {
  const [activeTab, setActiveTab] = useState<TabType>('equipe')
  const [allConversations, setAllConversations] = useState<Record<TabType, Conversation[]>>({
    equipe: [],
    clientes: [],
    grupos: []
  })
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Reply and Edit states
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [editContent, setEditContent] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calcular total de não lidas por aba
  const unreadCounts = {
    equipe: allConversations.equipe.reduce((acc, c) => acc + c.unread_count, 0),
    clientes: allConversations.clientes.reduce((acc, c) => acc + c.unread_count, 0),
    grupos: allConversations.grupos.reduce((acc, c) => acc + c.unread_count, 0)
  }

  useEffect(() => {
    loadData()
    const checkMobile = () => setIsMobileView(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      if (isMobileView) setShowMobileChat(true)
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
      loadAllConversations()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllConversations = () => {
    const mockConversations: Record<TabType, Conversation[]> = {
      equipe: [
        {
          id: '1',
          type: 'team',
          participant_id: 'user2',
          participant_name: 'Maria Silva',
          participant_avatar: 'https://ui-avatars.com/api/?name=Maria+Silva&background=4370d1&color=fff',
          participant_role: 'Designer',
          last_message: 'Oi! Conseguiu ver o projeto?',
          last_message_time: new Date(Date.now() - 5 * 60000),
          unread_count: 2,
          is_online: true,
          is_typing: false
        },
        {
          id: '2',
          type: 'team',
          participant_id: 'user3',
          participant_name: 'João Santos',
          participant_avatar: 'https://ui-avatars.com/api/?name=Joao+Santos&background=10b981&color=fff',
          participant_role: 'Desenvolvedor',
          last_message: 'Perfeito, vou ajustar!',
          last_message_time: new Date(Date.now() - 30 * 60000),
          unread_count: 0,
          is_online: false
        },
        {
          id: '3',
          type: 'team',
          participant_id: 'user4',
          participant_name: 'Ana Costa',
          participant_avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=f59e0b&color=fff',
          participant_role: 'Social Media',
          last_message: 'Vou enviar os posts para aprovação',
          last_message_time: new Date(Date.now() - 60 * 60000),
          unread_count: 0,
          is_online: true
        }
      ],
      clientes: [
        {
          id: '4',
          type: 'client',
          participant_id: 'client1',
          participant_name: 'Tech Solutions',
          participant_avatar: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=8b5cf6&color=fff',
          participant_role: 'Cliente',
          last_message: 'Aprovado! Podem seguir.',
          last_message_time: new Date(Date.now() - 2 * 60 * 60000),
          unread_count: 0,
          is_online: true
        },
        {
          id: '5',
          type: 'client',
          participant_id: 'client2',
          participant_name: 'E-commerce Plus',
          participant_avatar: 'https://ui-avatars.com/api/?name=Ecommerce+Plus&background=ec4899&color=fff',
          participant_role: 'Cliente',
          last_message: 'Preciso de ajustes no banner',
          last_message_time: new Date(Date.now() - 4 * 60 * 60000),
          unread_count: 3,
          is_online: false
        }
      ],
      grupos: [
        {
          id: '6',
          type: 'group',
          participant_name: 'Projeto Landing Page',
          participant_avatar: 'https://ui-avatars.com/api/?name=LP&background=06b6d4&color=fff',
          last_message: 'Ana: Finalizei os mockups',
          last_message_time: new Date(Date.now() - 15 * 60000),
          unread_count: 5,
          is_online: true,
          members: 4
        },
        {
          id: '7',
          type: 'group',
          participant_name: 'Equipe Design',
          participant_avatar: 'https://ui-avatars.com/api/?name=ED&background=f97316&color=fff',
          last_message: 'João: Reunião às 15h',
          last_message_time: new Date(Date.now() - 45 * 60000),
          unread_count: 0,
          is_online: true,
          members: 8
        }
      ]
    }

    setAllConversations(mockConversations)
  }

  // Ordenar conversas: não lidas primeiro, depois por data
  const getSortedConversations = (conversations: Conversation[]) => {
    return [...conversations].sort((a, b) => {
      // Não lidas primeiro
      if (a.unread_count > 0 && b.unread_count === 0) return -1
      if (a.unread_count === 0 && b.unread_count > 0) return 1
      // Depois por data mais recente
      return b.last_message_time.getTime() - a.last_message_time.getTime()
    })
  }

  const loadMessages = (conversationId: string) => {
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Oi! Tudo bem?',
        sender_id: 'user2',
        sender_name: 'Maria Silva',
        sender_avatar: 'https://ui-avatars.com/api/?name=Maria+Silva&background=4370d1&color=fff',
        timestamp: new Date(Date.now() - 30 * 60000),
        status: 'read',
        type: 'text'
      },
      {
        id: '2',
        content: 'Oi Maria! Tudo sim, e você?',
        sender_id: currentUserId,
        sender_name: 'Você',
        sender_avatar: 'https://ui-avatars.com/api/?name=Voce&background=10b981&color=fff',
        timestamp: new Date(Date.now() - 28 * 60000),
        status: 'read',
        type: 'text'
      },
      {
        id: '3',
        content: 'Conseguiu ver o projeto que enviei?',
        sender_id: 'user2',
        sender_name: 'Maria Silva',
        sender_avatar: 'https://ui-avatars.com/api/?name=Maria+Silva&background=4370d1&color=fff',
        timestamp: new Date(Date.now() - 25 * 60000),
        status: 'read',
        type: 'text'
      },
      {
        id: '4',
        content: 'Sim! Ficou muito bom. Só preciso de alguns ajustes no header.',
        sender_id: currentUserId,
        sender_name: 'Você',
        sender_avatar: 'https://ui-avatars.com/api/?name=Voce&background=10b981&color=fff',
        timestamp: new Date(Date.now() - 20 * 60000),
        status: 'read',
        type: 'text',
        reactions: [{ emoji: '👍', userId: 'user2' }]
      },
      {
        id: '5',
        content: 'Perfeito! Vou fazer os ajustes agora.',
        sender_id: 'user2',
        sender_name: 'Maria Silva',
        sender_avatar: 'https://ui-avatars.com/api/?name=Maria+Silva&background=4370d1&color=fff',
        timestamp: new Date(Date.now() - 5 * 60000),
        status: 'read',
        type: 'text'
      }
    ]

    setMessages(mockMessages)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() && !audioBlob) return

    // Se estiver editando
    if (editingMessage) {
      setMessages(prev => prev.map(m => 
        m.id === editingMessage.id 
          ? { ...m, content: editContent, isEdited: true, editedAt: new Date() }
          : m
      ))
      setEditingMessage(null)
      setEditContent('')
      return
    }

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: currentUserId,
      sender_name: 'Você',
      sender_avatar: 'https://ui-avatars.com/api/?name=Voce&background=10b981&color=fff',
      timestamp: new Date(),
      status: 'sent',
      type: audioBlob ? 'audio' : 'text',
      audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : undefined,
      audioDuration: recordingTime,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        sender: replyingTo.sender_name
      } : undefined
    }

    setMessages([...messages, message])
    setNewMessage('')
    setAudioBlob(null)
    setRecordingTime(0)
    setReplyingTo(null)

    // Simular mudança de status
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'delivered' } : m
      ))
    }, 1000)

    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'read' } : m
      ))
    }, 2000)
  }

  const handleEmojiSelect = (emoji: any) => {
    if (editingMessage) {
      setEditContent(prev => prev + emoji.native)
    } else {
      setNewMessage(prev => prev + emoji.native)
    }
    setShowEmojiPicker(false)
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const reactions = m.reactions || []
        const existingReaction = reactions.find(r => r.userId === currentUserId)
        if (existingReaction) {
          return { ...m, reactions: reactions.filter(r => r.userId !== currentUserId) }
        }
        return { ...m, reactions: [...reactions, { emoji, userId: currentUserId }] }
      }
      return m
    }))
  }

  // Verificar se pode editar (até 10 minutos)
  const canEditMessage = (message: Message) => {
    if (message.sender_id !== currentUserId) return false
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    return message.timestamp > tenMinutesAgo
  }

  const handleStartEdit = (message: Message) => {
    if (!canEditMessage(message)) return
    setEditingMessage(message)
    setEditContent(message.content)
  }

  const handleCancelEdit = () => {
    setEditingMessage(null)
    setEditContent('')
  }

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setAudioBlob(null)
      setRecordingTime(0)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const conversations = getSortedConversations(allConversations[activeTab])
  const filteredConversations = conversations.filter(c =>
    c.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ==================== RENDER STATUS ICON ====================
  const StatusIcon = ({ status }: { status: Message['status'] }) => {
    if (status === 'sending') return <Clock className="w-3 h-3 text-gray-400" />
    if (status === 'sent') return <Check className="w-3 h-3 text-gray-400" />
    if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-gray-400" />
    if (status === 'read') return <CheckCheck className="w-3 h-3 text-blue-500" />
    return null
  }

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4370d1' }} />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-73px)] flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Sidebar - Lista de Conversas */}
      <div 
        className={`${isMobileView && showMobileChat ? 'hidden' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r`}
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Mensagens</h1>
          
          {/* Tabs com badges */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {[
              { id: 'equipe', label: 'Equipe', icon: Users },
              { id: 'clientes', label: 'Clientes', icon: Building2 },
              { id: 'grupos', label: 'Grupos', icon: MessageCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-sm font-medium transition-all relative ${
                  activeTab === tab.id 
                    ? 'bg-white shadow-sm' 
                    : 'hover:bg-white/50'
                }`}
                style={{ 
                  color: activeTab === tab.id ? '#4370d1' : 'var(--text-secondary)'
                }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {unreadCounts[tab.id as TabType] > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCounts[tab.id as TabType] > 99 ? '99+' : unreadCounts[tab.id as TabType]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 cursor-pointer border-b transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                } ${conversation.unread_count > 0 ? 'bg-blue-50/50' : ''}`}
                style={{ borderColor: 'var(--border-light)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conversation.participant_avatar}
                      alt={conversation.participant_name}
                      className="w-12 h-12 rounded-full"
                    />
                    {conversation.type !== 'group' && (
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        conversation.is_online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    )}
                    {conversation.type === 'group' && conversation.members && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                        <span className="text-[9px] text-white font-bold">{conversation.members}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold truncate ${conversation.unread_count > 0 ? 'font-bold' : ''}`} style={{ color: 'var(--text-primary)' }}>
                        {conversation.participant_name}
                      </h3>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {formatMessageTime(conversation.last_message_time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'font-medium' : ''}`} style={{ color: conversation.unread_count > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {conversation.is_typing ? (
                          <span className="text-blue-500 italic">Digitando...</span>
                        ) : (
                          conversation.last_message
                        )}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        className={`${isMobileView && !showMobileChat ? 'hidden' : 'flex'} flex-1 flex-col`}
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div 
              className="p-4 flex items-center justify-between border-b flex-shrink-0"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
            >
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button 
                    onClick={() => setShowMobileChat(false)}
                    className="p-2 -ml-2 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  </button>
                )}
                <img
                  src={selectedConversation.participant_avatar}
                  alt={selectedConversation.participant_name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedConversation.participant_name}
                  </h2>
                  <p className="text-xs" style={{ color: selectedConversation.is_online ? '#10b981' : 'var(--text-tertiary)' }}>
                    {selectedConversation.is_typing 
                      ? 'Digitando...' 
                      : selectedConversation.is_online 
                        ? 'Online' 
                        : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <Phone className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <Video className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              }}
            >
              {messages.map((message) => {
                const isOwn = message.sender_id === currentUserId
                const canEdit = canEditMessage(message)
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                      {/* Reply Preview */}
                      {message.replyTo && (
                        <div 
                          className={`px-3 py-2 mb-1 rounded-t-lg border-l-4 text-xs ${
                            isOwn ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-400'
                          }`}
                        >
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{message.replyTo.sender}</p>
                          <p className="truncate" style={{ color: 'var(--text-secondary)' }}>{message.replyTo.content}</p>
                        </div>
                      )}
                      
                      <div 
                        className={`p-3 rounded-2xl relative group ${
                          isOwn 
                            ? 'bg-blue-500 text-white rounded-br-md' 
                            : 'bg-white rounded-bl-md shadow-sm'
                        }`}
                        style={!isOwn ? { border: '1px solid var(--border-light)' } : {}}
                      >
                        {/* Message Content */}
                        {message.type === 'text' && (
                          <p className={`text-sm ${isOwn ? 'text-white' : ''}`} style={!isOwn ? { color: 'var(--text-primary)' } : {}}>
                            {message.content}
                          </p>
                        )}
                        
                        {message.type === 'audio' && message.audioUrl && (
                          <AudioMessage 
                            url={message.audioUrl} 
                            duration={message.audioDuration || 0}
                            isOwn={isOwn}
                          />
                        )}
                        
                        {/* Time, Status and Edited */}
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          {message.isEdited && (
                            <span className={`text-[9px] italic ${isOwn ? 'text-white/60' : ''}`} style={!isOwn ? { color: 'var(--text-tertiary)' } : {}}>
                              editada
                            </span>
                          )}
                          <span className={`text-[10px] ${isOwn ? 'text-white/70' : ''}`} style={!isOwn ? { color: 'var(--text-tertiary)' } : {}}>
                            {formatMessageTime(message.timestamp)}
                          </span>
                          {isOwn && <StatusIcon status={message.status} />}
                        </div>

                        {/* Quick Actions */}
                        <div className={`absolute ${isOwn ? '-left-24' : '-right-24'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                          <button 
                            onClick={() => handleReaction(message.id, '❤️')}
                            className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                            title="Reagir"
                          >
                            <Heart className="w-3.5 h-3.5 text-red-500" />
                          </button>
                          <button 
                            onClick={() => setReplyingTo(message)}
                            className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                            title="Responder"
                          >
                            <Reply className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          {canEdit && (
                            <button 
                              onClick={() => handleStartEdit(message)}
                              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                              title="Editar (até 10 min)"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                          {message.reactions.map((reaction, i) => (
                            <span key={i} className="text-sm bg-white px-1.5 py-0.5 rounded-full shadow-sm border">
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyingTo && (
              <div 
                className="px-4 py-2 border-t flex items-center justify-between flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1 h-10 bg-blue-500 rounded" />
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#4370d1' }}>
                      Respondendo para {replyingTo.sender_name}
                    </p>
                    <p className="text-sm truncate max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                      {replyingTo.content}
                    </p>
                  </div>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                </button>
              </div>
            )}

            {/* Edit Mode Banner */}
            {editingMessage && (
              <div 
                className="px-4 py-2 border-t flex items-center justify-between flex-shrink-0"
                style={{ backgroundColor: '#fef3c7', borderColor: '#fcd34d' }}
              >
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Editando mensagem</span>
                </div>
                <button onClick={handleCancelEdit} className="p-1 hover:bg-amber-200 rounded">
                  <X className="w-4 h-4 text-amber-600" />
                </button>
              </div>
            )}

            {/* Input Area */}
            <div 
              className="p-4 border-t flex-shrink-0"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
            >
              {isRecording ? (
                // Recording UI
                <div className="flex items-center gap-4">
                  <button 
                    onClick={cancelRecording}
                    className="p-3 bg-red-100 rounded-full text-red-500 hover:bg-red-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-mono text-lg" style={{ color: 'var(--text-primary)' }}>
                      {formatTime(recordingTime)}
                    </span>
                    <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                  
                  <button 
                    onClick={stopRecording}
                    className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              ) : audioBlob ? (
                // Audio Preview
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                    className="p-3 bg-red-100 rounded-full text-red-500 hover:bg-red-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 flex items-center gap-3 p-3 bg-gray-100 rounded-full">
                    <Volume2 className="w-5 h-5 text-blue-500" />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      Áudio ({formatTime(recordingTime)})
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleSendMessage}
                    className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                // Normal Input
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <Smile className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 left-0 z-50">
                        <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Paperclip className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" />
                  
                  <input
                    type="text"
                    value={editingMessage ? editContent : newMessage}
                    onChange={(e) => editingMessage ? setEditContent(e.target.value) : setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={editingMessage ? "Editar mensagem..." : "Digite uma mensagem..."}
                    className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ 
                      backgroundColor: editingMessage ? '#fef9c3' : 'var(--bg-secondary)', 
                      borderColor: editingMessage ? '#fcd34d' : 'var(--border-light)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  
                  {(editingMessage ? editContent.trim() : newMessage.trim()) ? (
                    <button 
                      onClick={handleSendMessage}
                      className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600"
                    >
                      {editingMessage ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                    </button>
                  ) : (
                    <button 
                      onClick={startRecording}
                      className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Selecione uma conversa
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Escolha uma conversa para começar a trocar mensagens
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== AUDIO MESSAGE COMPONENT ====================
function AudioMessage({ url, duration, isOwn }: { url: string; duration: number; isOwn: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <audio 
        ref={audioRef} 
        src={url}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />
      
      <button 
        onClick={togglePlay}
        className={`p-2 rounded-full ${isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-blue-100 hover:bg-blue-200'}`}
      >
        {isPlaying ? (
          <Pause className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-blue-600'}`} />
        ) : (
          <Play className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-blue-600'}`} />
        )}
      </button>
      
      <div className="flex-1">
        <div className={`h-1 rounded-full ${isOwn ? 'bg-white/30' : 'bg-gray-200'}`}>
          <div 
            className={`h-1 rounded-full ${isOwn ? 'bg-white' : 'bg-blue-500'}`}
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <span className={`text-xs ${isOwn ? 'text-white/70' : ''}`} style={!isOwn ? { color: 'var(--text-tertiary)' } : {}}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
