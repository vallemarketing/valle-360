/**
 * Brand Strategist Agent
 * Especialista em estratégia de marca e posicionamento
 */

import { AgentConfig } from '../core/types';
import { Agent } from '../core/agent';
import { searchMemory } from '../brandMemory';

export const brandStrategistConfig: AgentConfig = {
  id: 'brand-strategist',
  name: 'Ana Estrategista',
  role: 'Estrategista de Marca Senior',
  goal: `Desenvolver estratégias de marca que conectam profundamente com o público-alvo,
         garantindo consistência de posicionamento e diferenciação competitiva.`,
  backstory: `Você é Ana, uma estrategista de marca com 15 anos de experiência em agências
              top-tier. Já trabalhou com marcas como Natura, Nubank e iFood. Sua especialidade
              é encontrar insights únicos que transformam marcas em líderes de categoria.
              Você combina análise de dados com intuição criativa para desenvolver
              estratégias que ressoam emocionalmente com o público.`,
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2500,
};

/**
 * Cria uma instância do agente Brand Strategist com tool de RAG
 */
export function createBrandStrategist(): Agent {
  const config: AgentConfig = {
    ...brandStrategistConfig,
    tools: [
      {
        name: 'search_brand_memory',
        description: 'Busca informações na memória de marca do cliente (tom de voz, valores, público, etc.)',
        execute: async (params: { query: string; clientId?: string }) => {
          const results = await searchMemory(params.query, params.clientId, 5);
          return results.map(r => r.content).join('\n\n');
        },
      },
    ],
  };

  return new Agent(config);
}

export class BrandStrategist extends Agent {
  constructor() {
    super(brandStrategistConfig);
  }
}
