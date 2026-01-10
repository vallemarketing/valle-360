/**
 * Predictive Agency - Core Types
 * Sistema de agentes de IA em TypeScript
 */

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  model?: string; // default: gpt-4o
  temperature?: number; // default: 0.7
  maxTokens?: number; // default: 2000
  tools?: AgentTool[];
}

export interface AgentTool {
  name: string;
  description: string;
  execute: (params: Record<string, any>) => Promise<any>;
}

export interface TaskConfig {
  id: string;
  description: string;
  expectedOutput: string;
  agentId: string;
  context?: Record<string, any>;
  dependencies?: string[]; // IDs de tasks que devem ser executadas antes
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  output: string;
  metadata?: Record<string, any>;
  executedAt: Date;
  durationMs: number;
}

export interface CrewConfig {
  id: string;
  name: string;
  description: string;
  agents: AgentConfig[];
  tasks: TaskConfig[];
  verbose?: boolean;
}

export interface CrewResult {
  crewId: string;
  success: boolean;
  taskResults: TaskResult[];
  finalOutput: string;
  totalDurationMs: number;
  error?: string;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentExecutionContext {
  clientId?: string;
  brandMemory?: string[]; // Chunks do RAG
  previousTaskOutputs?: Record<string, string>;
  metadata?: Record<string, any>;
}
