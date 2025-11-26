'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import {
  X,
  MessageSquare,
  Paperclip,
  Clock,
  Send,
  Download,
  Trash2,
  Upload,
  File,
  Image as ImageIcon,
  FileText,
  User,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assignee_name?: string;
  priority: string;
  tags?: string[];
  column_id: string;
  due_date?: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
}

interface HistoryEntry {
  id: string;
  user_id: string;
  action_type: string;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user_name?: string;
}

interface CardDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function CardDetailModal({ task, isOpen, onClose, onUpdate }: CardDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments' | 'history'>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && task) {
      loadComments();
      loadAttachments();
      loadHistory();
    }
  }, [isOpen, task?.id]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('kanban_comments')
        .select(`
          *,
          user:user_profiles!kanban_comments_user_id_fkey(full_name, avatar_url)
        `)
        .eq('task_id', task.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedComments = (data || []).map((comment: any) => ({
        ...comment,
        user_name: comment.user?.full_name,
        user_avatar: comment.user?.avatar_url,
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const loadAttachments = async () => {
    try {
      const { data, error } = await supabase
        .from('kanban_attachments')
        .select(`
          *,
          uploader:user_profiles!kanban_attachments_uploaded_by_fkey(full_name)
        `)
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAttachments = (data || []).map((attachment: any) => ({
        ...attachment,
        uploader_name: attachment.uploader?.full_name,
      }));

      setAttachments(formattedAttachments);
    } catch (error) {
      console.error('Erro ao carregar anexos:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('kanban_history')
        .select(`
          *,
          user:user_profiles!kanban_history_user_id_fkey(full_name)
        `)
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedHistory = (data || []).map((entry: any) => ({
        ...entry,
        user_name: entry.user?.full_name || 'Sistema',
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('kanban_comments')
        .insert({
          task_id: task.id,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      await loadComments();
      onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${task.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('kanban-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('kanban_attachments')
          .insert({
            task_id: task.id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: fileName,
            uploaded_by: user.id,
          });

        if (dbError) throw dbError;
      }

      await loadAttachments();
      onUpdate();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('kanban-attachments')
        .download(attachment.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      alert('Erro ao baixar arquivo');
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    if (!confirm('Tem certeza que deseja deletar este anexo?')) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('kanban-attachments')
        .remove([attachment.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('kanban_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) throw dbError;

      await loadAttachments();
      onUpdate();
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
      alert('Erro ao deletar anexo');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getActionLabel = (entry: HistoryEntry) => {
    const actions: Record<string, string> = {
      created: 'criou a tarefa',
      moved: 'moveu de',
      assigned: 'atribuiu para',
      priority_changed: 'alterou a prioridade de',
      due_date_changed: 'alterou a data de vencimento de',
      updated: 'atualizou',
    };
    return actions[entry.action_type] || entry.action_type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{task.title}</CardTitle>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{task.description}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-4">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Comentários ({comments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'attachments'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Paperclip className="w-4 h-4" />
                <span>Anexos ({attachments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Histórico ({history.length})</span>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
            {activeTab === 'comments' && (
              <div className="p-4 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum comentário ainda</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                        {comment.user_name?.charAt(0) || <User className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {comment.user_name || 'Usuário'}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="p-4 space-y-3">
                {attachments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum anexo ainda</p>
                ) : (
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="text-gray-600 dark:text-gray-400">
                        {getFileIcon(attachment.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {attachment.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.file_size)} • {attachment.uploader_name} • {formatDate(attachment.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAttachment(attachment)}
                          className="h-8 w-8 p-0 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-4 space-y-3">
                {history.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum histórico ainda</p>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">{entry.user_name}</span> {getActionLabel(entry)}
                          {entry.old_value && entry.new_value && (
                            <span>
                              {' '}
                              <span className="text-red-600">{entry.old_value}</span> para{' '}
                              <span className="text-green-600">{entry.new_value}</span>
                            </span>
                          )}
                          {!entry.old_value && entry.new_value && (
                            <span> <span className="font-medium">{entry.new_value}</span></span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(entry.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>

        <div className="flex-shrink-0 border-t p-4 bg-gray-50 dark:bg-gray-900">
          {activeTab === 'comments' && (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário... (@mencione usuários)"
                disabled={isSubmittingComment}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}

          {activeTab === 'attachments' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingFile ? 'Enviando...' : 'Adicionar Anexo'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
