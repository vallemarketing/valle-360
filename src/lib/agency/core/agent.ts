/**
 * Predictive Agency - Base Agent Class
 * Classe base para todos os agentes de IA
 */

import OpenAI from 'openai';
import { AgentConfig, AgentMessage, AgentExecutionContext, AgentTool } from './types';

export class Agent {
  private config: AgentConfig;
  private openai: OpenAI;
  private conversationHistory: AgentMessage[] = [];

  constructor(config: AgentConfig) {
    this.config = {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000,
      ...config,
    };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    this.openai = new OpenAI({ apiKey });
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get role(): string {
    return this.config.role;
  }

  /**
   * Monta o system prompt do agente
   */
  private buildSystemPrompt(context?: AgentExecutionContext): string {
    let prompt = `Você é ${this.config.name}, um ${this.config.role}.

## Seu Objetivo
${this.config.goal}

## Seu Background
${this.config.backstory}

## Diretrizes
- Seja objetivo e profissional
- Foque em entregar valor real e acionável
- Use dados e insights quando disponíveis
- Responda sempre em português do Brasil
`;

    // Adiciona contexto de memória de marca se disponível
    if (context?.brandMemory && context.brandMemory.length > 0) {
      prompt += `
## Memória de Marca (Contexto RAG)
Os seguintes trechos são conhecimento da marca/cliente que você deve considerar:

${context.brandMemory.map((chunk, i) => `[${i + 1}] ${chunk}`).join('\n\n')}
`;
    }

    // Adiciona outputs de tarefas anteriores
    if (context?.previousTaskOutputs && Object.keys(context.previousTaskOutputs).length > 0) {
      prompt += `
## Contexto de Tarefas Anteriores
Resultados de agentes que trabalharam antes de você nesta crew:

${Object.entries(context.previousTaskOutputs)
  .map(([taskId, output]) => `### Tarefa: ${taskId}\n${output}`)
  .join('\n\n')}
`;
    }

    // Adiciona descrição das tools disponíveis
    if (this.config.tools && this.config.tools.length > 0) {
      prompt += `
## Ferramentas Disponíveis
Você pode usar as seguintes ferramentas (chame-as no formato JSON quando necessário):

${this.config.tools.map(t => `- **${t.name}**: ${t.description}`).join('\n')}
`;
    }

    return prompt;
  }

  /**
   * Executa uma tarefa
   */
  async execute(
    taskDescription: string,
    expectedOutput: string,
    context?: AgentExecutionContext
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);

    const userMessage = `## Tarefa
${taskDescription}

## Output Esperado
${expectedOutput}

Por favor, execute esta tarefa com base no seu papel e conhecimento.`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await this.openai.chat.completions.create({
      model: this.config.model!,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    const output = response.choices[0]?.message?.content || '';

    // Adiciona ao histórico
    this.conversationHistory.push({ role: 'user', content: userMessage });
    this.conversationHistory.push({ role: 'assistant', content: output });

    return output;
  }

  /**
   * Limpa o histórico de conversação
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Executa uma tool específica
   */
  async useTool(toolName: string, params: Record<string, any>): Promise<any> {
    const tool = this.config.tools?.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" não encontrada para o agente ${this.name}`);
    }
    return tool.execute(params);
  }
}
