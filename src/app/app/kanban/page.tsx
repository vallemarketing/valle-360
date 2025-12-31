'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, GripVertical, MessageSquare, Paperclip, Edit2, Check, X, Trash2, User, Eye } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/supabase';
import { UserSelector } from '@/components/kanban/UserSelector';
import { CardDetailModal } from '@/components/kanban/CardDetailModal';
import { KanbanFilters, KanbanFiltersState } from '@/components/kanban/KanbanFilters';
import { NotificationCenter } from '@/components/kanban/NotificationCenter';
import KanbanInsights from '@/components/kanban/KanbanInsights';
import type { DbTaskPriority, DbTaskStatus } from '@/lib/kanban/types';
import { fetchProfileByAuthId, fetchProfilesMapByAuthIds } from '@/lib/messaging/userProfiles';
import { resolveEmployeeAreaKey } from '@/lib/employee/areaKey';
import type { AreaKey } from '@/lib/kanban/areaBoards';

interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  assignee_name?: string;
  priority: DbTaskPriority;
  tags?: string[];
  comments_count?: number;
  attachments_count?: number;
  column_id: string;
  position: number;
  due_date?: string;
  reference_links?: any;
}

interface Column {
  id: string;
  name: string;
  color: string;
  position: number;
  board_id: string;
  stage_key?: string | null;
  sla_hours?: number | null;
  wip_limit?: number | null;
}

interface Board {
  id: string;
  name: string;
  description?: string;
  area_key?: string | null;
}

type KanbanBoardFilter = 'all' | 'area_only';

function inferDbStatusFromColumn(column?: Column | null): DbTaskStatus {
  const stage = String(column?.stage_key || '').toLowerCase();
  const name = String(column?.name || '').toLowerCase();

  const s = stage || name;

  // Colunas do board "Super Admin" (sem stage_key)
  if (name.includes('backlog')) return 'backlog';
  if (name.includes('a fazer')) return 'todo';
  if (name.includes('em progresso')) return 'in_progress';
  if (name.includes('revis')) return 'in_review';
  if (name.includes('conclu')) return 'done';
  if (name.includes('bloque')) return 'blocked';
  if (name.includes('cancel')) return 'cancelled';

  // Boards por área (com stage_key)
  if (s === 'finalizado' || s.includes('final')) return 'done';
  if (s === 'bloqueado' || s.includes('bloque')) return 'blocked';
  if (s === 'aprovacao' || s.includes('aprov')) return 'in_review';
  if (s.includes('revisao')) return 'in_review';
  if (s === 'demanda' || s.includes('lead_demanda') || s.includes('lead')) return 'todo';

  return 'in_progress';
}

function TaskCard({
  task,
  onDelete,
  onEdit,
  onView
}: {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityLabel = (priority: DbTaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
      default:
        return 'Baixa';
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="mb-3">
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow group">
        <CardHeader className="pb-3 pt-3">
          <div className="flex items-start gap-2">
            <div {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
              <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <div className="flex-1" onClick={() => onView(task)} style={{ cursor: 'pointer' }}>
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                {task.title}
              </CardTitle>
              {task.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={getPriorityColor(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
                {task.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={() => onView(task)}
                title="Ver detalhes"
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={() => onEdit(task)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-600"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {task.assignee_name && (
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs text-white font-medium">
                    {task.assignee_name.charAt(0)}
                  </div>
                  <span>{task.assignee_name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {task.comments_count && task.comments_count > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{task.comments_count}</span>
                </div>
              )}
              {task.attachments_count && task.attachments_count > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  <span>{task.attachments_count}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableColumn({ column, children }: { column: Column; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div ref={setNodeRef} className="flex-1 min-h-[400px] p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {children}
    </div>
  );
}

function ColumnHeader({
  column,
  taskCount,
  onEdit,
  onDelete,
  canDelete
}: {
  column: Column;
  taskCount: number;
  onEdit: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(column.name);

  const handleSave = () => {
    if (editedName.trim() && editedName !== column.name) {
      onEdit(column.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(column.name);
    setIsEditing(false);
  };

  return (
    <div
      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 mb-3 group"
      style={{ borderLeftColor: column.color }}
    >
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="h-8 text-sm font-semibold"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0">
            <Check className="w-4 h-4 text-green-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{taskCount}</Badge>
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(column.id)}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
  columnId
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task;
  columnId?: string;
}) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    tags: task?.tags || [],
    column_id: task?.column_id || columnId || '',
    assigned_to: task?.assigned_to,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Digite o título da tarefa"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Digite a descrição (opcional)"
                className="w-full px-3 py-2 border rounded-md min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <UserSelector
              selectedUserId={formData.assigned_to}
              onSelect={(userId) => setFormData({ ...formData, assigned_to: userId })}
              label="Responsável"
              placeholder="Atribuir a alguém (opcional)"
            />

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as DbTaskPriority })}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags (separadas por vírgula)</label>
              <Input
                value={formData.tags?.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
                placeholder="Ex: Marketing, Design, Urgente"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                {task ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function KanbanPage() {
  const pathname = usePathname();
  const boardFilter: KanbanBoardFilter =
    pathname.startsWith('/admin/kanban-app') || pathname.startsWith('/colaborador/kanban') ? 'area_only' : 'all';
  const showBoardSelector = !pathname.startsWith('/colaborador/kanban');
  const isColaboradorKanban = pathname.startsWith('/colaborador/kanban');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragContext, setDragContext] = useState<{ taskId: string; fromColumnId: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [board, setBoard] = useState<Board | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<KanbanFiltersState>({
    assignees: [],
    tags: [],
    priorities: [],
    dueDateFilter: 'all',
  });
  const [currentUserType, setCurrentUserType] = useState<string>('');
  const [preferredAreaKey, setPreferredAreaKey] = useState<AreaKey | null>(null);

  const insightsColumns = useMemo(() => {
    return (columns || []).map((c) => {
      const cards = (tasks || [])
        .filter((t) => t.column_id === c.id)
        .map((t) => {
          const ref = (t.reference_links || {}) as any;
          const clientName =
            ref?.client?.company_name ||
            ref?.client?.name ||
            ref?.client_profile?.name ||
            undefined;
          return {
            id: t.id,
            title: t.title,
            clientName,
            assignees: [t.assigned_to].filter(Boolean) as string[],
            dueDate: t.due_date ? new Date(String(t.due_date)) : undefined,
            stageKey: c.stage_key || undefined,
          };
        });
      return {
        id: c.stage_key || c.name,
        stageKey: c.stage_key || undefined,
        title: c.name,
        color: c.color,
        cards,
        wipLimit: c.wip_limit || undefined,
      };
    });
  }, [columns, tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    void (async () => {
      const areaKey = await loadEmployeeAreaKeyIfNeeded();
      setPreferredAreaKey(areaKey);
      await loadBoards(areaKey);
      await loadCurrentUser();
    })();
  }, []);

  useEffect(() => {
    if (selectedBoardId) {
      loadKanbanData(selectedBoardId);
    }
  }, [selectedBoardId]);

  const loadEmployeeAreaKeyIfNeeded = async (): Promise<AreaKey | null> => {
    if (!isColaboradorKanban) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return null;
      const { data: employee } = await supabase
        .from('employees')
        .select('department, area_of_expertise, areas')
        .eq('user_id', user.id)
        .maybeSingle();

      return resolveEmployeeAreaKey({
        department: (employee as any)?.department ?? null,
        area_of_expertise: (employee as any)?.area_of_expertise ?? null,
        areas: (employee as any)?.areas ?? null,
      });
    } catch {
      return null;
    }
  };

  const loadBoards = async (preferred?: AreaKey | null) => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('kanban_boards')
        .select('id, name, description, area_key')
        .order('name');

      if (boardFilter === 'area_only') {
        query = query.not('area_key', 'is', null);
      }

      const { data: boardsData, error: boardsError } = await query;

      if (boardsError) throw boardsError;

      setBoards(boardsData || []);

      if (!boardsData || boardsData.length === 0) {
        setBoard(null);
        setColumns([]);
        setTasks([]);
        setSelectedBoardId(null);
        return;
      }

      const prevId = selectedBoardId;
      const prevStillExists = prevId ? boardsData.some((b) => b.id === prevId) : false;
      const preferredMatch =
        preferred ? boardsData.find((b) => String(b.area_key || '') === String(preferred)) : null;

      const nextId =
        prevStillExists
          ? (prevId as string)
          : isColaboradorKanban && preferredMatch?.id
            ? String(preferredMatch.id)
            : String(boardsData[0].id);

      setSelectedBoardId(nextId);
      setBoard(boardsData.find((b) => b.id === nextId) || null);
    } catch (error) {
      console.error('Erro ao carregar quadros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await fetchProfileByAuthId(supabase as any, user.id);
      setCurrentUserType(profile?.user_type || '');
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadKanbanData = async (boardId: string) => {
    try {
      setIsLoading(true);
      setBoard(boards.find((b) => b.id === boardId) || null);

      const { data: columnsData, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('board_id', boardId)
        .order('position');

      if (columnsError) throw columnsError;
      setColumns(columnsData || []);

      const { data: tasksData, error: tasksError } = await supabase
        .from('kanban_tasks')
        .select('*')
        .eq('board_id', boardId)
        .order('position');

      if (tasksError) throw tasksError;

      const assigneeIds = Array.from(
        new Set((tasksData || []).map((t: any) => t.assigned_to).filter(Boolean))
      ) as string[];

      const assigneeNameById = new Map<string, string>();
      if (assigneeIds.length > 0) {
        const profilesMap = await fetchProfilesMapByAuthIds(supabase as any, assigneeIds);
        assigneeIds.forEach((uid) => {
          const name = profilesMap.get(uid)?.full_name;
          if (name) assigneeNameById.set(uid, name);
        });
      }

      const formattedTasks = (tasksData || []).map((task: any) => ({
        ...task,
        assignee_name: task.assigned_to ? assigneeNameById.get(task.assigned_to) : undefined,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Erro ao carregar dados do Kanban:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (filters.assignees.length > 0) {
        if (!task.assigned_to || !filters.assignees.includes(task.assigned_to)) {
          return false;
        }
      }

      if (filters.tags.length > 0) {
        const hasMatchingTag = task.tags?.some(tag => filters.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      if (filters.priorities.length > 0) {
        if (!filters.priorities.includes(task.priority)) {
          return false;
        }
      }

      if (filters.dueDateFilter !== 'all') {
        const now = new Date();
        const taskDate = task.due_date ? new Date(task.due_date) : null;

        switch (filters.dueDateFilter) {
          case 'overdue':
            if (!taskDate || taskDate >= now) return false;
            break;
          case 'today':
            if (!taskDate || taskDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'this_week':
            if (!taskDate) return false;
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (taskDate < now || taskDate > weekFromNow) return false;
            break;
          case 'this_month':
            if (!taskDate || taskDate.getMonth() !== now.getMonth() || taskDate.getFullYear() !== now.getFullYear()) return false;
            break;
          case 'no_date':
            if (taskDate) return false;
            break;
        }
      }

      return true;
    });
  }, [tasks, searchTerm, filters]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    const t = tasks.find((x) => x.id === id);
    if (t?.column_id) setDragContext({ taskId: id, fromColumnId: t.column_id });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const overColumn = columns.find(c => c.id === overId);
    const overTask = tasks.find(t => t.id === overId);

    if (overColumn && activeTask.column_id !== overColumn.id) {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(t =>
          t.id === activeId ? { ...t, column_id: overColumn.id } : t
        );
        return updatedTasks;
      });
    } else if (overTask && activeTask.column_id === overTask.column_id) {
      setTasks(prevTasks => {
        const columnTasks = prevTasks.filter(t => t.column_id === activeTask.column_id);
        const oldIndex = columnTasks.findIndex(t => t.id === activeId);
        const newIndex = columnTasks.findIndex(t => t.id === overId);

        if (oldIndex !== newIndex) {
          const reorderedColumnTasks = arrayMove(columnTasks, oldIndex, newIndex);
          const otherTasks = prevTasks.filter(t => t.column_id !== activeTask.column_id);
          return [...otherTasks, ...reorderedColumnTasks];
        }

        return prevTasks;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);

    const { active } = event;
    const activeId = active.id as string;
    const activeTask = tasks.find(t => t.id === activeId);

    if (!activeTask) return;

    try {
      const now = new Date().toISOString();
      const targetColumn = columns.find((c) => c.id === activeTask.column_id) || null;
      const nextStatus = inferDbStatusFromColumn(targetColumn);

      const columnTasks = tasks.filter(t => t.column_id === activeTask.column_id);
      const newPosition = columnTasks.findIndex(t => t.id === activeId);

      // Se entrou em "aprovacao", registrar janela de aprovação do cliente (requested_at/due_at)
      const fromColumnId =
        dragContext?.taskId === activeId ? dragContext.fromColumnId : null;
      const fromCol = fromColumnId ? columns.find((c) => c.id === fromColumnId) || null : null;
      const enteredApproval =
        String(targetColumn?.stage_key || '').toLowerCase() === 'aprovacao' &&
        String(fromCol?.stage_key || '').toLowerCase() !== 'aprovacao';

      const existingRef = (activeTask as any)?.reference_links || {};
      const existingApproval = (existingRef?.client_approval || {}) as any;

      function addHours(iso: string, hours: number) {
        const d = new Date(iso);
        d.setHours(d.getHours() + hours);
        return d.toISOString();
      }

      const nextRef =
        enteredApproval
          ? {
              ...existingRef,
              client_approval: {
                ...existingApproval,
                status: 'pending',
                requested_at: existingApproval.requested_at || now,
                due_at: existingApproval.due_at || addHours(existingApproval.requested_at || now, Number(targetColumn?.sla_hours || 48)),
              },
            }
          : existingRef;

      const { error } = await supabase
        .from('kanban_tasks')
        .update({
          column_id: activeTask.column_id,
          position: newPosition,
          status: nextStatus,
          updated_at: now,
          ...(enteredApproval ? { reference_links: nextRef } : {}),
        })
        .eq('id', activeId);

      if (error) throw error;

      for (let i = 0; i < columnTasks.length; i++) {
        if (columnTasks[i].id !== activeId && i !== columnTasks[i].position) {
          await supabase
            .from('kanban_tasks')
            .update({ position: i })
            .eq('id', columnTasks[i].id);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      if (selectedBoardId) {
        loadKanbanData(selectedBoardId);
      }
    } finally {
      setDragContext(null);
    }
  };

  const handleColumnEdit = async (columnId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('kanban_columns')
        .update({ name: newName })
        .eq('id', columnId);

      if (error) throw error;

      setColumns(prev =>
        prev.map(col => (col.id === columnId ? { ...col, name: newName } : col))
      );
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
    }
  };

  const handleColumnDelete = async (columnId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta coluna? Todas as tarefas serão removidas.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('kanban_columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      setColumns(prev => prev.filter(col => col.id !== columnId));
      setTasks(prev => prev.filter(task => task.column_id !== columnId));
    } catch (error) {
      console.error('Erro ao deletar coluna:', error);
      alert('Erro ao deletar coluna. Verifique suas permissões.');
    }
  };

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const now = new Date().toISOString();

      if (editingTask) {
        const { error } = await supabase
          .from('kanban_tasks')
          .update({
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            tags: taskData.tags,
            assigned_to: taskData.assigned_to,
            updated_at: now,
          })
          .eq('id', editingTask.id);

        if (error) throw error;

        if (selectedBoardId) {
          await loadKanbanData(selectedBoardId);
        }
      } else {
        if (!board) return;

        const columnTasks = tasks.filter(t => t.column_id === taskData.column_id);
        const newPosition = columnTasks.length;
        const targetColumn = columns.find((c) => c.id === taskData.column_id) || null;
        const status = inferDbStatusFromColumn(targetColumn);

        const { data, error } = await supabase
          .from('kanban_tasks')
          .insert({
            board_id: board.id,
            column_id: taskData.column_id,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            status,
            tags: taskData.tags,
            position: newPosition,
            assigned_to: taskData.assigned_to,
            created_by: user.id,
            updated_at: now,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          if (selectedBoardId) {
            await loadKanbanData(selectedBoardId);
          }
        }
      }

      setEditingTask(undefined);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskView = (task: Task) => {
    setViewingTask(task);
  };

  const handleNewTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleNotificationTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setViewingTask(task);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {board?.name || 'Kanban'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {board?.description || 'Gerencie tarefas e projetos com drag & drop'}
          </p>
          {showBoardSelector && boards.length > 1 && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quadro</label>
              <select
                value={selectedBoardId || ''}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="mt-1 w-full max-w-sm px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <NotificationCenter onNotificationClick={handleNotificationTaskClick} />
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => handleNewTask(columns[0]?.id)}
            disabled={columns.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Insights (IA + métricas reais/fallback) */}
      {board?.id && (
        <KanbanInsights
          boardId={board.id}
          area={board?.name || 'Kanban'}
          columns={insightsColumns as any}
        />
      )}

      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar tarefas por título, descrição ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <KanbanFilters onFiltersChange={setFilters} availableTags={availableTags} />
      </div>

      {boards.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isColaboradorKanban
                ? 'Nenhum quadro foi encontrado para sua área. Verifique se seu cadastro tem área preenchida (department/area_of_expertise) e se o admin executou a seed de boards por área.'
                : 'Nenhum quadro encontrado.'}
            </p>
          </CardContent>
        </Card>
      ) : columns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma coluna encontrada para este quadro. Confirme se a seed de boards por área foi aplicada no Supabase.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => {
              const columnTasks = filteredTasks.filter(t => t.column_id === column.id);
              return (
                <div key={column.id} className="flex flex-col">
                  <ColumnHeader
                    column={column}
                    taskCount={columnTasks.length}
                    onEdit={handleColumnEdit}
                    onDelete={handleColumnDelete}
                    canDelete={currentUserType === 'super_admin' && !board?.area_key}
                  />

                  <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <DroppableColumn column={column}>
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onDelete={handleTaskDelete}
                          onEdit={handleTaskEdit}
                          onView={handleTaskView}
                        />
                      ))}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-600 dark:text-gray-400"
                        onClick={() => handleNewTask(column.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar tarefa
                      </Button>
                    </DroppableColumn>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeId && tasks.find(t => t.id === activeId) ? (
              <div className="rotate-3">
                <TaskCard
                  task={tasks.find(t => t.id === activeId)!}
                  onDelete={() => {}}
                  onEdit={() => {}}
                  onView={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(undefined);
        }}
        onSave={handleTaskSave}
        task={editingTask}
        columnId={selectedColumnId}
      />

      {viewingTask && (
        <CardDetailModal
          task={viewingTask}
          isOpen={!!viewingTask}
          onClose={() => setViewingTask(null)}
          onUpdate={() => {
            if (selectedBoardId) void loadKanbanData(selectedBoardId);
          }}
        />
      )}
    </div>
  );
}
