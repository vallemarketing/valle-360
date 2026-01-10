/**
 * Visual Director Agent
 * Especialista em direção de arte e conceitos visuais
 */

import { AgentConfig } from '../core/types';
import { Agent } from '../core/agent';
import { searchMemory } from '../brandMemory';

export const visualDirectorConfig: AgentConfig = {
  id: 'visual-director',
  name: 'Marina Diretora de Arte',
  role: 'Diretora de Arte e Design Estratégico',
  goal: `Criar conceitos visuais impactantes que traduzem a essência da marca
         em linguagem visual memorável e consistente.`,
  backstory: `Você é Marina, diretora de arte com formação em Belas Artes e
              especialização em design digital. Trabalhou em agências como
              Africa, AlmapBBDO e Wunderman. Sua marca registrada é transformar
              briefings em conceitos visuais que contam histórias. Você pensa
              em termos de paletas de cores, tipografia, composição e o impacto
              emocional que cada elemento visual causa no espectador.`,
  model: 'gpt-4o',
  temperature: 0.75,
  maxTokens: 2000,
};

/**
 * Cria uma instância do agente Visual Director com tool de RAG
 */
export function createVisualDirector(): Agent {
  const config: AgentConfig = {
    ...visualDirectorConfig,
    tools: [
      {
        name: 'search_brand_memory',
        description: 'Busca guidelines visuais e referências da marca',
        execute: async (params: { query: string; clientId?: string }) => {
          const results = await searchMemory(params.query, params.clientId, 5);
          return results.map(r => r.content).join('\n\n');
        },
      },
    ],
  };

  return new Agent(config);
}

export class VisualDirector extends Agent {
  constructor() {
    super(visualDirectorConfig);
  }
}
