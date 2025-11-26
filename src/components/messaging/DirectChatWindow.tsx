'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, Check, CheckCheck, History, Bell, Search } from 'lucide-react';
import { PresenceIndicator } from './PresenceIndicator';
import { usePresence } from '@/hooks/usePresence';
import { useMessageNotification } from '@/hooks/useMessageNotification';
import { ClientInteractionHistory } from './ClientInteractionHistory';
import { AttachmentUpload } from './AttachmentUpload';
import { AttachmentViewer } from './AttachmentViewer';
import { EmojiPicker } from './EmojiPicker';
import { MessageReactions } from './MessageReactions';
import { MessageSearch } from './MessageSearch';
import { PinnedMessages } from './PinnedMessages';
import { PinMessageButton } from './PinMessageButton';

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail_url?: string;
}

interface DirectMessage {
  id: string;
  body: string;
  from_user_id: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  sender_avatar?: string;
  attachments?: Attachment[];
}

interface DirectConversation {
  id: string;
  is_client_conversation: boolean;
  other_user_id: string;
  other_user_name: string;
  other_user_email: string;
  other_user_avatar?: string;
}

interface DirectChatWindowProps {
  conversation: DirectConversation;
  currentUserId: string;
}

export function DirectChatWindow({ conversation, currentUserId }: DirectChatWindowProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { startTyping, stopTyping } = usePresence({
    userId: currentUserId,
  });

  const { playNotificationSound } = useMessageNotification();

  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
      markAsRead();

      const channel = supabase
        .channel(`direct-messages-${conversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `conversation_id=eq.${conversation.id}`,
          },
          (payload) => {
            const newMsg = payload.new as any;
            if (newMsg.from_user_id !== currentUserId) {
              playNotificationSound(conversation.is_client_conversation);
              setNewMessageIds(prev => new Set(prev).add(newMsg.id));
              setTimeout(() => {
                setNewMessageIds(prev => {
                  const updated = new Set(prev);
                  updated.delete(newMsg.id);
                  return updated;
                });
              }, 500);
            }
            loadMessages();
            markAsRead();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message_read_receipts',
          },
          () => {
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:user_profiles!direct_messages_from_user_id_fkey(full_name, avatar_url)
        `)
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const messagesWithAttachments = await Promise.all(
        (data || []).map(async (msg: any) => {
          const { data: attachments } = await supabase
            .from('message_attachments')
            .select('*')
            .eq('message_id', msg.id)
            .eq('message_type', 'direct');

          return { ...msg, attachments: attachments || [] };
        })
      );

      if (error) throw error;

      const messagesWithReadStatus = await Promise.all(
        messagesWithAttachments.map(async (msg: any) => {
          let isRead = false;

          if (msg.from_user_id !== currentUserId) {
            const { data: receipt } = await supabase
              .from('message_read_receipts')
              .select('id')
              .eq('message_id', msg.id)
              .eq('message_type', 'direct')
              .eq('user_id', currentUserId)
              .maybeSingle();

            isRead = !!receipt;
          } else {
            const { data: receipt } = await supabase
              .from('message_read_receipts')
              .select('id')
              .eq('message_id', msg.id)
              .eq('message_type', 'direct')
              .eq('user_id', conversation.other_user_id)
              .maybeSingle();

            isRead = !!receipt;
          }

          return {
            ...msg,
            is_read: isRead,
            sender_name: msg.sender?.full_name,
            sender_avatar: msg.sender?.avatar_url,
          };
        })
      );

      setMessages(messagesWithReadStatus);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await supabase.rpc('mark_direct_messages_as_read', {
        p_conversation_id: conversation.id,
        p_user_id: currentUserId,
      });
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || isSending) return;

    setIsSending(true);
    stopTyping();

    try {
      const { data: messageData, error: messageError } = await supabase
        .from('direct_messages')
        .insert({
          conversation_id: conversation.id,
          from_user_id: currentUserId,
          body: newMessage.trim() || '(anexo)',
          message_type: attachments.length > 0 ? 'attachment' : 'text',
        })
        .select()
        .single();

      if (messageError) throw messageError;

      if (attachments.length > 0 && messageData) {
        for (const attachment of attachments) {
          const file = attachment.file;
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `messages/${conversation.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Erro ao fazer upload:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('attachments')
            .getPublicUrl(filePath);

          await supabase.from('message_attachments').insert({
            message_id: messageData.id,
            message_type: 'direct',
            file_name: file.name,
            file_url: publicUrl,
            file_type: attachment.type,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: currentUserId,
          });
        }
      }

      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (e.target.value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement && messagesContainerRef.current) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderMessage = (message: DirectMessage, index: number) => {
    const isOwnMessage = message.from_user_id === currentUserId;
    const showDate =
      index === 0 ||
      new Date(messages[index - 1].created_at).toDateString() !==
        new Date(message.created_at).toDateString();

    return (
      <div key={message.id}>
        {showDate && (
          <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              {formatDate(message.created_at)}
            </span>
          </div>
        )}

        <div
          id={`message-${message.id}`}
          className={`flex gap-3 mb-4 group ${isOwnMessage ? 'flex-row-reverse' : ''} ${
            newMessageIds.has(message.id) ? 'animate-slide-in' : ''
          } ${highlightedMessageId === message.id ? 'bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-lg' : ''}`}
        >
          {!isOwnMessage && (
            <div className="relative w-8 h-8 flex-shrink-0">
              {conversation.other_user_avatar ? (
                <img
                  src={conversation.other_user_avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs text-white font-medium">
                  {getInitials(conversation.other_user_name || 'U')}
                </div>
              )}
              <div className="absolute bottom-0 right-0">
                <PresenceIndicator userId={conversation.other_user_id} size="sm" />
              </div>
            </div>
          )}

          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-md`}>
            <div
              className={`rounded-2xl px-4 py-2 ${
                isOwnMessage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              {message.body && message.body !== '(anexo)' && (
                <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
              )}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment: Attachment) => (
                    <AttachmentViewer key={attachment.id} attachment={attachment} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
              {isOwnMessage && (
                <span title={message.is_read ? 'Lida' : 'Enviada'}>
                  {message.is_read ? (
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Check className="w-3 h-3 text-gray-500" />
                  )}
                </span>
              )}
            </div>

            <div className="mt-2">
              <MessageReactions
                messageId={message.id}
                messageType="direct"
                currentUserId={currentUserId}
                compact
              />
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            <PinMessageButton
              messageId={message.id}
              messageType="direct"
              conversationId={conversation.id}
              currentUserId={currentUserId}
              compact
            />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {conversation.other_user_avatar ? (
              <img
                src={conversation.other_user_avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium">
                {getInitials(conversation.other_user_name)}
              </div>
            )}
            <div className="absolute bottom-0 right-0">
              <PresenceIndicator userId={conversation.other_user_id} size="md" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {conversation.other_user_name}
              </h3>
              {conversation.is_client_conversation && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Cliente
                </span>
              )}
            </div>
            <PresenceIndicator userId={conversation.other_user_id} showLabel size="sm" />
          </div>
        </div>
        <div className="flex gap-2">
          <MessageSearch
            conversationId={conversation.id}
            conversationType="direct"
            onResultClick={scrollToMessage}
            participants={[{ id: conversation.other_user_id, full_name: conversation.other_user_name }]}
          />
          {conversation.is_client_conversation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(true)}
              title="Histórico de interações"
            >
              <History className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <PinnedMessages
        conversationId={conversation.id}
        conversationType="direct"
        currentUserId={currentUserId}
        onMessageClick={scrollToMessage}
      />

      <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <Send className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Nenhuma mensagem ainda</p>
              <p className="text-xs text-gray-400 mt-1">
                Seja o primeiro a enviar uma mensagem!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t space-y-3">
        <AttachmentUpload
          onAttachmentsChange={setAttachments}
          maxFiles={5}
          maxSizeInMB={50}
        />
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onBlur={() => stopTyping()}
            placeholder="Digite uma mensagem..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={(!newMessage.trim() && attachments.length === 0) || isSending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {conversation.is_client_conversation && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Conversando com cliente - Mensagens são prioritárias
          </p>
        </div>
      )}

      {showHistory && (
        <ClientInteractionHistory
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          clientId={conversation.other_user_id}
          clientName={conversation.other_user_name}
          conversationId={conversation.id}
        />
      )}
    </div>
  );
}
