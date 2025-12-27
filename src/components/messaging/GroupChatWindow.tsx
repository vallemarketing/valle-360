'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Settings, Users } from 'lucide-react';
import { TypingIndicator } from './TypingIndicator';
import { PresenceIndicator } from './PresenceIndicator';
import { GroupManagementModal } from './GroupManagementModal';
import { SeenByIndicator } from './SeenByIndicator';
import { AttachmentUpload } from './AttachmentUpload';
import { AttachmentViewer } from './AttachmentViewer';
import { EmojiPicker } from './EmojiPicker';
import { MessageReactions } from './MessageReactions';
import { MessageSearch } from './MessageSearch';
import { PinnedMessages } from './PinnedMessages';
import { PinMessageButton } from './PinMessageButton';
import { usePresence } from '@/hooks/usePresence';
import { useMessageNotification } from '@/hooks/useMessageNotification';
import { fetchProfilesMapByAuthIds } from '@/lib/messaging/userProfiles';

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

interface Message {
  id: string;
  body: string;
  from_user_id: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
  attachments?: Attachment[];
}

interface Group {
  id: string;
  name: string;
  description?: string;
  type: string;
}

interface GroupChatWindowProps {
  group: Group;
  currentUserId: string;
}

export function GroupChatWindow({ group, currentUserId }: GroupChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<any[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [groupParticipants, setGroupParticipants] = useState<Array<{ id: string; full_name: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef<number>(0);

  const { startTyping, stopTyping } = usePresence({
    userId: currentUserId,
    groupId: group.id,
  });

  const { playNotificationSound } = useMessageNotification();

  useEffect(() => {
    if (group?.id) {
      loadMessages();
      checkIfAdmin();
      loadParticipants();
      markAsRead();

      const channel = supabase
        .channel(`messages-${group.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `group_id=eq.${group.id}`,
          },
          (payload) => {
            const newMsg = payload.new as any;
            if (newMsg.from_user_id !== currentUserId) {
              playNotificationSound();
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
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [group?.id]);

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
        .from('messages')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const senderIds = Array.from(
        new Set((data || []).map((m: any) => String(m?.from_user_id || '')).filter(Boolean))
      );
      const profilesMap = await fetchProfilesMapByAuthIds(supabase as any, senderIds);

      const messagesWithAttachments = await Promise.all(
        (data || []).map(async (msg: any) => {
          const { data: attachments } = await supabase
            .from('message_attachments')
            .select('*')
            .eq('message_id', msg.id)
            .eq('message_type', 'group');

          return {
            ...msg,
            sender_name: profilesMap.get(String(msg.from_user_id))?.full_name,
            sender_avatar: profilesMap.get(String(msg.from_user_id))?.avatar_url,
            attachments: attachments || [],
          };
        })
      );

      const formattedMessages = messagesWithAttachments;

      if (!isLoading && formattedMessages.length > previousMessageCountRef.current) {
        const newMsgs = formattedMessages.slice(previousMessageCountRef.current);
        newMsgs.forEach(msg => {
          if (msg.from_user_id !== currentUserId) {
            setNewMessageIds(prev => new Set(prev).add(msg.id));
          }
        });
      }
      previousMessageCountRef.current = formattedMessages.length;

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('group_participants')
        .select('role')
        .eq('group_id', group.id)
        .eq('user_id', currentUserId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
    }
  };

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('group_participants')
        .select('user_id')
        .eq('group_id', group.id)
        .eq('is_active', true);

      if (error) throw error;

      const userIds = Array.from(new Set((data || []).map((p: any) => String(p?.user_id || '')).filter(Boolean)));
      const profilesMap = await fetchProfilesMapByAuthIds(supabase as any, userIds);

      const participants = (userIds || []).map((uid) => ({
        id: uid,
        full_name: profilesMap.get(uid)?.full_name || 'Usuário',
      }));

      setGroupParticipants(participants);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await supabase.rpc('mark_group_messages_as_read', {
        p_group_id: group.id,
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
        .from('messages')
        .insert({
          group_id: group.id,
          from_user_id: currentUserId,
          body: newMessage.trim() || '(anexo)',
          type: attachments.length > 0 ? 'attachment' : 'text',
        })
        .select()
        .single();

      if (messageError) throw messageError;

      if (attachments.length > 0 && messageData) {
        for (const attachment of attachments) {
          const file = attachment.file;
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `messages/${group.id}/${fileName}`;

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
            message_type: 'group',
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

  const renderMessage = (message: Message, index: number) => {
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
          style={{
            animation: newMessageIds.has(message.id) ? 'slideIn 0.3s ease-out' : undefined
          }}
        >
          {!isOwnMessage && (
            <div className="relative w-8 h-8 flex-shrink-0">
              {message.sender_avatar ? (
                <img
                  src={message.sender_avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs text-white font-medium">
                  {getInitials(message.sender_name || 'U')}
                </div>
              )}
              <div className="absolute bottom-0 right-0">
                <PresenceIndicator userId={message.from_user_id} size="sm" />
              </div>
            </div>
          )}

          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-md`}>
            {!isOwnMessage && (
              <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {message.sender_name}
              </span>
            )}

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

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
              <SeenByIndicator
                messageId={message.id}
                groupId={group.id}
                currentUserId={currentUserId}
                isOwnMessage={isOwnMessage}
              />
            </div>

            <div className="mt-2">
              <MessageReactions
                messageId={message.id}
                messageType="group"
                currentUserId={currentUserId}
                compact
              />
            </div>
          </div>

          {isAdmin && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
              <PinMessageButton
                messageId={message.id}
                messageType="group"
                conversationId={group.id}
                currentUserId={currentUserId}
                compact
              />
            </div>
          )}
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
            {group.description && (
              <p className="text-xs text-gray-500">{group.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <MessageSearch
            conversationId={group.id}
            conversationType="group"
            onResultClick={scrollToMessage}
            participants={groupParticipants}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsManagementOpen(true)}
            title="Gerenciar grupo"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <PinnedMessages
        conversationId={group.id}
        conversationType="group"
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

      <TypingIndicator groupId={group.id} currentUserId={currentUserId} />

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

      {isManagementOpen && (
        <GroupManagementModal
          isOpen={isManagementOpen}
          onClose={() => setIsManagementOpen(false)}
          groupId={group.id}
          groupName={group.name}
          groupDescription={group.description}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
