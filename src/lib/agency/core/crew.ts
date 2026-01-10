/**
 * Predictive Agency - Crew Orchestrator
 * Orquestra múltiplos agentes trabalhando em tarefas sequenciais
 */

import { Agent } from './agent';
import {
  CrewConfig,
  CrewResult,
  TaskConfig,
  TaskResult,
  AgentExecutionContext,
} from './types';

export class Crew {
  private config: CrewConfig;
  private agents: Map<string, Agent> = new Map();

  constructor(config: CrewConfig) {
    this.config = config;

    // Inicializa agentes
    for (const agentConfig of config.agents) {
      this.agents.set(agentConfig.id, new Agent(agentConfig));
    }
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  /**
   * Ordena tarefas baseado em dependências (topological sort)
   */
  private orderTasks(tasks: TaskConfig[]): TaskConfig[] {
    const ordered: TaskConfig[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const taskMap = new Map(tasks.map(t => [t.id, t]));

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      if (temp.has(taskId)) {
        throw new Error(`Dependência circular detectada na task ${taskId}`);
      }

      temp.add(taskId);
      const task = taskMap.get(taskId);
      if (!task) return;

      for (const depId of task.dependencies || []) {
        visit(depId);
      }

      temp.delete(taskId);
      visited.add(taskId);
      ordered.push(task);
    };

    for (const task of tasks) {
      visit(task.id);
    }

    return ordered;
  }

  /**
   * Executa a crew (todas as tarefas em ordem)
   */
  async run(baseContext?: AgentExecutionContext): Promise<CrewResult> {
    const startTime = Date.now();
    const taskResults: TaskResult[] = [];
    const taskOutputs: Record<string, string> = {};

    if (this.config.verbose) {
      console.log(`\n🚀 Iniciando Crew: ${this.config.name}`);
      console.log(`📋 Tarefas: ${this.config.tasks.length}`);
      console.log(`🤖 Agentes: ${this.config.agents.length}\n`);
    }

    try {
      // Ordena tarefas por dependências
      const orderedTasks = this.orderTasks(this.config.tasks);

      for (const task of orderedTasks) {
        const agent = this.agents.get(task.agentId);
        if (!agent) {
          throw new Error(`Agente "${task.agentId}" não encontrado para task "${task.id}"`);
        }

        if (this.config.verbose) {
          console.log(`\n📌 Task: ${task.id}`);
          console.log(`🤖 Agente: ${agent.name} (${agent.role})`);
        }

        const taskStart = Date.now();

        // Monta contexto com outputs anteriores
        const context: AgentExecutionContext = {
          ...baseContext,
          previousTaskOutputs: { ...taskOutputs },
          metadata: { ...baseContext?.metadata, ...task.context },
        };

        const output = await agent.execute(
          task.description,
          task.expectedOutput,
          context
        );

        const durationMs = Date.now() - taskStart;
        taskOutputs[task.id] = output;

        const result: TaskResult = {
          taskId: task.id,
          agentId: task.agentId,
          output,
          durationMs,
          executedAt: new Date(),
        };

        taskResults.push(result);

        if (this.config.verbose) {
          console.log(`✅ Completa em ${durationMs}ms`);
          console.log(`📝 Output (preview): ${output.slice(0, 200)}...`);
        }
      }

      // O output final é o resultado da última tarefa
      const finalOutput = taskResults[taskResults.length - 1]?.output || '';

      return {
        crewId: this.config.id,
        success: true,
        taskResults,
        finalOutput,
        totalDurationMs: Date.now() - startTime,
      };
    } catch (error: any) {
      if (this.config.verbose) {
        console.error(`❌ Erro na Crew: ${error.message}`);
      }

      return {
        crewId: this.config.id,
        success: false,
        taskResults,
        finalOutput: '',
        totalDurationMs: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Limpa histórico de todos os agentes
   */
  reset(): void {
    for (const agent of this.agents.values()) {
      agent.clearHistory();
    }
  }
}
