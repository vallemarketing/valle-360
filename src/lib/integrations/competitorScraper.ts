// Competitor Scraper/Monitor - Valle 360
// Sistema de monitoramento de concorrentes em tempo real

export interface Competitor {
  id: string;
  clientId: string;
  name: string;
  platforms: CompetitorPlatform[];
  createdAt: Date;
  lastChecked?: Date;
  isActive: boolean;
}

export interface CompetitorPlatform {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'website';
  handle: string; // @username ou URL
  profileUrl: string;
  followers?: number;
  lastActivity?: Date;
}

export interface CompetitorActivity {
  id: string;
  competitorId: string;
  competitorName: string;
  platform: string;
  activityType: ActivityType;
  content: string;
  mediaUrl?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  detectedAt: Date;
  isViral: boolean;
  aiAnalysis?: string;
}

export type ActivityType = 
  | 'new_post'
  | 'new_story'
  | 'new_reel'
  | 'blog_post'
  | 'promotion'
  | 'bio_change'
  | 'follower_spike'
  | 'engagement_spike'
  | 'new_product'
  | 'price_change';

export interface MonitoringConfig {
  checkInterval: number; // em minutos
  alertThresholds: {
    viralEngagement: number; // engajamento considerado viral
    followerSpike: number; // % de aumento de seguidores
  };
  enabledAlerts: ActivityType[];
}

// Cache de atividades para evitar duplicatas
const activityCache = new Map<string, Set<string>>();

/**
 * Buscar dados do Instagram via API não oficial
 * Em produção, usar Meta Graph API com token do cliente
 */
export async function fetchInstagramData(handle: string): Promise<{
  followers: number;
  following: number;
  posts: number;
  recentPosts: Array<{
    id: string;
    type: 'image' | 'video' | 'carousel';
    caption: string;
    likes: number;
    comments: number;
    timestamp: Date;
    mediaUrl: string;
  }>;
} | null> {
  try {
    // Em produção, fazer chamada real à API
    // Por enquanto, retornar dados simulados
    return {
      followers: Math.floor(Math.random() * 50000) + 10000,
      following: Math.floor(Math.random() * 1000) + 200,
      posts: Math.floor(Math.random() * 500) + 100,
      recentPosts: Array.from({ length: 5 }, (_, i) => ({
        id: `post-${handle}-${i}`,
        type: ['image', 'video', 'carousel'][Math.floor(Math.random() * 3)] as 'image' | 'video' | 'carousel',
        caption: `Post recente do @${handle} sobre tendências do mercado...`,
        likes: Math.floor(Math.random() * 5000) + 100,
        comments: Math.floor(Math.random() * 200) + 10,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        mediaUrl: `https://picsum.photos/seed/${handle}${i}/400/400`
      }))
    };
  } catch (error) {
    console.error(`Error fetching Instagram data for ${handle}:`, error);
    return null;
  }
}

/**
 * Buscar dados do Facebook via Graph API
 */
export async function fetchFacebookData(pageId: string): Promise<{
  followers: number;
  likes: number;
  recentPosts: Array<{
    id: string;
    message: string;
    likes: number;
    comments: number;
    shares: number;
    timestamp: Date;
  }>;
} | null> {
  try {
    // Em produção, usar Graph API
    return {
      followers: Math.floor(Math.random() * 30000) + 5000,
      likes: Math.floor(Math.random() * 25000) + 4000,
      recentPosts: Array.from({ length: 5 }, (_, i) => ({
        id: `fb-post-${pageId}-${i}`,
        message: `Publicação recente da página ${pageId}...`,
        likes: Math.floor(Math.random() * 1000) + 50,
        comments: Math.floor(Math.random() * 100) + 5,
        shares: Math.floor(Math.random() * 50),
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }))
    };
  } catch (error) {
    console.error(`Error fetching Facebook data for ${pageId}:`, error);
    return null;
  }
}

/**
 * Buscar dados do LinkedIn via API
 */
export async function fetchLinkedInData(companyId: string): Promise<{
  followers: number;
  employees: number;
  recentPosts: Array<{
    id: string;
    content: string;
    likes: number;
    comments: number;
    timestamp: Date;
  }>;
} | null> {
  try {
    return {
      followers: Math.floor(Math.random() * 20000) + 2000,
      employees: Math.floor(Math.random() * 100) + 10,
      recentPosts: Array.from({ length: 3 }, (_, i) => ({
        id: `li-post-${companyId}-${i}`,
        content: `Atualização profissional da empresa ${companyId}...`,
        likes: Math.floor(Math.random() * 500) + 20,
        comments: Math.floor(Math.random() * 50) + 2,
        timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
      }))
    };
  } catch (error) {
    console.error(`Error fetching LinkedIn data for ${companyId}:`, error);
    return null;
  }
}

/**
 * Verificar website por novos conteúdos (blog, promoções)
 */
export async function checkWebsite(url: string): Promise<{
  lastModified?: Date;
  newBlogPosts: Array<{
    title: string;
    url: string;
    publishedAt: Date;
  }>;
  promotions: Array<{
    title: string;
    description: string;
    detectedAt: Date;
  }>;
} | null> {
  try {
    // Em produção, fazer scraping real ou usar APIs de monitoramento
    return {
      lastModified: new Date(),
      newBlogPosts: Math.random() > 0.7 ? [{
        title: 'Novo artigo no blog do concorrente',
        url: `${url}/blog/novo-artigo`,
        publishedAt: new Date()
      }] : [],
      promotions: Math.random() > 0.8 ? [{
        title: 'Promoção de Black Friday',
        description: '50% de desconto em todos os serviços',
        detectedAt: new Date()
      }] : []
    };
  } catch (error) {
    console.error(`Error checking website ${url}:`, error);
    return null;
  }
}

/**
 * Monitorar todos os concorrentes de um cliente
 */
export async function monitorCompetitors(
  competitors: Competitor[],
  config: MonitoringConfig
): Promise<CompetitorActivity[]> {
  const activities: CompetitorActivity[] = [];

  for (const competitor of competitors) {
    if (!competitor.isActive) continue;

    for (const platform of competitor.platforms) {
      let newActivities: CompetitorActivity[] = [];

      switch (platform.platform) {
        case 'instagram':
          newActivities = await checkInstagramActivity(competitor, platform, config);
          break;
        case 'facebook':
          newActivities = await checkFacebookActivity(competitor, platform, config);
          break;
        case 'linkedin':
          newActivities = await checkLinkedInActivity(competitor, platform, config);
          break;
        case 'website':
          newActivities = await checkWebsiteActivity(competitor, platform, config);
          break;
      }

      activities.push(...newActivities);
    }
  }

  return activities;
}

/**
 * Verificar atividade no Instagram
 */
async function checkInstagramActivity(
  competitor: Competitor,
  platform: CompetitorPlatform,
  config: MonitoringConfig
): Promise<CompetitorActivity[]> {
  const activities: CompetitorActivity[] = [];
  const data = await fetchInstagramData(platform.handle);
  
  if (!data) return activities;

  // Verificar novos posts
  const cacheKey = `${competitor.id}-instagram`;
  const seenPosts = activityCache.get(cacheKey) || new Set();

  for (const post of data.recentPosts) {
    if (seenPosts.has(post.id)) continue;
    seenPosts.add(post.id);

    const totalEngagement = post.likes + post.comments;
    const isViral = totalEngagement > config.alertThresholds.viralEngagement;

    activities.push({
      id: `activity-${post.id}`,
      competitorId: competitor.id,
      competitorName: competitor.name,
      platform: 'instagram',
      activityType: post.type === 'video' ? 'new_reel' : 'new_post',
      content: post.caption,
      mediaUrl: post.mediaUrl,
      engagement: {
        likes: post.likes,
        comments: post.comments,
        shares: 0
      },
      detectedAt: new Date(),
      isViral,
      aiAnalysis: isViral 
        ? 'Post com alto engajamento! Analise o conteúdo para identificar o que funcionou.'
        : undefined
    });
  }

  activityCache.set(cacheKey, seenPosts);

  // Verificar mudança significativa de seguidores
  if (platform.followers) {
    const followerChange = ((data.followers - platform.followers) / platform.followers) * 100;
    if (followerChange > config.alertThresholds.followerSpike) {
      activities.push({
        id: `follower-spike-${competitor.id}-${Date.now()}`,
        competitorId: competitor.id,
        competitorName: competitor.name,
        platform: 'instagram',
        activityType: 'follower_spike',
        content: `Aumento de ${followerChange.toFixed(1)}% em seguidores (${platform.followers.toLocaleString()} → ${data.followers.toLocaleString()})`,
        detectedAt: new Date(),
        isViral: false,
        aiAnalysis: 'Investigar possível campanha paga ou conteúdo viral'
      });
    }
  }

  return activities;
}

/**
 * Verificar atividade no Facebook
 */
async function checkFacebookActivity(
  competitor: Competitor,
  platform: CompetitorPlatform,
  config: MonitoringConfig
): Promise<CompetitorActivity[]> {
  const activities: CompetitorActivity[] = [];
  const data = await fetchFacebookData(platform.handle);
  
  if (!data) return activities;

  const cacheKey = `${competitor.id}-facebook`;
  const seenPosts = activityCache.get(cacheKey) || new Set();

  for (const post of data.recentPosts) {
    if (seenPosts.has(post.id)) continue;
    seenPosts.add(post.id);

    const totalEngagement = post.likes + post.comments + post.shares;
    const isViral = totalEngagement > config.alertThresholds.viralEngagement;

    activities.push({
      id: `activity-${post.id}`,
      competitorId: competitor.id,
      competitorName: competitor.name,
      platform: 'facebook',
      activityType: 'new_post',
      content: post.message,
      engagement: {
        likes: post.likes,
        comments: post.comments,
        shares: post.shares
      },
      detectedAt: new Date(),
      isViral
    });
  }

  activityCache.set(cacheKey, seenPosts);
  return activities;
}

/**
 * Verificar atividade no LinkedIn
 */
async function checkLinkedInActivity(
  competitor: Competitor,
  platform: CompetitorPlatform,
  config: MonitoringConfig
): Promise<CompetitorActivity[]> {
  const activities: CompetitorActivity[] = [];
  const data = await fetchLinkedInData(platform.handle);
  
  if (!data) return activities;

  const cacheKey = `${competitor.id}-linkedin`;
  const seenPosts = activityCache.get(cacheKey) || new Set();

  for (const post of data.recentPosts) {
    if (seenPosts.has(post.id)) continue;
    seenPosts.add(post.id);

    activities.push({
      id: `activity-${post.id}`,
      competitorId: competitor.id,
      competitorName: competitor.name,
      platform: 'linkedin',
      activityType: 'new_post',
      content: post.content,
      engagement: {
        likes: post.likes,
        comments: post.comments,
        shares: 0
      },
      detectedAt: new Date(),
      isViral: false
    });
  }

  activityCache.set(cacheKey, seenPosts);
  return activities;
}

/**
 * Verificar atividade no website
 */
async function checkWebsiteActivity(
  competitor: Competitor,
  platform: CompetitorPlatform,
  config: MonitoringConfig
): Promise<CompetitorActivity[]> {
  const activities: CompetitorActivity[] = [];
  const data = await checkWebsite(platform.profileUrl);
  
  if (!data) return activities;

  // Novos posts de blog
  for (const blogPost of data.newBlogPosts) {
    activities.push({
      id: `blog-${competitor.id}-${Date.now()}`,
      competitorId: competitor.id,
      competitorName: competitor.name,
      platform: 'website',
      activityType: 'blog_post',
      content: blogPost.title,
      detectedAt: new Date(),
      isViral: false,
      aiAnalysis: 'Novo conteúdo publicado. Considere criar conteúdo similar ou resposta.'
    });
  }

  // Promoções detectadas
  for (const promo of data.promotions) {
    activities.push({
      id: `promo-${competitor.id}-${Date.now()}`,
      competitorId: competitor.id,
      competitorName: competitor.name,
      platform: 'website',
      activityType: 'promotion',
      content: `${promo.title}: ${promo.description}`,
      detectedAt: new Date(),
      isViral: false,
      aiAnalysis: 'Promoção detectada! Avalie se precisa ajustar sua estratégia de preços.'
    });
  }

  return activities;
}

/**
 * Gerar análise comparativa com IA
 */
export function generateCompetitiveAnalysis(
  activities: CompetitorActivity[],
  clientMetrics: { followers: number; engagement: number; posts: number }
): {
  summary: string;
  threats: string[];
  opportunities: string[];
  recommendations: string[];
} {
  const viralPosts = activities.filter(a => a.isViral);
  const promotions = activities.filter(a => a.activityType === 'promotion');
  const blogPosts = activities.filter(a => a.activityType === 'blog_post');

  const threats: string[] = [];
  const opportunities: string[] = [];
  const recommendations: string[] = [];

  if (viralPosts.length > 0) {
    threats.push(`${viralPosts.length} posts virais de concorrentes detectados`);
    recommendations.push('Analise os posts virais para identificar tendências de conteúdo');
  }

  if (promotions.length > 0) {
    threats.push(`${promotions.length} promoções de concorrentes ativas`);
    recommendations.push('Considere criar uma contra-oferta ou destacar diferenciais');
  }

  if (blogPosts.length > 0) {
    opportunities.push(`${blogPosts.length} novos artigos de blog para analisar`);
    recommendations.push('Crie conteúdo complementar ou com perspectiva diferente');
  }

  const summary = `
    Nas últimas 24 horas, foram detectadas ${activities.length} atividades de concorrentes.
    ${viralPosts.length > 0 ? `Destaque para ${viralPosts.length} posts com alto engajamento.` : ''}
    ${promotions.length > 0 ? `Atenção: ${promotions.length} promoções ativas.` : ''}
  `.trim();

  return {
    summary,
    threats,
    opportunities,
    recommendations
  };
}

export default {
  fetchInstagramData,
  fetchFacebookData,
  fetchLinkedInData,
  checkWebsite,
  monitorCompetitors,
  generateCompetitiveAnalysis
};









