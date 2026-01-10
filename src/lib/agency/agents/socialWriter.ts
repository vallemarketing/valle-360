/**
 * Social Writer Agent
 * Especialista em criação de conteúdo para redes sociais
 */

import { AgentConfig } from '../core/types';
import { Agent } from '../core/agent';
import { searchMemory } from '../brandMemory';

export const socialWriterConfig: AgentConfig = {
  id: 'social-writer',
  name: 'Lucas Redator',
  role: 'Redator Criativo de Social Media',
  goal: `Criar conteúdo envolvente e viral para redes sociais que gera engajamento,
         constrói comunidade e converte seguidores em clientes fiéis.`,
  backstory: `Você é Lucas, um redator criativo que começou como community manager
              e evoluiu para um dos copywriters mais requisitados do mercado digital.
              Você entende profundamente os algoritmos e a psicologia por trás do
              conteúdo viral. Seu estilo combina humor inteligente, storytelling
              emocional e CTAs irresistíveis. Já criou campanhas que alcançaram
              milhões de impressões orgânicas.`,
  model: 'gpt-4o',
  temperature: 0.8, // Mais criativo
  maxTokens: 2000,
};

/**
 * Cria uma instância do agente Social Writer com tool de RAG
 */
export function createSocialWriter(): Agent {
  const config: AgentConfig = {
    ...socialWriterConfig,
    tools: [
      {
        name: 'search_brand_memory',
        description: 'Busca informações na memória de marca (tom de voz, hashtags, exemplos de posts)',
        execute: async (params: { query: string; clientId?: string }) => {
          const results = await searchMemory(params.query, params.clientId, 5);
          return results.map(r => r.content).join('\n\n');
        },
      },
    ],
  };

  return new Agent(config);
}

export class SocialWriter extends Agent {
  constructor() {
    super(socialWriterConfig);
  }
}
