/**
 * Content Creation Crew
 * Crew para criação de conteúdo para redes sociais
 */

import { Crew } from '../core/crew';
import { CrewConfig, AgentExecutionContext } from '../core/types';
import { brandStrategistConfig } from '../agents/brandStrategist';
import { socialWriterConfig } from '../agents/socialWriter';
import { visualDirectorConfig } from '../agents/visualDirector';
import { searchMemory } from '../brandMemory';

export interface ContentCrewInput {
  clientId: string;
  topic: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'twitter';
  contentType: 'post' | 'carousel' | 'reels' | 'stories';
  objective?: string;
  additionalContext?: string;
}

export interface ContentCrewOutput {
  strategy: string;
  copy: string;
  visualConcept: string;
  hashtags: string[];
  bestTime?: string;
}

/**
 * Cria e executa a Content Crew
 */
export async function runContentCrew(
  input: ContentCrewInput,
  verbose = false
): Promise<ContentCrewOutput> {
  // Busca contexto da memória de marca
  const brandContext = await searchMemory(
    `${input.topic} ${input.platform} tom de voz valores público`,
    input.clientId,
    8
  );

  const context: AgentExecutionContext = {
    clientId: input.clientId,
    brandMemory: brandContext.map(c => c.content),
    metadata: {
      platform: input.platform,
      contentType: input.contentType,
      topic: input.topic,
    },
  };

  const crewConfig: CrewConfig = {
    id: 'content-crew',
    name: 'Content Creation Crew',
    description: 'Equipe para criação de conteúdo para redes sociais',
    verbose,
    agents: [brandStrategistConfig, socialWriterConfig, visualDirectorConfig],
    tasks: [
      {
        id: 'strategy-analysis',
        description: `Analise o seguinte briefing e desenvolva uma estratégia de conteúdo:

**Tema:** ${input.topic}
**Plataforma:** ${input.platform}
**Tipo de conteúdo:** ${input.contentType}
**Objetivo:** ${input.objective || 'Engajamento e awareness'}
${input.additionalContext ? `**Contexto adicional:** ${input.additionalContext}` : ''}

Considere:
1. O posicionamento da marca e tom de voz
2. O comportamento do público na plataforma ${input.platform}
3. Tendências atuais relevantes
4. Oportunidade de diferenciação`,
        expectedOutput: `Uma análise estratégica contendo:
- Insight principal sobre o tema
- Ângulo criativo recomendado
- Tom e abordagem sugeridos
- Elementos-chave que devem estar presentes
- Riscos a evitar`,
        agentId: 'brand-strategist',
      },
      {
        id: 'copy-creation',
        description: `Com base na estratégia desenvolvida, crie o copy para ${input.contentType} no ${input.platform}.

O copy deve:
1. Seguir o ângulo criativo da estratégia
2. Ser adequado para ${input.platform}
3. Incluir call-to-action relevante
4. Ter o tamanho ideal para ${input.contentType}`,
        expectedOutput: `Copy completo contendo:
- Headline/hook (se aplicável)
- Corpo do texto
- Call-to-action
- 5-10 hashtags relevantes
- Sugestão de melhor horário para postar`,
        agentId: 'social-writer',
        dependencies: ['strategy-analysis'],
      },
      {
        id: 'visual-direction',
        description: `Com base na estratégia e no copy, desenvolva o conceito visual para este ${input.contentType}.

Considere:
1. A identidade visual da marca
2. Tendências visuais do ${input.platform}
3. O impacto desejado
4. Acessibilidade e legibilidade`,
        expectedOutput: `Direção de arte contendo:
- Conceito visual principal
- Paleta de cores sugerida
- Tipografia e hierarquia
- Composição e layout
- Referências visuais (descrição)
- Prompt para geração de imagem (se aplicável)`,
        agentId: 'visual-director',
        dependencies: ['strategy-analysis', 'copy-creation'],
      },
    ],
  };

  const crew = new Crew(crewConfig);
  const result = await crew.run(context);

  if (!result.success) {
    throw new Error(`Crew falhou: ${result.error}`);
  }

  // Parse dos resultados
  const strategyResult = result.taskResults.find(t => t.taskId === 'strategy-analysis');
  const copyResult = result.taskResults.find(t => t.taskId === 'copy-creation');
  const visualResult = result.taskResults.find(t => t.taskId === 'visual-direction');

  // Extrai hashtags do copy (simplificado)
  const hashtagMatch = copyResult?.output.match(/#\w+/g) || [];

  return {
    strategy: strategyResult?.output || '',
    copy: copyResult?.output || '',
    visualConcept: visualResult?.output || '',
    hashtags: hashtagMatch,
  };
}

/**
 * Versão simplificada - apenas gera um post rápido
 */
export async function quickPost(
  clientId: string,
  topic: string,
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'twitter' = 'instagram'
): Promise<{ copy: string; hashtags: string[] }> {
  const result = await runContentCrew({
    clientId,
    topic,
    platform,
    contentType: 'post',
  });

  return {
    copy: result.copy,
    hashtags: result.hashtags,
  };
}
