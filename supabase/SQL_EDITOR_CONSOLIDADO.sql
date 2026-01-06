-- Valle360 • SQL CONSOLIDADO (Supabase SQL Editor)
--
-- Como usar:
-- 1) Abra o Supabase Dashboard → SQL Editor.
-- 2) Cole TODO este script e execute.
-- 3) Se algum bloco falhar por 'já existe', isso é OK (a maioria usa IF NOT EXISTS).
--
-- Observações:
-- - Este arquivo consolida as migrations essenciais para Metas/Prospecção, Preditivo/ML, Sentimento e RH.
-- - Ele NÃO substitui o schema-base do projeto (auth/users, etc.).



-- ========================================================
-- BEGIN: supabase/migrations/20251112000000_init_database_functions.sql
-- ========================================================

-- =====================================================
-- MIGRATION INICIAL: Funções e Configurações Base
-- Descrição: Funções auxiliares, extensões e configurações iniciais do banco
-- Dependências: Nenhuma (primeira migration)
-- =====================================================

-- =====================================================
-- EXTENSÕES
-- =====================================================

-- UUID Generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PG Crypto para criptografia
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full Text Search em Português
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Atualiza automaticamente o campo updated_at antes de cada UPDATE';

-- Compat: alguns arquivos usam trigger function `moddatetime(updated_at)`.
-- No Postgres/Supabase, a trigger function não recebe parâmetros na assinatura;
-- os argumentos (ex.: updated_at) entram via TG_ARGV. Para manter compatibilidade,
-- definimos `moddatetime()` como alias simples que atualiza NEW.updated_at.
CREATE OR REPLACE FUNCTION moddatetime()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION moddatetime() IS 'Compat: atualiza NEW.updated_at antes de cada UPDATE (alias de update_updated_at_column).';

-- =====================================================
-- RPC: is_admin()
-- Usado pelo app (Next.js) e por políticas RLS no próprio SQL consolidado.
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
      AND (
        lower(COALESCE(up.role::text, '')) IN ('admin', 'super_admin')
        OR lower(COALESCE(up.user_type::text, '')) IN ('admin', 'super_admin')
      )
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Retorna TRUE se o usuário autenticado for admin/super_admin (baseado em user_profiles).';

-- =====================================================
-- FUNÇÃO: Gerar número sequencial (para contracts, invoices, etc)
-- =====================================================

CREATE OR REPLACE FUNCTION generate_sequential_number(
  prefix TEXT,
  table_name TEXT,
  column_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  EXECUTE format(
    'SELECT COALESCE(MAX(CAST(SUBSTRING(%I FROM ''[0-9]+$'') AS INTEGER)), 0) + 1 FROM %I WHERE %I LIKE %L',
    column_name,
    table_name,
    column_name,
    prefix || '%'
  ) INTO next_number;
  
  formatted_number := prefix || LPAD(next_number::TEXT, 6, '0');
  
  RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_sequential_number IS 'Gera números sequenciais para contratos, faturas, etc. Exemplo: CONT-000001';

-- =====================================================
-- FUNÇÃO: Calcular dias úteis entre duas datas
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_business_days(
  start_date DATE,
  end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  business_days INTEGER := 0;
  v_current_date DATE := start_date;
BEGIN
  WHILE v_current_date <= end_date LOOP
    -- Se não for sábado (6) nem domingo (0)
    IF EXTRACT(DOW FROM v_current_date) NOT IN (0, 6) THEN
      business_days := business_days + 1;
    END IF;
    v_current_date := v_current_date + 1;
  END LOOP;
  
  RETURN business_days;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_business_days IS 'Calcula o número de dias úteis entre duas datas (excluindo sábados e domingos)';

-- =====================================================
-- FUNÇÃO: Validar CPF
-- =====================================================

CREATE OR REPLACE FUNCTION validate_cpf(cpf TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  cpf_numbers TEXT;
  digit1 INTEGER;
  digit2 INTEGER;
  sum INTEGER;
  i INTEGER;
BEGIN
  -- Remove caracteres não numéricos
  cpf_numbers := regexp_replace(cpf, '[^0-9]', '', 'g');
  
  -- Verifica se tem 11 dígitos
  IF length(cpf_numbers) != 11 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se todos os dígitos são iguais (CPF inválido)
  IF cpf_numbers ~ '^(\d)\1{10}$' THEN
    RETURN FALSE;
  END IF;
  
  -- Calcula o primeiro dígito verificador
  sum := 0;
  FOR i IN 1..9 LOOP
    sum := sum + (substring(cpf_numbers, i, 1)::INTEGER * (11 - i));
  END LOOP;
  digit1 := 11 - (sum % 11);
  IF digit1 >= 10 THEN
    digit1 := 0;
  END IF;
  
  -- Calcula o segundo dígito verificador
  sum := 0;
  FOR i IN 1..10 LOOP
    sum := sum + (substring(cpf_numbers, i, 1)::INTEGER * (12 - i));
  END LOOP;
  digit2 := 11 - (sum % 11);
  IF digit2 >= 10 THEN
    digit2 := 0;
  END IF;
  
  -- Verifica se os dígitos calculados são iguais aos informados
  RETURN (substring(cpf_numbers, 10, 1)::INTEGER = digit1) AND 
         (substring(cpf_numbers, 11, 1)::INTEGER = digit2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_cpf IS 'Valida um número de CPF brasileiro';

-- =====================================================
-- FUNÇÃO: Validar CNPJ
-- =====================================================

CREATE OR REPLACE FUNCTION validate_cnpj(cnpj TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  cnpj_numbers TEXT;
  digit1 INTEGER;
  digit2 INTEGER;
  sum INTEGER;
  i INTEGER;
  multiplier INTEGER;
BEGIN
  -- Remove caracteres não numéricos
  cnpj_numbers := regexp_replace(cnpj, '[^0-9]', '', 'g');
  
  -- Verifica se tem 14 dígitos
  IF length(cnpj_numbers) != 14 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se todos os dígitos são iguais (CNPJ inválido)
  IF cnpj_numbers ~ '^(\d)\1{13}$' THEN
    RETURN FALSE;
  END IF;
  
  -- Calcula o primeiro dígito verificador
  sum := 0;
  multiplier := 5;
  FOR i IN 1..12 LOOP
    sum := sum + (substring(cnpj_numbers, i, 1)::INTEGER * multiplier);
    multiplier := multiplier - 1;
    IF multiplier < 2 THEN
      multiplier := 9;
    END IF;
  END LOOP;
  digit1 := 11 - (sum % 11);
  IF digit1 >= 10 THEN
    digit1 := 0;
  END IF;
  
  -- Calcula o segundo dígito verificador
  sum := 0;
  multiplier := 6;
  FOR i IN 1..13 LOOP
    sum := sum + (substring(cnpj_numbers, i, 1)::INTEGER * multiplier);
    multiplier := multiplier - 1;
    IF multiplier < 2 THEN
      multiplier := 9;
    END IF;
  END LOOP;
  digit2 := 11 - (sum % 11);
  IF digit2 >= 10 THEN
    digit2 := 0;
  END IF;
  
  -- Verifica se os dígitos calculados são iguais aos informados
  RETURN (substring(cnpj_numbers, 13, 1)::INTEGER = digit1) AND 
         (substring(cnpj_numbers, 14, 1)::INTEGER = digit2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_cnpj IS 'Valida um número de CNPJ brasileiro';

-- =====================================================
-- FUNÇÃO: Formatar moeda brasileira
-- =====================================================

CREATE OR REPLACE FUNCTION format_currency_brl(amount NUMERIC)
RETURNS TEXT AS $$
BEGIN
  RETURN 'R$ ' || TO_CHAR(amount, 'FM999G999G999D00');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION format_currency_brl IS 'Formata um valor numérico como moeda brasileira (R$)';

-- =====================================================
-- FUNÇÃO: Calcular idade
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN DATE_PART('year', AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_age IS 'Calcula a idade a partir de uma data de nascimento';

-- =====================================================
-- FUNÇÃO: Gerar slug a partir de texto
-- =====================================================

CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        unaccent(text_input),
        '[^a-zA-Z0-9\s-]',
        '',
        'g'
      ),
      '\s+',
      '-',
      'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_slug IS 'Gera um slug URL-friendly a partir de um texto';

-- =====================================================
-- FUNÇÃO: Criar notificação
-- =====================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_related_entity_type VARCHAR DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    recipient_id,
    notification_type,
    title,
    message,
    related_entity_type,
    related_entity_id,
    action_url,
    priority
  ) VALUES (
    p_recipient_id,
    p_type,
    p_title,
    p_message,
    p_related_entity_type,
    p_related_entity_id,
    p_action_url,
    p_priority
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_notification IS 'Cria uma notificação para um usuário';

-- =====================================================
-- FUNÇÃO: Registrar atividade no audit log
-- =====================================================

CREATE OR REPLACE FUNCTION log_audit(
  p_user_id UUID,
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_changes JSONB DEFAULT NULL,
  p_status VARCHAR DEFAULT 'success'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    changes,
    status,
    ip_address
  ) VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_changes,
    p_status,
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_audit IS 'Registra uma ação no log de auditoria';

-- =====================================================
-- CONFIGURAÇÕES DE TIMEZONE
-- =====================================================

-- Define timezone padrão como São Paulo
ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';

-- =====================================================
-- ROLES E PERMISSÕES BÁSICAS
-- =====================================================

-- Criar role para aplicação (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'valle360_app') THEN
    CREATE ROLE valle360_app WITH LOGIN PASSWORD NULL;
  END IF;
END
$$;

-- Grant permissões básicas
GRANT USAGE ON SCHEMA public TO valle360_app;
GRANT ALL ON ALL TABLES IN SCHEMA public TO valle360_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO valle360_app;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO valle360_app;

-- =====================================================
-- CONFIGURAÇÃO: Habilitar RLS por padrão
-- =====================================================

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO valle360_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO valle360_app;

-- =====================================================
-- Fim da Migration Inicial
-- =====================================================

-- Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE 'Migration inicial concluída com sucesso!';
  RAISE NOTICE 'Extensões, funções auxiliares e configurações base foram criadas.';
END $$;


-- ========================================================
-- END: supabase/migrations/20251112000000_init_database_functions.sql
-- ========================================================


-- ========================================================
-- BEGIN: supabase/migrations/20251112000019_create_predictive_intelligence_system.sql
-- ========================================================

-- =====================================================
-- MIGRATION: Predictive Intelligence System
-- Descrição: ML/IA preditivo para churn, renovações e oportunidades
-- Dependências: Todas as migrations anteriores
-- =====================================================

-- =====================================================
-- 1. TABELA: client_health_scores
-- Score de saúde do cliente (0-100)
-- =====================================================

CREATE TABLE IF NOT EXISTS client_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Score geral (0-100)
  overall_health_score INTEGER NOT NULL CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
  
  -- Classificação
  health_category VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN overall_health_score >= 80 THEN 'excellent'
      WHEN overall_health_score >= 60 THEN 'good'
      WHEN overall_health_score >= 40 THEN 'at_risk'
      ELSE 'critical'
    END
  ) STORED,
  
  -- Scores por dimensão
  nps_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  payment_score INTEGER DEFAULT 0,
  satisfaction_score INTEGER DEFAULT 0,
  usage_score INTEGER DEFAULT 0,
  
  -- Tendências (comparado com período anterior)
  score_trend VARCHAR(20) CHECK (score_trend IN ('improving', 'stable', 'declining')),
  previous_score INTEGER,
  score_change INTEGER,
  
  -- Timestamp
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  next_calculation_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_client_health_scores_client ON client_health_scores(client_id);
CREATE INDEX idx_client_health_scores_category ON client_health_scores(health_category);
CREATE INDEX idx_client_health_scores_score ON client_health_scores(overall_health_score);

COMMENT ON TABLE client_health_scores IS 'Score de saúde do cliente calculado por múltiplos fatores';

-- =====================================================
-- 2. TABELA: churn_predictions
-- Predições de cancelamento de contrato
-- =====================================================

CREATE TABLE IF NOT EXISTS churn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Probabilidade de churn (0-100%)
  churn_probability NUMERIC(5, 2) NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 100),
  
  -- Classificação de risco
  risk_level VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN churn_probability >= 70 THEN 'critical'
      WHEN churn_probability >= 50 THEN 'high'
      WHEN churn_probability >= 30 THEN 'medium'
      ELSE 'low'
    END
  ) STORED,
  
  -- Data estimada de churn
  predicted_churn_date DATE,
  days_until_churn INTEGER,
  
  -- Fatores contribuintes (ordenados por peso)
  contributing_factors JSONB DEFAULT '[]'::jsonb,
  
  -- Top 3 fatores de risco
  top_risk_factor_1 VARCHAR(100),
  top_risk_factor_2 VARCHAR(100),
  top_risk_factor_3 VARCHAR(100),
  
  -- Confidence level da predição (0-100%)
  confidence_level NUMERIC(5, 2),
  
  -- Ações recomendadas
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  
  -- Status da intervenção
  intervention_status VARCHAR(20) DEFAULT 'pending' CHECK (intervention_status IN ('pending', 'in_progress', 'completed', 'prevented', 'churned')),
  
  -- Feedback (se a predição estava correta)
  actual_churned BOOLEAN,
  prediction_accuracy NUMERIC(5, 2),
  
  -- Timestamps
  predicted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_churn_predictions_client ON churn_predictions(client_id);
CREATE INDEX idx_churn_predictions_risk ON churn_predictions(risk_level);
CREATE INDEX idx_churn_predictions_probability ON churn_predictions(churn_probability DESC);
CREATE INDEX idx_churn_predictions_date ON churn_predictions(predicted_churn_date);

COMMENT ON TABLE churn_predictions IS 'Predições de churn baseadas em múltiplos fatores';

-- =====================================================
-- 3. TABELA: renewal_predictions
-- Predições de renovação de contrato
-- =====================================================

CREATE TABLE IF NOT EXISTS renewal_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  contract_id UUID REFERENCES client_contracts(id) ON DELETE CASCADE NOT NULL,
  
  -- Probabilidade de renovação (0-100%)
  renewal_probability NUMERIC(5, 2) NOT NULL CHECK (renewal_probability >= 0 AND renewal_probability <= 100),
  
  -- Classificação
  renewal_likelihood VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN renewal_probability >= 80 THEN 'very_likely'
      WHEN renewal_probability >= 60 THEN 'likely'
      WHEN renewal_probability >= 40 THEN 'uncertain'
      ELSE 'unlikely'
    END
  ) STORED,
  
  -- Data de término do contrato
  contract_end_date DATE NOT NULL,
  days_until_renewal INTEGER GENERATED ALWAYS AS (
    contract_end_date - CURRENT_DATE
  ) STORED,
  
  -- Valor previsto de renovação
  predicted_renewal_value NUMERIC(12, 2),
  predicted_contract_changes JSONB DEFAULT '{}'::jsonb,
  
  -- Upsell opportunity
  upsell_probability NUMERIC(5, 2) DEFAULT 0.00,
  suggested_upsell_services JSONB DEFAULT '[]'::jsonb,
  potential_upsell_value NUMERIC(12, 2) DEFAULT 0.00,
  
  -- Downsell risk
  downsell_probability NUMERIC(5, 2) DEFAULT 0.00,
  potential_revenue_loss NUMERIC(12, 2) DEFAULT 0.00,
  
  -- Ações recomendadas
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  best_time_to_contact DATE,
  
  -- Resultado real
  actual_renewed BOOLEAN,
  actual_renewal_value NUMERIC(12, 2),
  
  -- Timestamps
  predicted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_renewal_predictions_client ON renewal_predictions(client_id);
CREATE INDEX idx_renewal_predictions_contract ON renewal_predictions(contract_id);
CREATE INDEX idx_renewal_predictions_likelihood ON renewal_predictions(renewal_likelihood);
CREATE INDEX idx_renewal_predictions_end_date ON renewal_predictions(contract_end_date);

COMMENT ON TABLE renewal_predictions IS 'Predições de renovação de contratos';

-- =====================================================
-- 4. TABELA: upsell_opportunities
-- Oportunidades de venda adicional
-- =====================================================

CREATE TABLE IF NOT EXISTS upsell_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  
  opportunity_type VARCHAR(50) NOT NULL CHECK (opportunity_type IN ('new_service', 'upgrade_plan', 'additional_features', 'cross_sell', 'bundle')),
  
  -- Score da oportunidade (0-100)
  opportunity_score INTEGER NOT NULL CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  
  -- Produto/serviço sugerido
  suggested_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  suggested_service_name VARCHAR(255) NOT NULL,
  suggested_service_category VARCHAR(100),
  
  -- Valor estimado
  estimated_value NUMERIC(12, 2) NOT NULL,
  estimated_mrr_increase NUMERIC(12, 2),
  
  -- Probabilidade de conversão
  conversion_probability NUMERIC(5, 2) NOT NULL,
  
  -- Razões/triggers para a oportunidade
  opportunity_reasons JSONB DEFAULT '[]'::jsonb,
  
  -- Melhor timing
  best_time_to_present DATE,
  urgency_level VARCHAR(20) CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'identified' CHECK (status IN ('identified', 'presented', 'accepted', 'rejected', 'expired')),
  
  presented_at TIMESTAMP WITH TIME ZONE,
  presented_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  outcome VARCHAR(20) CHECK (outcome IN ('converted', 'rejected', 'postponed', 'not_presented')),
  outcome_date DATE,
  actual_value NUMERIC(12, 2),
  
  -- Timestamps
  identified_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_upsell_opportunities_client ON upsell_opportunities(client_id);
CREATE INDEX idx_upsell_opportunities_score ON upsell_opportunities(opportunity_score DESC);
CREATE INDEX idx_upsell_opportunities_status ON upsell_opportunities(status);
CREATE INDEX idx_upsell_opportunities_timing ON upsell_opportunities(best_time_to_present);

COMMENT ON TABLE upsell_opportunities IS 'Oportunidades de upsell identificadas por IA';

-- =====================================================
-- 5. TABELA: sentiment_analysis
-- Análise de sentimento automática
-- =====================================================

CREATE TABLE IF NOT EXISTS sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('message', 'email', 'comment', 'review', 'feedback', 'nps_response')),
  entity_id UUID NOT NULL,
  
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Texto analisado
  analyzed_text TEXT NOT NULL,
  
  -- Sentimento detectado
  sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
  
  -- Score de sentimento (-1 a +1)
  sentiment_score NUMERIC(3, 2) NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  
  -- Confiança da análise (0-100%)
  confidence NUMERIC(5, 2) NOT NULL,
  
  -- Emoções detectadas
  emotions JSONB DEFAULT '{}'::jsonb,
  
  -- Keywords positivas e negativas
  positive_keywords TEXT[],
  negative_keywords TEXT[],
  
  -- Tópicos identificados
  topics TEXT[],
  
  -- Alertas
  requires_attention BOOLEAN DEFAULT false,
  alert_reason TEXT,
  
  -- Timestamps
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_sentiment_analysis_entity ON sentiment_analysis(entity_type, entity_id);
CREATE INDEX idx_sentiment_analysis_client ON sentiment_analysis(client_id);
CREATE INDEX idx_sentiment_analysis_sentiment ON sentiment_analysis(sentiment);
CREATE INDEX idx_sentiment_analysis_attention ON sentiment_analysis(requires_attention) WHERE requires_attention = true;

COMMENT ON TABLE sentiment_analysis IS 'Análise automática de sentimento em textos';

-- =====================================================
-- 6. TABELA: revenue_forecasts
-- Previsões de receita
-- =====================================================

CREATE TABLE IF NOT EXISTS revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Período de previsão
  forecast_period DATE NOT NULL,
  forecast_type VARCHAR(20) CHECK (forecast_type IN ('monthly', 'quarterly', 'yearly')),
  
  -- Receita prevista
  predicted_revenue NUMERIC(12, 2) NOT NULL,
  
  -- Breakdown
  predicted_mrr NUMERIC(12, 2),
  predicted_new_clients_revenue NUMERIC(12, 2),
  predicted_upsell_revenue NUMERIC(12, 2),
  predicted_churn_loss NUMERIC(12, 2),
  
  -- Confidence intervals
  low_estimate NUMERIC(12, 2),
  high_estimate NUMERIC(12, 2),
  confidence_level NUMERIC(5, 2),
  
  -- Comparação com meta
  target_revenue NUMERIC(12, 2),
  gap_to_target NUMERIC(12, 2) GENERATED ALWAYS AS (target_revenue - predicted_revenue) STORED,
  
  -- Fatores considerados
  factors_considered JSONB DEFAULT '{}'::jsonb,
  
  -- Resultado real (após o período)
  actual_revenue NUMERIC(12, 2),
  forecast_accuracy NUMERIC(5, 2),
  
  -- Timestamps
  forecasted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_revenue_forecasts_period ON revenue_forecasts(forecast_period DESC);
CREATE INDEX idx_revenue_forecasts_type ON revenue_forecasts(forecast_type);

COMMENT ON TABLE revenue_forecasts IS 'Previsões de receita baseadas em ML';

-- =====================================================
-- 7. TABELA: predictive_alerts
-- Alertas preditivos para super admins
-- =====================================================

CREATE TABLE IF NOT EXISTS predictive_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
    'high_churn_risk', 
    'renewal_opportunity', 
    'upsell_opportunity', 
    'negative_sentiment', 
    'payment_risk',
    'engagement_drop',
    'revenue_forecast_miss',
    'client_health_decline'
  )),
  
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Dados do alerta
  alert_data JSONB DEFAULT '{}'::jsonb,
  
  -- Ações recomendadas
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  priority_action VARCHAR(255),
  
  -- Deadline para ação
  action_deadline DATE,
  days_until_deadline INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN action_deadline IS NOT NULL THEN action_deadline - CURRENT_DATE
      ELSE NULL
    END
  ) STORED,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'in_progress', 'resolved', 'dismissed')),
  
  acknowledged_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Outcome
  outcome VARCHAR(50),
  outcome_successful BOOLEAN,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_predictive_alerts_type ON predictive_alerts(alert_type);
CREATE INDEX idx_predictive_alerts_severity ON predictive_alerts(severity);
CREATE INDEX idx_predictive_alerts_client ON predictive_alerts(client_id);
CREATE INDEX idx_predictive_alerts_status ON predictive_alerts(status);
CREATE INDEX idx_predictive_alerts_deadline ON predictive_alerts(action_deadline) WHERE status IN ('active', 'acknowledged', 'in_progress');

COMMENT ON TABLE predictive_alerts IS 'Alertas preditivos para ações proativas';

-- =====================================================
-- 8. TABELA: client_behavior_patterns
-- Padrões comportamentais dos clientes
-- =====================================================

CREATE TABLE IF NOT EXISTS client_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Período de análise
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  
  -- Padrões identificados
  patterns_detected JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Engagement patterns
  avg_login_frequency NUMERIC(5, 2),
  avg_session_duration_minutes INTEGER,
  preferred_contact_channel VARCHAR(50),
  preferred_contact_time TIME,
  
  -- Usage patterns
  most_used_features TEXT[],
  least_used_features TEXT[],
  feature_adoption_rate NUMERIC(5, 2),
  
  -- Communication patterns
  avg_response_time_hours NUMERIC(6, 2),
  message_frequency VARCHAR(20),
  sentiment_trend VARCHAR(20),
  
  -- Payment patterns
  payment_reliability VARCHAR(20) CHECK (payment_reliability IN ('excellent', 'good', 'fair', 'poor')),
  avg_days_to_pay NUMERIC(5, 1),
  
  -- Anomalies detected
  anomalies JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_client_behavior_patterns_client ON client_behavior_patterns(client_id);
CREATE INDEX idx_client_behavior_patterns_analyzed ON client_behavior_patterns(analyzed_at DESC);

COMMENT ON TABLE client_behavior_patterns IS 'Padrões comportamentais identificados por ML';

-- =====================================================
-- 9. TABELA: ml_model_training_data
-- Dados para treinar modelos de ML
-- =====================================================

CREATE TABLE IF NOT EXISTS ml_model_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('churn_prediction', 'renewal_prediction', 'upsell_prediction', 'sentiment_analysis')),
  
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  
  -- Features (variáveis independentes)
  features JSONB NOT NULL,
  
  -- Target (variável dependente - resultado real)
  target_value NUMERIC,
  target_category VARCHAR(50),
  
  -- Metadata
  data_snapshot_date DATE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_ml_training_data_model ON ml_model_training_data(model_type);
CREATE INDEX idx_ml_training_data_client ON ml_model_training_data(client_id);
CREATE INDEX idx_ml_training_data_date ON ml_model_training_data(data_snapshot_date DESC);

COMMENT ON TABLE ml_model_training_data IS 'Dados históricos para treinar modelos de ML';

-- =====================================================
-- 10. TABELA: ml_model_performance
-- Performance dos modelos de ML
-- =====================================================

CREATE TABLE IF NOT EXISTS ml_model_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  model_type VARCHAR(50) NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  
  -- Métricas de performance
  accuracy NUMERIC(5, 2),
  precision_score NUMERIC(5, 2),
  recall NUMERIC(5, 2),
  f1_score NUMERIC(5, 2),
  
  -- Confusion matrix
  true_positives INTEGER,
  true_negatives INTEGER,
  false_positives INTEGER,
  false_negatives INTEGER,
  
  -- Período de teste
  test_period_start DATE,
  test_period_end DATE,
  
  -- Sample size
  total_predictions INTEGER,
  
  -- Status do modelo
  is_active BOOLEAN DEFAULT false,
  
  -- Timestamps
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_ml_model_performance_model ON ml_model_performance(model_type, model_version);
CREATE INDEX idx_ml_model_performance_active ON ml_model_performance(is_active) WHERE is_active = true;

COMMENT ON TABLE ml_model_performance IS 'Métricas de performance dos modelos de ML';

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_churn_predictions_updated_at
  BEFORE UPDATE ON churn_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewal_predictions_updated_at
  BEFORE UPDATE ON renewal_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Calcular Health Score do Cliente
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_client_health_score(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_nps_score INTEGER := 0;
  v_engagement_score INTEGER := 0;
  v_payment_score INTEGER := 0;
  v_satisfaction_score INTEGER := 0;
  v_usage_score INTEGER := 0;
  v_overall_score INTEGER;
BEGIN
  -- 1. NPS Score (peso 30%)
  SELECT 
    CASE
      WHEN AVG(score) >= 9 THEN 100
      WHEN AVG(score) >= 7 THEN 70
      WHEN AVG(score) >= 5 THEN 40
      ELSE 20
    END INTO v_nps_score
  FROM nps_ratings
  WHERE client_id = p_client_id
  AND created_at > now() - INTERVAL '90 days';
  
  -- 2. Engagement Score (peso 25%)
  -- Baseado em logins, mensagens, interações
  SELECT 
    LEAST(100, COUNT(*) * 2) INTO v_engagement_score
  FROM activity_logs
  WHERE user_id IN (
    SELECT id FROM user_profiles WHERE client_id = p_client_id
  )
  AND created_at > now() - INTERVAL '30 days';
  
  -- 3. Payment Score (peso 25%)
  -- Baseado em pagamentos em dia
  SELECT 
    CASE
      WHEN AVG(CASE WHEN paid_at <= due_date THEN 1 ELSE 0 END) >= 0.95 THEN 100
      WHEN AVG(CASE WHEN paid_at <= due_date THEN 1 ELSE 0 END) >= 0.80 THEN 70
      WHEN AVG(CASE WHEN paid_at <= due_date THEN 1 ELSE 0 END) >= 0.60 THEN 40
      ELSE 20
    END INTO v_payment_score
  FROM financial_transactions
  WHERE client_id = p_client_id
  AND created_at > now() - INTERVAL '90 days';
  
  -- 4. Satisfaction Score (peso 10%)
  -- Baseado em feedback positivo
  SELECT 
    CASE
      WHEN COUNT(*) FILTER (WHERE sentiment IN ('positive', 'very_positive')) > COUNT(*) * 0.7 THEN 100
      WHEN COUNT(*) FILTER (WHERE sentiment IN ('positive', 'very_positive')) > COUNT(*) * 0.5 THEN 70
      ELSE 40
    END INTO v_satisfaction_score
  FROM sentiment_analysis
  WHERE client_id = p_client_id
  AND analyzed_at > now() - INTERVAL '60 days';
  
  -- 5. Usage Score (peso 10%)
  -- Baseado em uso de features
  v_usage_score := 70; -- Placeholder
  
  -- Calcular score geral (média ponderada)
  v_overall_score := (
    (v_nps_score * 0.30) +
    (v_engagement_score * 0.25) +
    (v_payment_score * 0.25) +
    (v_satisfaction_score * 0.10) +
    (v_usage_score * 0.10)
  )::INTEGER;
  
  -- Salvar resultado
  INSERT INTO client_health_scores (
    client_id,
    overall_health_score,
    nps_score,
    engagement_score,
    payment_score,
    satisfaction_score,
    usage_score,
    calculated_at
  ) VALUES (
    p_client_id,
    v_overall_score,
    v_nps_score,
    v_engagement_score,
    v_payment_score,
    v_satisfaction_score,
    v_usage_score,
    now()
  )
  ON CONFLICT (client_id)
  DO UPDATE SET
    previous_score = client_health_scores.overall_health_score,
    overall_health_score = v_overall_score,
    nps_score = v_nps_score,
    engagement_score = v_engagement_score,
    payment_score = v_payment_score,
    satisfaction_score = v_satisfaction_score,
    usage_score = v_usage_score,
    score_change = v_overall_score - client_health_scores.overall_health_score,
    score_trend = CASE
      WHEN v_overall_score > client_health_scores.overall_health_score + 5 THEN 'improving'
      WHEN v_overall_score < client_health_scores.overall_health_score - 5 THEN 'declining'
      ELSE 'stable'
    END,
    calculated_at = now();
  
  RETURN v_overall_score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_client_health_score IS 'Calcula health score do cliente baseado em múltiplos fatores';

-- =====================================================
-- FUNCTION: Predizer Churn
-- =====================================================

CREATE OR REPLACE FUNCTION predict_churn(p_client_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_health_score INTEGER;
  v_nps_score INTEGER;
  v_last_interaction_days INTEGER;
  v_payment_issues INTEGER;
  v_negative_sentiment_count INTEGER;
  v_churn_probability NUMERIC;
  v_factors JSONB := '[]'::jsonb;
BEGIN
  -- Buscar health score
  SELECT overall_health_score, nps_score
  INTO v_health_score, v_nps_score
  FROM client_health_scores
  WHERE client_id = p_client_id;
  
  -- Última interação
  SELECT EXTRACT(DAY FROM (now() - MAX(created_at)))::INTEGER
  INTO v_last_interaction_days
  FROM activity_logs
  WHERE user_id IN (
    SELECT id FROM user_profiles WHERE client_id = p_client_id
  );
  
  -- Problemas de pagamento
  SELECT COUNT(*)::INTEGER
  INTO v_payment_issues
  FROM financial_transactions
  WHERE client_id = p_client_id
  AND status = 'overdue'
  AND created_at > now() - INTERVAL '90 days';
  
  -- Sentimentos negativos
  SELECT COUNT(*)::INTEGER
  INTO v_negative_sentiment_count
  FROM sentiment_analysis
  WHERE client_id = p_client_id
  AND sentiment IN ('negative', 'very_negative')
  AND analyzed_at > now() - INTERVAL '30 days';
  
  -- Cálculo da probabilidade de churn (algoritmo simplificado)
  v_churn_probability := (
    -- Health score baixo = +40% risco
    CASE WHEN v_health_score < 40 THEN 40 ELSE (100 - v_health_score) * 0.4 END +
    
    -- NPS baixo = +20% risco
    CASE WHEN v_nps_score < 7 THEN 20 ELSE 0 END +
    
    -- Sem interação há 30+ dias = +20% risco
    CASE WHEN v_last_interaction_days > 30 THEN 20 ELSE 0 END +
    
    -- Problemas de pagamento = +10% por problema
    (v_payment_issues * 10) +
    
    -- Sentimento negativo = +5% por ocorrência
    (v_negative_sentiment_count * 5)
  );
  
  -- Limitar a 100%
  v_churn_probability := LEAST(v_churn_probability, 100);
  
  -- Identificar fatores
  IF v_health_score < 40 THEN
    v_factors := v_factors || jsonb_build_object('factor', 'Low health score', 'weight', 'high');
  END IF;
  
  IF v_nps_score < 7 THEN
    v_factors := v_factors || jsonb_build_object('factor', 'Low NPS', 'weight', 'medium');
  END IF;
  
  IF v_last_interaction_days > 30 THEN
    v_factors := v_factors || jsonb_build_object('factor', 'Low engagement', 'weight', 'medium');
  END IF;
  
  IF v_payment_issues > 0 THEN
    v_factors := v_factors || jsonb_build_object('factor', 'Payment issues', 'weight', 'high');
  END IF;
  
  -- Salvar predição
  INSERT INTO churn_predictions (
    client_id,
    churn_probability,
    predicted_churn_date,
    days_until_churn,
    contributing_factors,
    confidence_level
  ) VALUES (
    p_client_id,
    v_churn_probability,
    CURRENT_DATE + (90 - (v_churn_probability * 0.9))::INTEGER,
    (90 - (v_churn_probability * 0.9))::INTEGER,
    v_factors,
    85.00
  )
  ON CONFLICT (client_id)
  DO UPDATE SET
    churn_probability = v_churn_probability,
    contributing_factors = v_factors,
    last_updated_at = now();
  
  -- Criar alerta se risco alto
  IF v_churn_probability >= 50 THEN
    INSERT INTO predictive_alerts (
      alert_type,
      severity,
      client_id,
      title,
      description,
      action_deadline
    ) VALUES (
      'high_churn_risk',
      CASE 
        WHEN v_churn_probability >= 70 THEN 'critical'
        ELSE 'high'
      END,
      p_client_id,
      'High Churn Risk Detected',
      'Client showing ' || v_churn_probability::TEXT || '% probability of churning. Immediate action recommended.',
      CURRENT_DATE + 7
    );
  END IF;
  
  RETURN v_churn_probability;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION predict_churn IS 'Prediz probabilidade de churn do cliente';

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE client_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_alerts ENABLE ROW LEVEL SECURITY;

-- Super admins veem tudo
CREATE POLICY "Super admins veem predições"
  ON churn_predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.user_type = 'super_admin'
    )
  );

CREATE POLICY "Marketing heads veem predições"
  ON churn_predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.user_type IN ('super_admin', 'marketing_head', 'commercial')
    )
  );

CREATE POLICY "Super admins veem alertas"
  ON predictive_alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.user_type IN ('super_admin', 'marketing_head')
    )
  );

-- =====================================================
-- Fim da Migration: Predictive Intelligence
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration Predictive Intelligence concluída com sucesso!';
  RAISE NOTICE '📊 10 tabelas criadas';
  RAISE NOTICE '🤖 Sistema preditivo de ML implementado';
  RAISE NOTICE '🎯 Predições de churn, renovação e upsell prontas';
  RAISE NOTICE '📈 Health scores e alertas automáticos configurados';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 AGORA SÃO 19 MIGRATIONS TOTAIS!';
END $$;


-- ========================================================
-- END: supabase/migrations/20251112000019_create_predictive_intelligence_system.sql
-- ========================================================


-- ========================================================
-- BEGIN: supabase/migrations/20251112000026_create_machine_learning_marketing_system.sql
-- ========================================================

-- =====================================================================================
-- Migration: Machine Learning para Marketing
-- Descrição: Sistema de aprendizado contínuo que analisa padrões de marketing,
--            comportamento de clientes, tendências de mercado e performance de conteúdo
-- Versão: 1.0
-- Data: 2025-11-12
-- =====================================================================================

-- =====================================================================================
-- 1. PADRÕES DE MARKETING (O que funciona melhor)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS ml_marketing_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_type VARCHAR(50) NOT NULL, -- 'post_type', 'timing', 'hashtag', 'copy_tone', 'channel', 'format'
    pattern_name VARCHAR(255) NOT NULL,
    pattern_description TEXT,
    
    -- Dados de análise
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    industry VARCHAR(100), -- Se null, aplica-se a todos
    
    -- Métricas de performance
    success_rate DECIMAL(5,2) DEFAULT 0, -- % de sucesso
    avg_engagement_rate DECIMAL(8,4) DEFAULT 0,
    avg_conversion_rate DECIMAL(8,4) DEFAULT 0,
    avg_reach INTEGER DEFAULT 0,
    avg_roi DECIMAL(10,2) DEFAULT 0,
    
    -- Dados aprendidos
    best_time_to_post TIME,
    best_day_of_week INTEGER, -- 0=domingo, 6=sábado
    optimal_frequency_per_week INTEGER,
    recommended_budget DECIMAL(10,2),
    
    -- Contexto
    sample_size INTEGER DEFAULT 0, -- Quantos posts/campanhas foram analisados
    confidence_score DECIMAL(5,2) DEFAULT 0, -- 0-100 (confiança da IA)
    last_trained_at TIMESTAMP WITH TIME ZONE,
    
    -- Recomendações
    recommendation TEXT,
    action_items JSONB, -- [{action: 'string', priority: 'high|medium|low', impact: 'string'}]
    
    -- Metadados
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    -- Índices
    CONSTRAINT unique_pattern_per_client UNIQUE(pattern_type, pattern_name, client_id)
);

CREATE INDEX idx_ml_marketing_patterns_client ON ml_marketing_patterns(client_id);
CREATE INDEX idx_ml_marketing_patterns_type ON ml_marketing_patterns(pattern_type);
CREATE INDEX idx_ml_marketing_patterns_confidence ON ml_marketing_patterns(confidence_score DESC);
CREATE INDEX idx_ml_marketing_patterns_active ON ml_marketing_patterns(is_active) WHERE is_active = true;

COMMENT ON TABLE ml_marketing_patterns IS 'Padrões de marketing aprendidos pela IA';

-- =====================================================================================
-- 2. PERFORMANCE DE CONTEÚDO (Aprendizado sobre tipos de conteúdo)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS ml_content_performance_learning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    content_type VARCHAR(50) NOT NULL, -- 'post', 'story', 'reel', 'video', 'article', 'ad'
    content_format VARCHAR(50), -- 'image', 'video', 'carousel', 'text', 'link'
    platform VARCHAR(50), -- 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube'
    
    -- Cliente/Indústria
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    industry VARCHAR(100),
    
    -- Características do conteúdo que performaram bem
    optimal_length_chars INTEGER, -- Tamanho ideal do texto
    optimal_duration_seconds INTEGER, -- Duração ideal de vídeos
    optimal_image_ratio VARCHAR(20), -- '1:1', '16:9', '9:16', '4:5'
    optimal_hashtag_count INTEGER,
    optimal_cta_type VARCHAR(50), -- 'link', 'comment', 'share', 'save', 'like'
    
    -- Elementos visuais
    color_palette JSONB, -- ['#FF5733', '#C70039', ...] cores que funcionam
    visual_style VARCHAR(50), -- 'minimal', 'bold', 'professional', 'playful'
    
    -- Copy writing
    tone_of_voice VARCHAR(50), -- 'formal', 'casual', 'humorous', 'inspirational', 'educational'
    emoji_usage VARCHAR(20), -- 'none', 'minimal', 'moderate', 'heavy'
    question_in_copy BOOLEAN, -- Fazer pergunta aumenta engajamento?
    urgency_in_copy BOOLEAN, -- Senso de urgência funciona?
    
    -- Métricas agregadas
    avg_engagement_rate DECIMAL(8,4) DEFAULT 0,
    avg_reach INTEGER DEFAULT 0,
    avg_impressions INTEGER DEFAULT 0,
    avg_saves INTEGER DEFAULT 0,
    avg_shares INTEGER DEFAULT 0,
    avg_comments INTEGER DEFAULT 0,
    avg_click_rate DECIMAL(8,4) DEFAULT 0,
    avg_conversion_rate DECIMAL(8,4) DEFAULT 0,
    
    -- Análise
    sample_size INTEGER DEFAULT 0,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    
    -- Insights
    key_insights TEXT,
    do_this JSONB, -- ['Use vídeos curtos', 'Poste às 18h', ...]
    dont_do_this JSONB, -- ['Evite textos longos', 'Não poste domingo', ...]
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_content_learning_client ON ml_content_performance_learning(client_id);
CREATE INDEX idx_ml_content_learning_platform ON ml_content_performance_learning(platform);
CREATE INDEX idx_ml_content_learning_type ON ml_content_performance_learning(content_type);

COMMENT ON TABLE ml_content_performance_learning IS 'Aprendizado sobre qual tipo de conteúdo performa melhor';

-- =====================================================================================
-- 3. PADRÕES DE COMPORTAMENTO DE CLIENTES
-- =====================================================================================

CREATE TABLE IF NOT EXISTS ml_client_behavior_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Segmentação
    behavior_segment VARCHAR(100) NOT NULL, -- 'high_engagement', 'churn_risk', 'growth_potential', 'satisfied', 'needs_attention'
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Características do segmento
    avg_contract_value DECIMAL(10,2),
    avg_lifetime_months INTEGER,
    avg_nps_score DECIMAL(3,1),
    avg_payment_delay_days INTEGER,
    
    -- Padrões identificados
    renewal_probability DECIMAL(5,2), -- 0-100%
    upsell_probability DECIMAL(5,2),
    referral_probability DECIMAL(5,2),
    churn_risk_score DECIMAL(5,2),
    
    -- Gatilhos de comportamento
    positive_triggers JSONB, -- [{'trigger': 'entrega rápida', 'impact': 'high'}, ...]
    negative_triggers JSONB, -- [{'trigger': 'atraso na entrega', 'impact': 'high'}, ...]
    
    -- Recomendações
    recommended_actions JSONB,
    best_time_to_contact TIME,
    best_channel VARCHAR(50), -- 'whatsapp', 'email', 'call', 'meeting'
    
    -- Predições
    predicted_ltv DECIMAL(10,2), -- Lifetime value previsto
    predicted_churn_date DATE,
    optimal_upsell_timing VARCHAR(50), -- 'now', '1_month', '3_months', '6_months'
    
    -- Análise
    sample_size INTEGER DEFAULT 0,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_client_behavior_client ON ml_client_behavior_patterns(client_id);
CREATE INDEX idx_ml_client_behavior_segment ON ml_client_behavior_patterns(behavior_segment);
CREATE INDEX idx_ml_client_behavior_churn ON ml_client_behavior_patterns(churn_risk_score DESC);

COMMENT ON TABLE ml_client_behavior_patterns IS 'Padrões de comportamento de clientes identificados pela IA';

-- =====================================================================================
-- 4. TENDÊNCIAS DE MERCADO (O que está acontecendo no mercado)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS ml_market_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    trend_name VARCHAR(255) NOT NULL,
    trend_category VARCHAR(50), -- 'content_format', 'platform', 'hashtag', 'topic', 'behavior', 'technology'
    industry VARCHAR(100),
    
    -- Status da tendência
    trend_status VARCHAR(20) DEFAULT 'emerging', -- 'emerging', 'growing', 'peak', 'declining', 'dead'
    trend_velocity VARCHAR(20), -- 'explosive', 'fast', 'moderate', 'slow'
    
    -- Dados da tendência
    search_volume INTEGER DEFAULT 0,
    search_volume_change_percent DECIMAL(6,2), -- Variação % vs período anterior
    mentions_count INTEGER DEFAULT 0,
    mentions_growth_rate DECIMAL(6,2),
    
    -- Análise de sentimento
    positive_sentiment_percent DECIMAL(5,2),
    negative_sentiment_percent DECIMAL(5,2),
    neutral_sentiment_percent DECIMAL(5,2),
    
    -- Origem dos dados
    data_sources JSONB, -- ['google_trends', 'twitter', 'instagram', 'news', ...]
    geographic_relevance VARCHAR(50), -- 'global', 'brazil', 'sao_paulo', 'regional'
    
    -- Previsões
    predicted_peak_date DATE,
    predicted_longevity_months INTEGER,
    opportunity_score DECIMAL(5,2), -- 0-100 (quão boa é a oportunidade)
    
    -- Recomendações
    recommendation TEXT,
    action_plan JSONB,
    target_audience JSONB,
    
    -- Exemplos
    success_examples JSONB, -- [{brand: 'X', campaign: 'Y', result: 'Z'}, ...]
    related_keywords JSONB,
    
    -- Metadados
    first_detected_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_market_trends_status ON ml_market_trends(trend_status);
CREATE INDEX idx_ml_market_trends_opportunity ON ml_market_trends(opportunity_score DESC);
CREATE INDEX idx_ml_market_trends_industry ON ml_market_trends(industry);
CREATE INDEX idx_ml_market_trends_category ON ml_market_trends(trend_category);

COMMENT ON TABLE ml_market_trends IS 'Tendências de mercado identificadas automaticamente pela IA';

-- =====================================================================================
-- 5. LOG DE PREDIÇÕES (Para medir acurácia da IA)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS ml_predictions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tipo de predição
    prediction_type VARCHAR(50) NOT NULL, -- 'churn', 'conversion', 'engagement', 'virality', 'roi', 'optimal_time'
    prediction_target VARCHAR(50), -- 'client', 'post', 'campaign', 'employee'
    target_id UUID,
    
    -- Predição
    predicted_value JSONB, -- Valor previsto (pode ser número, boolean, string, objeto)
    predicted_probability DECIMAL(5,2), -- Confiança na predição (0-100)
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    predicted_for_date DATE, -- Para quando a predição é válida
    
    -- Resultado real
    actual_value JSONB,
    actual_recorded_at TIMESTAMP WITH TIME ZONE,
    
    -- Acurácia
    was_correct BOOLEAN,
    error_margin DECIMAL(8,4), -- Margem de erro
    accuracy_score DECIMAL(5,2), -- 0-100
    
    -- Contexto
    model_version VARCHAR(50),
    features_used JSONB, -- Quais features foram usadas para a predição
    
    -- Metadados
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_predictions_type ON ml_predictions_log(prediction_type);
CREATE INDEX idx_ml_predictions_target ON ml_predictions_log(target_id);
CREATE INDEX idx_ml_predictions_accuracy ON ml_predictions_log(accuracy_score DESC);
CREATE INDEX idx_ml_predictions_date ON ml_predictions_log(predicted_for_date);

COMMENT ON TABLE ml_predictions_log IS 'Log de todas as predições para medir acurácia da IA';

-- =====================================================================================
-- 6. HISTÓRICO DE TREINAMENTO DE MODELOS
-- =====================================================================================

CREATE TABLE IF NOT EXISTS ml_model_training_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação do modelo
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50), -- 'classification', 'regression', 'clustering', 'neural_network'
    
    -- Dados de treinamento
    training_dataset_size INTEGER,
    training_started_at TIMESTAMP WITH TIME ZONE,
    training_completed_at TIMESTAMP WITH TIME ZONE,
    training_duration_seconds INTEGER,
    
    -- Features usadas
    features_used JSONB,
    hyperparameters JSONB,
    
    -- Métricas de performance
    accuracy DECIMAL(5,2),
    precision_score DECIMAL(5,2),
    recall DECIMAL(5,2),
    f1_score DECIMAL(5,2),
    rmse DECIMAL(10,4), -- Root Mean Square Error
    mae DECIMAL(10,4), -- Mean Absolute Error
    
    -- Validação
    validation_method VARCHAR(50), -- 'cross_validation', 'train_test_split', 'time_series_split'
    validation_score DECIMAL(5,2),
    
    -- Comparação com versão anterior
    previous_version VARCHAR(50),
    improvement_percent DECIMAL(6,2),
    
    -- Dados de produção
    deployed_to_production BOOLEAN DEFAULT false,
    deployed_at TIMESTAMP WITH TIME ZONE,
    is_active_model BOOLEAN DEFAULT false,
    
    -- Observações
    training_notes TEXT,
    issues_encountered TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_ml_model_training_name ON ml_model_training_history(model_name);
CREATE INDEX idx_ml_model_training_version ON ml_model_training_history(model_version);
CREATE INDEX idx_ml_model_training_active ON ml_model_training_history(is_active_model) WHERE is_active_model = true;

COMMENT ON TABLE ml_model_training_history IS 'Histórico de treinamento dos modelos de ML';

-- =====================================================================================
-- 7. INSIGHTS PARA SUPER ADMIN (Dashboard consolidado)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS super_admin_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Classificação do insight
    insight_category VARCHAR(50) NOT NULL, -- 'opportunity', 'risk', 'trend', 'optimization', 'alert'
    insight_priority VARCHAR(20) DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
    insight_title VARCHAR(255) NOT NULL,
    insight_description TEXT NOT NULL,
    
    -- Dados do insight
    affected_area VARCHAR(50), -- 'marketing', 'sales', 'operations', 'finance', 'hr', 'clients'
    affected_clients JSONB, -- [client_ids] se aplicável
    
    -- Métricas
    potential_impact_revenue DECIMAL(10,2), -- Impacto financeiro estimado
    potential_impact_percent DECIMAL(6,2), -- Impacto percentual
    confidence_score DECIMAL(5,2),
    urgency_score DECIMAL(5,2), -- 0-100 (quão urgente é agir)
    
    -- Recomendações
    recommended_actions JSONB, -- [{action: 'string', priority: 'high', effort: 'low', impact: 'high'}]
    estimated_implementation_hours INTEGER,
    estimated_roi DECIMAL(10,2),
    
    -- Dados de origem
    source_type VARCHAR(50), -- 'ml_pattern', 'market_trend', 'client_behavior', 'manual'
    source_id UUID,
    generated_by VARCHAR(50) DEFAULT 'ai', -- 'ai', 'system', 'user'
    
    -- Estado
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'reviewing', 'approved', 'in_progress', 'completed', 'dismissed'
    viewed_by_admin BOOLEAN DEFAULT false,
    viewed_at TIMESTAMP WITH TIME ZONE,
    action_taken TEXT,
    action_taken_at TIMESTAMP WITH TIME ZONE,
    action_taken_by UUID REFERENCES users(id),
    
    -- Resultado (após ação)
    actual_impact_revenue DECIMAL(10,2),
    actual_impact_percent DECIMAL(6,2),
    result_notes TEXT,
    
    -- Metadados
    valid_until DATE, -- Insights podem expirar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_super_admin_insights_priority ON super_admin_insights(insight_priority);
CREATE INDEX idx_super_admin_insights_status ON super_admin_insights(status);
CREATE INDEX idx_super_admin_insights_viewed ON super_admin_insights(viewed_by_admin);
CREATE INDEX idx_super_admin_insights_category ON super_admin_insights(insight_category);
CREATE INDEX idx_super_admin_insights_urgency ON super_admin_insights(urgency_score DESC);

COMMENT ON TABLE super_admin_insights IS 'Insights consolidados para o super admin';

-- =====================================================================================
-- TRIGGERS
-- =====================================================================================

CREATE TRIGGER update_ml_marketing_patterns_timestamp
    BEFORE UPDATE ON ml_marketing_patterns
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER update_ml_content_performance_learning_timestamp
    BEFORE UPDATE ON ml_content_performance_learning
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER update_ml_client_behavior_patterns_timestamp
    BEFORE UPDATE ON ml_client_behavior_patterns
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER update_ml_market_trends_timestamp
    BEFORE UPDATE ON ml_market_trends
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER update_super_admin_insights_timestamp
    BEFORE UPDATE ON super_admin_insights
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

-- =====================================================================================
-- RLS (Row Level Security)
-- =====================================================================================

ALTER TABLE ml_marketing_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_content_performance_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_client_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_training_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_insights ENABLE ROW LEVEL SECURITY;

-- Super admin vê tudo
CREATE POLICY super_admin_ml_marketing_patterns ON ml_marketing_patterns FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.role::text = 'super_admin')
);

CREATE POLICY super_admin_ml_content_learning ON ml_content_performance_learning FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.role::text = 'super_admin')
);

CREATE POLICY super_admin_ml_client_behavior ON ml_client_behavior_patterns FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.role::text = 'super_admin')
);

CREATE POLICY super_admin_ml_market_trends ON ml_market_trends FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.role::text = 'super_admin')
);

CREATE POLICY super_admin_ml_predictions ON ml_predictions_log FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.role::text = 'super_admin')
);

CREATE POLICY super_admin_ml_model_training ON ml_model_training_history FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.role::text = 'super_admin')
);

CREATE POLICY super_admin_insights ON super_admin_insights FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.role::text = 'super_admin')
);

-- Gestores podem ver patterns e trends gerais
CREATE POLICY gestores_view_ml_patterns ON ml_marketing_patterns FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.role::text IN ('manager', 'admin', 'super_admin'))
);

CREATE POLICY gestores_view_ml_trends ON ml_market_trends FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.role::text IN ('manager', 'admin', 'super_admin'))
);

-- =====================================================================================
-- FIM DA MIGRATION
-- =====================================================================================

COMMENT ON SCHEMA public IS 'Migration 26: Machine Learning para Marketing - Sistema completo de aprendizado';


-- ========================================================
-- END: supabase/migrations/20251112000026_create_machine_learning_marketing_system.sql
-- ========================================================


-- ========================================================
-- BEGIN: supabase/migrations/20251206000001_create_goals_prospecting_system.sql
-- ========================================================

-- =====================================================
-- Valle 360 - Sistema de Metas Automáticas e Prospecção
-- Metas inteligentes por setor + Automação comercial
-- =====================================================

-- =====================================================
-- TABELAS DE METAS
-- =====================================================

-- Configuração de metas por setor/cargo
CREATE TABLE IF NOT EXISTS goal_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector VARCHAR(100) NOT NULL, -- social_media, designer, trafego, video_maker, comercial, rh
  role VARCHAR(100), -- cargo específico (opcional)
  
  -- Métricas base para o setor
  metrics JSONB NOT NULL DEFAULT '[]',
  -- Ex: [{"name": "posts_mes", "label": "Posts/Mês", "unit": "posts", "weight": 0.3}]
  
  -- Fórmula de cálculo
  calculation_method VARCHAR(50) DEFAULT 'average_plus_growth', -- average_plus_growth, fixed, benchmark
  growth_rate DECIMAL(5,2) DEFAULT 10.00, -- % de crescimento padrão
  min_growth_rate DECIMAL(5,2) DEFAULT 5.00,
  max_growth_rate DECIMAL(5,2) DEFAULT 30.00,
  
  -- Ajustes sazonais
  seasonal_adjustments JSONB DEFAULT '{}',
  -- Ex: {"11": 1.3, "12": 1.3} para Black Friday/Natal
  
  -- Configurações específicas
  always_increase BOOLEAN DEFAULT false, -- Para comercial: meta sempre cresce
  benchmark_source VARCHAR(100), -- Fonte de benchmark externo
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metas individuais dos colaboradores
CREATE TABLE IF NOT EXISTS collaborator_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL,
  collaborator_name VARCHAR(255),
  sector VARCHAR(100) NOT NULL,
  
  -- Período da meta
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'monthly', -- weekly, monthly, quarterly
  
  -- Meta e progresso
  goals JSONB NOT NULL DEFAULT '{}',
  -- Ex: {"posts_mes": {"target": 30, "current": 25, "unit": "posts"}}
  
  overall_progress DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, failed, exceeded
  
  -- IA e automação
  ai_suggested BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(5,2),
  ai_reasoning TEXT,
  adjusted_by UUID, -- Se foi ajustada manualmente
  adjustment_reason TEXT,
  
  -- Gamificação
  streak_days INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  points_earned INTEGER DEFAULT 0,
  
  -- Notificações enviadas
  notifications_sent JSONB DEFAULT '[]',
  last_reminder_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histórico de produção (para cálculo de metas)
CREATE TABLE IF NOT EXISTS production_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL,
  sector VARCHAR(100) NOT NULL,
  
  -- Período
  period_date DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'daily',
  
  -- Métricas produzidas
  metrics JSONB NOT NULL DEFAULT '{}',
  -- Ex: {"posts": 5, "engajamento": 1200, "alcance": 5000}
  
  -- Contexto
  notes TEXT,
  tags JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conquistas e badges
CREATE TABLE IF NOT EXISTS goal_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  points INTEGER DEFAULT 0,
  
  -- Critérios para desbloquear
  criteria JSONB NOT NULL,
  -- Ex: {"type": "streak", "value": 7} ou {"type": "goals_completed", "value": 3}
  
  sector VARCHAR(100), -- NULL = todas as áreas
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conquistas desbloqueadas pelos colaboradores
CREATE TABLE IF NOT EXISTS collaborator_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL,
  achievement_id UUID REFERENCES goal_achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT false
);

-- =====================================================
-- TABELAS DE PROSPECÇÃO AUTOMATIZADA
-- =====================================================

-- Leads captados automaticamente
CREATE TABLE IF NOT EXISTS prospecting_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados da empresa
  company_name VARCHAR(255) NOT NULL,
  company_website VARCHAR(500),
  company_industry VARCHAR(100),
  company_size VARCHAR(50), -- micro, small, medium, large
  company_location JSONB, -- {city, state, country}
  
  -- Contato
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_linkedin VARCHAR(500),
  contact_role VARCHAR(100),
  
  -- Origem e qualificação
  source VARCHAR(50) NOT NULL, -- tavily, linkedin, google_maps, manual, referral
  source_details JSONB,
  segment VARCHAR(100), -- ecommerce, restaurante, clinica, franquia, etc
  
  -- Score de qualificação (IA)
  qualification_score INTEGER DEFAULT 0, -- 0-100
  qualification_factors JSONB DEFAULT '[]',
  -- Ex: [{"factor": "sem_trafego_pago", "impact": 20}, {"factor": "site_desatualizado", "impact": 15}]
  
  -- Status no funil
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, responding, meeting_scheduled, negotiating, won, lost
  status_history JSONB DEFAULT '[]',
  
  -- Atribuição
  assigned_to UUID,
  assigned_at TIMESTAMPTZ,
  
  -- Valor estimado
  estimated_value DECIMAL(12,2),
  estimated_services JSONB DEFAULT '[]',
  
  -- Interações
  interactions_count INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMPTZ,
  next_action VARCHAR(255),
  next_action_date TIMESTAMPTZ,
  
  -- Tags e notas
  tags JSONB DEFAULT '[]',
  notes TEXT,
  
  -- Conversão
  converted_at TIMESTAMPTZ,
  converted_to_client_id UUID,
  won_value DECIMAL(12,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campanhas de prospecção
CREATE TABLE IF NOT EXISTS prospecting_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Segmento alvo
  target_segment VARCHAR(100) NOT NULL,
  target_criteria JSONB NOT NULL,
  -- Ex: {"industry": "ecommerce", "size": ["small", "medium"], "location": {"state": "SP"}}
  
  -- Sequência de contatos
  sequence JSONB NOT NULL,
  -- Ex: [{"day": 0, "channel": "email", "template": "intro"}, {"day": 3, "channel": "email", "template": "followup1"}]
  
  -- Configurações
  max_leads_per_day INTEGER DEFAULT 10,
  auto_qualify BOOLEAN DEFAULT true,
  min_qualification_score INTEGER DEFAULT 50,
  auto_assign BOOLEAN DEFAULT true,
  assign_to_team JSONB DEFAULT '[]', -- IDs dos comerciais
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed
  
  -- Métricas
  leads_found INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  leads_responded INTEGER DEFAULT 0,
  meetings_scheduled INTEGER DEFAULT 0,
  deals_won INTEGER DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  
  -- Período
  start_date DATE,
  end_date DATE,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de mensagens
CREATE TABLE IF NOT EXISTS prospecting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  channel VARCHAR(50) NOT NULL, -- email, linkedin, whatsapp
  purpose VARCHAR(50) NOT NULL, -- intro, followup, meeting_request, proposal
  
  subject VARCHAR(500), -- Para emails
  content TEXT NOT NULL, -- Pode conter variáveis: {{company_name}}, {{contact_name}}, etc
  
  -- Variáveis suportadas
  variables JSONB DEFAULT '[]',
  
  -- Performance
  times_used INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2),
  
  is_ai_generated BOOLEAN DEFAULT false,
  sector VARCHAR(100), -- NULL = todos
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interações com leads
CREATE TABLE IF NOT EXISTS lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES prospecting_leads(id) ON DELETE CASCADE,
  
  -- Tipo de interação
  type VARCHAR(50) NOT NULL, -- email_sent, email_opened, email_replied, linkedin_sent, linkedin_accepted, call, meeting, whatsapp
  channel VARCHAR(50),
  
  -- Conteúdo
  subject VARCHAR(500),
  content TEXT,
  template_id UUID REFERENCES prospecting_templates(id),
  
  -- Resultado
  status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, opened, clicked, replied, bounced, failed
  response_content TEXT,
  response_at TIMESTAMPTZ,
  
  -- Detecção de intenção (IA)
  detected_intent VARCHAR(50), -- interested, not_interested, meeting_request, question, unsubscribe
  intent_confidence DECIMAL(5,2),
  
  -- Ação gerada
  action_generated VARCHAR(100), -- create_card, schedule_meeting, send_proposal
  action_details JSONB,
  
  sent_by UUID, -- Colaborador ou 'system'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reuniões agendadas
CREATE TABLE IF NOT EXISTS prospecting_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES prospecting_leads(id),
  
  -- Dados da reunião
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  meeting_link VARCHAR(500),
  location VARCHAR(255),
  
  -- Participantes
  attendees JSONB DEFAULT '[]',
  -- Ex: [{"email": "...", "name": "...", "role": "lead"}, {"email": "...", "name": "...", "role": "sales"}]
  
  -- Status
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no_show
  
  -- Resultado
  outcome VARCHAR(50), -- qualified, not_qualified, proposal_sent, deal_closed, follow_up_needed
  outcome_notes TEXT,
  next_steps TEXT,
  
  -- Criação automática
  auto_created BOOLEAN DEFAULT false,
  source_interaction_id UUID,
  kanban_card_id UUID,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELAS DE NOTIFICAÇÕES E ALERTAS
-- =====================================================

-- Alertas de metas
CREATE TABLE IF NOT EXISTS goal_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL,
  goal_id UUID REFERENCES collaborator_goals(id),
  
  type VARCHAR(50) NOT NULL, -- behind_schedule, on_track, exceeding, streak_broken, achievement_unlocked
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, critical, success
  
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Ação sugerida
  suggested_action VARCHAR(255),
  action_url VARCHAR(500),
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT false,
  
  -- Para gerentes
  escalated_to UUID,
  escalated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Configurações de metas por setor
INSERT INTO goal_configs (sector, metrics, calculation_method, growth_rate, always_increase, seasonal_adjustments) VALUES
('social_media', '[
  {"name": "posts", "label": "Posts Publicados", "unit": "posts", "weight": 0.3},
  {"name": "stories", "label": "Stories", "unit": "stories", "weight": 0.2},
  {"name": "engajamento", "label": "Taxa de Engajamento", "unit": "%", "weight": 0.3},
  {"name": "alcance", "label": "Alcance Total", "unit": "pessoas", "weight": 0.2}
]', 'average_plus_growth', 10.00, false, '{"11": 1.2, "12": 1.3}'),

('designer', '[
  {"name": "pecas", "label": "Peças Entregues", "unit": "peças", "weight": 0.4},
  {"name": "revisoes", "label": "Revisões (menos é melhor)", "unit": "revisões", "weight": 0.2, "inverse": true},
  {"name": "tempo_medio", "label": "Tempo Médio por Peça", "unit": "horas", "weight": 0.2, "inverse": true},
  {"name": "satisfacao", "label": "Satisfação do Cliente", "unit": "%", "weight": 0.2}
]', 'average_plus_growth', 8.00, false, '{"11": 1.3, "12": 1.4}'),

('trafego', '[
  {"name": "roas", "label": "ROAS Médio", "unit": "x", "weight": 0.35},
  {"name": "conversoes", "label": "Conversões Totais", "unit": "conversões", "weight": 0.25},
  {"name": "cpc", "label": "CPC Médio", "unit": "R$", "weight": 0.2, "inverse": true},
  {"name": "investimento_gerenciado", "label": "Investimento Gerenciado", "unit": "R$", "weight": 0.2}
]', 'benchmark', 12.00, false, '{"11": 1.4, "12": 1.5}'),

('video_maker', '[
  {"name": "videos", "label": "Vídeos Entregues", "unit": "vídeos", "weight": 0.4},
  {"name": "minutos_produzidos", "label": "Minutos Produzidos", "unit": "min", "weight": 0.3},
  {"name": "views_total", "label": "Views Totais", "unit": "views", "weight": 0.2},
  {"name": "satisfacao", "label": "Satisfação", "unit": "%", "weight": 0.1}
]', 'average_plus_growth', 10.00, false, '{"11": 1.2, "12": 1.2}'),

('comercial', '[
  {"name": "leads_qualificados", "label": "Leads Qualificados", "unit": "leads", "weight": 0.25},
  {"name": "reunioes", "label": "Reuniões Realizadas", "unit": "reuniões", "weight": 0.25},
  {"name": "propostas", "label": "Propostas Enviadas", "unit": "propostas", "weight": 0.2},
  {"name": "fechamentos", "label": "Fechamentos", "unit": "contratos", "weight": 0.3}
]', 'average_plus_growth', 15.00, true, '{"1": 1.2, "7": 1.1, "11": 1.3, "12": 1.2}'),

('rh', '[
  {"name": "contratacoes", "label": "Contratações", "unit": "pessoas", "weight": 0.4},
  {"name": "tempo_vaga", "label": "Tempo Médio de Vaga", "unit": "dias", "weight": 0.3, "inverse": true},
  {"name": "retention_rate", "label": "Taxa de Retenção", "unit": "%", "weight": 0.2},
  {"name": "satisfacao_onboarding", "label": "Satisfação Onboarding", "unit": "%", "weight": 0.1}
]', 'fixed', 5.00, false, '{}');

-- Conquistas
INSERT INTO goal_achievements (code, name, description, icon, color, points, criteria) VALUES
('streak_7', 'Semana Perfeita', 'Bateu a meta diária por 7 dias seguidos', 'flame', 'orange', 100, '{"type": "streak", "value": 7}'),
('streak_30', 'Mês Impecável', 'Bateu a meta diária por 30 dias seguidos', 'fire', 'red', 500, '{"type": "streak", "value": 30}'),
('goals_3', 'Triplo', 'Completou 3 metas mensais consecutivas', 'trophy', 'gold', 300, '{"type": "goals_completed_consecutive", "value": 3}'),
('exceed_20', 'Superação', 'Excedeu a meta em mais de 20%', 'rocket', 'purple', 200, '{"type": "exceed_percentage", "value": 20}'),
('exceed_50', 'Extraordinário', 'Excedeu a meta em mais de 50%', 'star', 'yellow', 500, '{"type": "exceed_percentage", "value": 50}'),
('first_goal', 'Primeira Meta', 'Completou sua primeira meta', 'flag', 'green', 50, '{"type": "first_goal"}'),
('top_performer', 'Top Performer', 'Ficou em 1º lugar no ranking do mês', 'crown', 'gold', 400, '{"type": "ranking", "position": 1}'),
('improvement', 'Evolução', 'Melhorou 25% em relação ao mês anterior', 'trending-up', 'blue', 150, '{"type": "improvement", "value": 25}'),
('team_player', 'Jogador de Equipe', 'Ajudou 3 colegas a baterem suas metas', 'users', 'indigo', 200, '{"type": "helped_colleagues", "value": 3}'),
('early_bird', 'Madrugador', 'Bateu a meta antes do dia 20', 'sunrise', 'amber', 100, '{"type": "early_completion", "day": 20}');

-- Templates de prospecção
INSERT INTO prospecting_templates (name, channel, purpose, subject, content, variables) VALUES
('Introdução Geral', 'email', 'intro', 
 'Potencialize os resultados da {{company_name}} com marketing digital',
 'Olá {{contact_name}},

Meu nome é {{sender_name}} e sou {{sender_role}} na Valle 360.

Notei que a {{company_name}} atua no segmento de {{segment}} e acredito que podemos ajudar vocês a:

✅ Aumentar a presença digital
✅ Gerar mais leads qualificados  
✅ Converter mais vendas

Temos cases de sucesso com empresas similares à sua, com resultados como:
- Aumento de 300% no alcance das redes sociais
- Redução de 40% no custo por lead
- ROI de 5x em campanhas de tráfego pago

Gostaria de agendar uma conversa de 15 minutos para entender melhor suas necessidades?

Abraços,
{{sender_name}}
{{sender_phone}}',
 '["company_name", "contact_name", "segment", "sender_name", "sender_role", "sender_phone"]'),

('Follow-up 1', 'email', 'followup',
 'Re: Potencialize os resultados da {{company_name}}',
 'Olá {{contact_name}},

Espero que esteja bem! 

Enviei uma mensagem há alguns dias sobre como a Valle 360 pode ajudar a {{company_name}} a crescer no digital.

Sei que a agenda é corrida, então vou direto ao ponto: temos um diagnóstico gratuito que identifica oportunidades de melhoria no marketing digital da sua empresa.

O diagnóstico inclui:
📊 Análise das redes sociais
🎯 Avaliação de SEO do site
💰 Estimativa de potencial com tráfego pago

Posso enviar o diagnóstico? Basta responder este email.

Abraços,
{{sender_name}}',
 '["company_name", "contact_name", "sender_name"]'),

('Pedido de Reunião', 'email', 'meeting_request',
 'Vamos conversar? 15 min que podem transformar seus resultados',
 'Olá {{contact_name}},

Última tentativa de contato! 😊

Gostaria muito de apresentar como podemos ajudar a {{company_name}} a:

🚀 Dobrar o engajamento nas redes sociais
📈 Reduzir custo de aquisição de clientes
💼 Automatizar processos de marketing

Tenho horários disponíveis:
- {{slot_1}}
- {{slot_2}}
- {{slot_3}}

Qual funciona melhor para você?

Se preferir, pode agendar direto aqui: {{booking_link}}

Aguardo seu retorno!
{{sender_name}}',
 '["company_name", "contact_name", "sender_name", "slot_1", "slot_2", "slot_3", "booking_link"]'),

('LinkedIn Connection', 'linkedin', 'intro',
 NULL,
 'Olá {{contact_name}}! Vi que você é {{contact_role}} na {{company_name}}. Trabalho com marketing digital para empresas do segmento de {{segment}} e adoraria conectar para trocar experiências. Aceita?',
 '["contact_name", "contact_role", "company_name", "segment"]'),

('WhatsApp Intro', 'whatsapp', 'intro',
 NULL,
 'Olá {{contact_name}}! 👋

Sou {{sender_name}} da Valle 360, agência de marketing digital.

Vi que a {{company_name}} está crescendo e gostaria de oferecer um diagnóstico gratuito do marketing digital de vocês.

Posso enviar? Leva só 2 minutos para você ver os insights! 📊',
 '["contact_name", "sender_name", "company_name"]');

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_collaborator_goals_collaborator ON collaborator_goals(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_goals_period ON collaborator_goals(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_collaborator_goals_status ON collaborator_goals(status);
CREATE INDEX IF NOT EXISTS idx_production_history_collaborator ON production_history(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_production_history_date ON production_history(period_date);
CREATE INDEX IF NOT EXISTS idx_prospecting_leads_status ON prospecting_leads(status);
CREATE INDEX IF NOT EXISTS idx_prospecting_leads_assigned ON prospecting_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_prospecting_leads_segment ON prospecting_leads(segment);
CREATE INDEX IF NOT EXISTS idx_prospecting_leads_score ON prospecting_leads(qualification_score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead ON lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_goal_alerts_collaborator ON goal_alerts(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_goal_alerts_read ON goal_alerts(read);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE goal_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospecting_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospecting_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospecting_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospecting_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessidade)
CREATE POLICY "Allow all for authenticated" ON goal_configs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON collaborator_goals FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON production_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON goal_achievements FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON collaborator_achievements FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON prospecting_leads FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON prospecting_campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON prospecting_templates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON lead_interactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON prospecting_meetings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated" ON goal_alerts FOR ALL TO authenticated USING (true);


-- ========================================================
-- END: supabase/migrations/20251206000001_create_goals_prospecting_system.sql
-- ========================================================


-- ========================================================
-- BEGIN: supabase/migrations/20260102000003_add_client_segment_and_competitors.sql
-- ========================================================

-- Epic 11: Persistir segmento/nicho e concorrentes do cliente
-- Safe migration: adiciona colunas sem quebrar ambientes com schema legacy.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS segment text;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS competitors text[];

-- Compat PT-BR (algumas telas usam "concorrentes" como texto livre)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS concorrentes text;



-- ========================================================
-- END: supabase/migrations/20260102000003_add_client_segment_and_competitors.sql
-- ========================================================


-- ========================================================
-- BEGIN: supabase/migrations/20260102000004_clients_rls_and_client_ai_insights.sql
-- ========================================================

-- Epic 13: Insights IA do Cliente (persistência) + policies mínimas de RLS para clients

-- =====================================================
-- 1) RLS policies mínimas em public.clients (owner/admin)
-- Observação: várias rotas server-side usam service role, mas ter policy aqui ajuda
-- componentes/rotas que leem via sessão do usuário (RLS).
-- =====================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS clients_select_owner_or_admin ON public.clients;
CREATE POLICY clients_select_owner_or_admin
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS clients_update_owner_or_admin ON public.clients;
CREATE POLICY clients_update_owner_or_admin
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT public.is_admin())
    OR user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS clients_insert_admin_only ON public.clients;
CREATE POLICY clients_insert_admin_only
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS clients_delete_admin_only ON public.clients;
CREATE POLICY clients_delete_admin_only
  ON public.clients
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

-- =====================================================
-- 2) Tabela: client_ai_insights
-- =====================================================

CREATE TABLE IF NOT EXISTS public.client_ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  type text NOT NULL CHECK (type IN ('oportunidade', 'melhoria', 'alerta', 'tendencia')),
  priority text NOT NULL CHECK (priority IN ('alta', 'media', 'baixa')),
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_analise', 'implementado', 'ignorado')),

  title text NOT NULL,
  description text NOT NULL,
  impact text,
  action text,

  sources text[] NOT NULL DEFAULT '{}'::text[],
  provider text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_ai_insights_client_id_created_at
  ON public.client_ai_insights (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_ai_insights_client_id_status
  ON public.client_ai_insights (client_id, status);

ALTER TABLE public.client_ai_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_ai_insights_select_owner_or_admin ON public.client_ai_insights;
CREATE POLICY client_ai_insights_select_owner_or_admin
  ON public.client_ai_insights
  FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = client_ai_insights.client_id
        AND c.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS client_ai_insights_insert_owner_or_admin ON public.client_ai_insights;
CREATE POLICY client_ai_insights_insert_owner_or_admin
  ON public.client_ai_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_admin())
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = client_ai_insights.client_id
        AND c.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS client_ai_insights_update_owner_or_admin ON public.client_ai_insights;
CREATE POLICY client_ai_insights_update_owner_or_admin
  ON public.client_ai_insights
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = client_ai_insights.client_id
        AND c.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    (SELECT public.is_admin())
    OR EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = client_ai_insights.client_id
        AND c.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS client_ai_insights_delete_admin_only ON public.client_ai_insights;
CREATE POLICY client_ai_insights_delete_admin_only
  ON public.client_ai_insights
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));



-- ========================================================
-- END: supabase/migrations/20260102000004_clients_rls_and_client_ai_insights.sql
-- ========================================================


-- ========================================================
-- BEGIN: supabase/migrations/20260105000005_create_sentiment_system.sql
-- ========================================================

-- =====================================================
-- MIGRATION: Sentiment System (Queue + Analyses + Alerts + Daily Stats)
-- Objetivo: habilitar /admin/monitoramento-sentimento + /api/sentiment/*
-- Observação: usa CHECKs (não enums) para evitar conflitos de enum em bases existentes.
-- =====================================================

-- =========================
-- 1) TABELAS
-- =========================

CREATE TABLE IF NOT EXISTS public.sentiment_processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('message','nps_response','task_comment','feedback','review','support_ticket','email')),
  source_id uuid NOT NULL,
  source_table text,
  content text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  priority integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  last_error text,
  result_id uuid,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_sentiment_queue_status_priority
  ON public.sentiment_processing_queue(status, priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_sentiment_queue_client
  ON public.sentiment_processing_queue(client_id);

CREATE TABLE IF NOT EXISTS public.sentiment_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('message','nps_response','task_comment','feedback','review','support_ticket','email')),
  source_id uuid NOT NULL,
  source_table text,
  content text NOT NULL,
  content_preview text,
  provider text,
  overall_sentiment text NOT NULL CHECK (overall_sentiment IN ('positive','neutral','negative')),
  score double precision NOT NULL,
  magnitude double precision,
  confidence double precision,
  emotions jsonb,
  entities jsonb,
  keywords jsonb,
  summary text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content_created_at timestamptz,
  processing_time_ms integer,
  alert_generated boolean NOT NULL DEFAULT false,
  alert_id uuid,
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sentiment_analyses_analyzed_at
  ON public.sentiment_analyses(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_analyses_client
  ON public.sentiment_analyses(client_id, analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_analyses_source
  ON public.sentiment_analyses(source_type, source_id);

CREATE TABLE IF NOT EXISTS public.sentiment_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sentiment_analysis_id uuid REFERENCES public.sentiment_analyses(id) ON DELETE SET NULL,
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical','high','medium','low')),
  title text NOT NULL,
  description text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name text,
  source_type text,
  source_content_preview text,
  suggested_action text,
  notification_channels jsonb DEFAULT '["in_app"]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','acknowledged','resolved','dismissed')),
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sentiment_alerts_status
  ON public.sentiment_alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_alerts_severity
  ON public.sentiment_alerts(severity, created_at DESC);

-- Daily stats para /api/sentiment/stats
CREATE TABLE IF NOT EXISTS public.sentiment_daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  total_analyses integer NOT NULL DEFAULT 0,
  positive_count integer NOT NULL DEFAULT 0,
  neutral_count integer NOT NULL DEFAULT 0,
  negative_count integer NOT NULL DEFAULT 0,
  average_score double precision NOT NULL DEFAULT 0,
  messages_count integer NOT NULL DEFAULT 0,
  nps_count integer NOT NULL DEFAULT 0,
  tasks_count integer NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date, client_id)
);

CREATE INDEX IF NOT EXISTS idx_sentiment_daily_stats_date
  ON public.sentiment_daily_stats(date DESC);

-- Config per-client (opcional)
CREATE TABLE IF NOT EXISTS public.sentiment_automation_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  provider text NOT NULL DEFAULT 'auto' CHECK (provider IN ('auto','google','openai','claude')),
  alert_on_negative boolean NOT NULL DEFAULT true,
  alert_threshold double precision NOT NULL DEFAULT -0.25,
  alert_channels jsonb NOT NULL DEFAULT '["in_app"]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================
-- 2) TRIGGERS updated_at
-- =========================

DO $$
BEGIN
  -- `update_updated_at_column` é criado em migrations iniciais; se não existir, ignorar.
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    DROP TRIGGER IF EXISTS update_sentiment_processing_queue_updated_at ON public.sentiment_processing_queue;
    CREATE TRIGGER update_sentiment_processing_queue_updated_at
      BEFORE UPDATE ON public.sentiment_processing_queue
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_sentiment_analyses_updated_at ON public.sentiment_analyses;
    CREATE TRIGGER update_sentiment_analyses_updated_at
      BEFORE UPDATE ON public.sentiment_analyses
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_sentiment_alerts_updated_at ON public.sentiment_alerts;
    CREATE TRIGGER update_sentiment_alerts_updated_at
      BEFORE UPDATE ON public.sentiment_alerts
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_sentiment_daily_stats_updated_at ON public.sentiment_daily_stats;
    CREATE TRIGGER update_sentiment_daily_stats_updated_at
      BEFORE UPDATE ON public.sentiment_daily_stats
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_sentiment_automation_config_updated_at ON public.sentiment_automation_config;
    CREATE TRIGGER update_sentiment_automation_config_updated_at
      BEFORE UPDATE ON public.sentiment_automation_config
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- =========================
-- 3) RPCs (Queue)
-- =========================

CREATE OR REPLACE FUNCTION public.add_to_sentiment_queue(
  p_source_type character varying,
  p_source_id uuid,
  p_source_table character varying,
  p_content text,
  p_client_id uuid,
  p_user_id uuid,
  p_priority integer,
  p_metadata jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Permitir apenas service_role ou admin
  IF (SELECT auth.role()) <> 'service_role' AND NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  INSERT INTO public.sentiment_processing_queue (
    source_type, source_id, source_table, content, client_id, user_id, priority, metadata, status, created_at, updated_at
  ) VALUES (
    p_source_type, p_source_id, p_source_table, p_content, p_client_id, p_user_id, COALESCE(p_priority, 0), COALESCE(p_metadata, '{}'::jsonb), 'pending', now(), now()
  )
  ON CONFLICT (source_type, source_id)
  DO UPDATE SET
    content = EXCLUDED.content,
    client_id = EXCLUDED.client_id,
    user_id = EXCLUDED.user_id,
    priority = GREATEST(public.sentiment_processing_queue.priority, EXCLUDED.priority),
    metadata = public.sentiment_processing_queue.metadata || EXCLUDED.metadata,
    status = CASE WHEN public.sentiment_processing_queue.status IN ('completed','failed') THEN 'pending' ELSE public.sentiment_processing_queue.status END,
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_next_sentiment_queue_item()
RETURNS SETOF public.sentiment_processing_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
BEGIN
  IF (SELECT auth.role()) <> 'service_role' AND NOT (SELECT public.is_admin()) THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH next_item AS (
    SELECT id
    FROM public.sentiment_processing_queue
    WHERE status = 'pending'
    ORDER BY priority DESC, created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  UPDATE public.sentiment_processing_queue q
  SET status = 'processing', updated_at = now()
  FROM next_item
  WHERE q.id = next_item.id
  RETURNING q.*;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_sentiment_stat(
  p_stat_id uuid,
  p_sentiment_field text,
  p_source_field text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
DECLARE
  sql text;
BEGIN
  IF (SELECT auth.role()) <> 'service_role' AND NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  -- incrementa total_analyses + campo de sentimento + campo de origem
  sql := format(
    'UPDATE public.sentiment_daily_stats
     SET total_analyses = total_analyses + 1,
         %I = %I + 1,
         %I = %I + 1,
         updated_at = now()
     WHERE id = $1',
    p_sentiment_field, p_sentiment_field,
    p_source_field, p_source_field
  );
  EXECUTE sql USING p_stat_id;
END;
$$;

-- =========================
-- 4) RLS (admin/service role)
-- =========================

ALTER TABLE public.sentiment_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_automation_config ENABLE ROW LEVEL SECURITY;

-- Admin/service_role: full access
DROP POLICY IF EXISTS sentiment_processing_queue_admin_all ON public.sentiment_processing_queue;
CREATE POLICY sentiment_processing_queue_admin_all
  ON public.sentiment_processing_queue
  FOR ALL
  TO authenticated
  USING ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS sentiment_analyses_admin_all ON public.sentiment_analyses;
CREATE POLICY sentiment_analyses_admin_all
  ON public.sentiment_analyses
  FOR ALL
  TO authenticated
  USING ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS sentiment_alerts_admin_all ON public.sentiment_alerts;
CREATE POLICY sentiment_alerts_admin_all
  ON public.sentiment_alerts
  FOR ALL
  TO authenticated
  USING ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS sentiment_daily_stats_admin_all ON public.sentiment_daily_stats;
CREATE POLICY sentiment_daily_stats_admin_all
  ON public.sentiment_daily_stats
  FOR ALL
  TO authenticated
  USING ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS sentiment_automation_config_admin_all ON public.sentiment_automation_config;
CREATE POLICY sentiment_automation_config_admin_all
  ON public.sentiment_automation_config
  FOR ALL
  TO authenticated
  USING ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()))
  WITH CHECK ((SELECT auth.role()) = 'service_role' OR (SELECT public.is_admin()));



-- ========================================================
-- END: supabase/migrations/20260105000005_create_sentiment_system.sql
-- ========================================================


-- ========================================================
-- BEGIN: supabase/migrations/20260105000006_create_job_openings.sql
-- ========================================================

-- =====================================================
-- Valle 360 - RH: Gestão de Vagas (Job Openings)
-- (sem mock; admin-only)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_openings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  title text NOT NULL,
  department text,
  location text,
  location_type text, -- remote | hybrid | onsite
  contract_type text, -- clt | pj | internship | freelance | etc
  status text NOT NULL DEFAULT 'draft', -- draft | active | paused | closed

  platforms text[] DEFAULT '{}'::text[], -- linkedin, website, etc
  applications_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  published_at timestamptz,

  job_post jsonb NOT NULL DEFAULT '{}'::jsonb, -- dados completos gerados pelo JobPostGenerator
  created_by uuid,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_openings_status ON public.job_openings(status);
CREATE INDEX IF NOT EXISTS idx_job_openings_department ON public.job_openings(department);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_job_openings_updated_at'
  ) THEN
    CREATE TRIGGER trg_job_openings_updated_at
    BEFORE UPDATE ON public.job_openings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;

-- Admin-only (usa função já existente no projeto)
DROP POLICY IF EXISTS "job_openings_select_admin" ON public.job_openings;
CREATE POLICY "job_openings_select_admin"
ON public.job_openings
FOR SELECT
USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "job_openings_insert_admin" ON public.job_openings;
CREATE POLICY "job_openings_insert_admin"
ON public.job_openings
FOR INSERT
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "job_openings_update_admin" ON public.job_openings;
CREATE POLICY "job_openings_update_admin"
ON public.job_openings
FOR UPDATE
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "job_openings_delete_admin" ON public.job_openings;
CREATE POLICY "job_openings_delete_admin"
ON public.job_openings
FOR DELETE
USING ((SELECT public.is_admin()));



-- ========================================================
-- END: supabase/migrations/20260105000006_create_job_openings.sql
-- ========================================================



-- ========================================================
-- EXTRA: Mensagens Diretas (Intranet) — tabelas + RPCs mínimas
-- Motivo: usadas pelo chat interno, cobranças via intranet e visão do Super Admin.
-- ========================================================

-- Tabela: direct_conversations
CREATE TABLE IF NOT EXISTS public.direct_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_client_conversation boolean DEFAULT false,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Compat (se tabela já existia com menos colunas)
ALTER TABLE public.direct_conversations
  ADD COLUMN IF NOT EXISTS is_client_conversation boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_message_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_message_preview text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_direct_conversations_client ON public.direct_conversations(is_client_conversation);
CREATE INDEX IF NOT EXISTS idx_direct_conversations_last_message ON public.direct_conversations(last_message_at DESC);

-- Tabela: direct_conversation_participants
CREATE TABLE IF NOT EXISTS public.direct_conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.direct_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_read_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  muted boolean DEFAULT false,
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.direct_conversation_participants
  ADD COLUMN IF NOT EXISTS last_read_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS unread_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS muted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS joined_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_direct_participants_conversation ON public.direct_conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_participants_user ON public.direct_conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_direct_participants_unread ON public.direct_conversation_participants(user_id, unread_count);

-- Tabela: direct_messages
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.direct_conversations(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  body text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'video', 'audio')),
  attachments jsonb DEFAULT '[]',
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.direct_messages
  ADD COLUMN IF NOT EXISTS from_user_id uuid,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS message_type text,
  ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON public.direct_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created ON public.direct_messages(created_at DESC);

-- Tabela: message_read_receipts
CREATE TABLE IF NOT EXISTS public.message_read_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('direct', 'group')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, message_type)
);

CREATE INDEX IF NOT EXISTS idx_read_receipts_message ON public.message_read_receipts(message_id, message_type);
CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON public.message_read_receipts(user_id);

-- RLS
ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Policies (participantes + admin)
DROP POLICY IF EXISTS direct_conversations_select_participants_or_admin ON public.direct_conversations;
CREATE POLICY direct_conversations_select_participants_or_admin
  ON public.direct_conversations FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin()) OR
    EXISTS (
      SELECT 1 FROM public.direct_conversation_participants p
      WHERE p.conversation_id = direct_conversations.id
        AND p.user_id = auth.uid()
        AND p.is_active = true
    )
  );

DROP POLICY IF EXISTS direct_conversations_insert_authenticated ON public.direct_conversations;
CREATE POLICY direct_conversations_insert_authenticated
  ON public.direct_conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS direct_conversations_update_participants_or_admin ON public.direct_conversations;
CREATE POLICY direct_conversations_update_participants_or_admin
  ON public.direct_conversations FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_admin()) OR
    EXISTS (
      SELECT 1 FROM public.direct_conversation_participants p
      WHERE p.conversation_id = direct_conversations.id
        AND p.user_id = auth.uid()
        AND p.is_active = true
    )
  );

DROP POLICY IF EXISTS direct_participants_select_participants_or_admin ON public.direct_conversation_participants;
CREATE POLICY direct_participants_select_participants_or_admin
  ON public.direct_conversation_participants FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin()) OR
    EXISTS (
      SELECT 1 FROM public.direct_conversation_participants p
      WHERE p.conversation_id = direct_conversation_participants.conversation_id
        AND p.user_id = auth.uid()
        AND p.is_active = true
    )
  );

DROP POLICY IF EXISTS direct_participants_insert_authenticated ON public.direct_conversation_participants;
CREATE POLICY direct_participants_insert_authenticated
  ON public.direct_conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS direct_participants_update_self_or_admin ON public.direct_conversation_participants;
CREATE POLICY direct_participants_update_self_or_admin
  ON public.direct_conversation_participants FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()) OR user_id = auth.uid())
  WITH CHECK ((SELECT public.is_admin()) OR user_id = auth.uid());

DROP POLICY IF EXISTS direct_messages_select_participants_or_admin ON public.direct_messages;
CREATE POLICY direct_messages_select_participants_or_admin
  ON public.direct_messages FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin()) OR
    EXISTS (
      SELECT 1 FROM public.direct_conversation_participants p
      WHERE p.conversation_id = direct_messages.conversation_id
        AND p.user_id = auth.uid()
        AND p.is_active = true
    )
  );

DROP POLICY IF EXISTS direct_messages_insert_participants ON public.direct_messages;
CREATE POLICY direct_messages_insert_participants
  ON public.direct_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id AND
    EXISTS (
      SELECT 1 FROM public.direct_conversation_participants p
      WHERE p.conversation_id = direct_messages.conversation_id
        AND p.user_id = auth.uid()
        AND p.is_active = true
    )
  );

DROP POLICY IF EXISTS message_read_receipts_select_self_or_admin ON public.message_read_receipts;
CREATE POLICY message_read_receipts_select_self_or_admin
  ON public.message_read_receipts FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()) OR user_id = auth.uid());

DROP POLICY IF EXISTS message_read_receipts_insert_self_or_admin ON public.message_read_receipts;
CREATE POLICY message_read_receipts_insert_self_or_admin
  ON public.message_read_receipts FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()) OR user_id = auth.uid());

-- RPC: get_or_create_direct_conversation (compatível com user_profiles.user_id)
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(
  p_user_id_1 uuid,
  p_user_id_2 uuid,
  p_is_client_conversation boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_user_kind text;
  v_is_client boolean := false;
BEGIN
  -- Permite chamadas do próprio usuário OU service_role (server/admin)
  IF auth.role() <> 'service_role' AND auth.uid() IS DISTINCT FROM p_user_id_1 THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  -- Verifica se já existe conversa entre os dois usuários
  SELECT dcp1.conversation_id INTO v_conversation_id
  FROM public.direct_conversation_participants dcp1
  INNER JOIN public.direct_conversation_participants dcp2
    ON dcp1.conversation_id = dcp2.conversation_id
  WHERE dcp1.user_id = p_user_id_1
    AND dcp2.user_id = p_user_id_2
    AND dcp1.is_active = true
    AND dcp2.is_active = true
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Determinar se o usuário 2 é cliente (schema novo: user_profiles.user_id)
  SELECT COALESCE(NULLIF(lower(role::text), ''), lower(user_type::text))
    INTO v_user_kind
  FROM public.user_profiles
  WHERE user_id = p_user_id_2
  LIMIT 1;

  v_is_client := (v_user_kind = 'client');

  INSERT INTO public.direct_conversations (is_client_conversation)
  VALUES (v_is_client OR p_is_client_conversation)
  RETURNING id INTO v_conversation_id;

  INSERT INTO public.direct_conversation_participants (conversation_id, user_id, is_active)
  VALUES
    (v_conversation_id, p_user_id_1, true),
    (v_conversation_id, p_user_id_2, true)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  RETURN v_conversation_id;
END;
$$;

-- Trigger: atualizar última mensagem (preview)
CREATE OR REPLACE FUNCTION public.update_direct_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.direct_conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = CASE
      WHEN NEW.message_type = 'text' THEN LEFT(NEW.body, 100)
      WHEN NEW.message_type = 'image' THEN 'Imagem'
      WHEN NEW.message_type = 'video' THEN 'Vídeo'
      WHEN NEW.message_type = 'audio' THEN 'Áudio'
      WHEN NEW.message_type = 'file' THEN 'Arquivo'
      ELSE 'Mensagem'
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_direct_last_message ON public.direct_messages;
CREATE TRIGGER update_direct_last_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_direct_conversation_last_message();

-- Trigger: incrementar unread_count
CREATE OR REPLACE FUNCTION public.update_direct_unread_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.direct_conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id <> NEW.from_user_id
    AND is_active = true;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS increment_direct_unread_count ON public.direct_messages;
CREATE TRIGGER increment_direct_unread_count
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_direct_unread_count();

-- RPC: marcar como lidas
CREATE OR REPLACE FUNCTION public.mark_direct_messages_as_read(
  p_conversation_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permite o próprio usuário OU service_role (server/admin)
  IF auth.role() <> 'service_role' AND auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  UPDATE public.direct_conversation_participants
  SET
    unread_count = 0,
    last_read_at = now()
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;

  INSERT INTO public.message_read_receipts (message_id, message_type, user_id, read_at)
  SELECT
    dm.id,
    'direct',
    p_user_id,
    now()
  FROM public.direct_messages dm
  WHERE dm.conversation_id = p_conversation_id
    AND dm.from_user_id <> p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.message_read_receipts mrr
      WHERE mrr.message_id = dm.id
        AND mrr.message_type = 'direct'
        AND mrr.user_id = p_user_id
    )
  ON CONFLICT (message_id, user_id, message_type) DO NOTHING;
END;
$$;



-- ========================================================
-- EXTRA: employee_client_assignments — atribuição Colaborador ↔ Cliente
-- Motivo: usado por /colaborador/clientes e /colaborador/aprovacoes.
-- ========================================================

CREATE TABLE IF NOT EXISTS public.employee_client_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  role text,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  removed_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(employee_id, client_id)
);

ALTER TABLE public.employee_client_assignments
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS removed_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_employee_assignments_employee ON public.employee_client_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_assignments_client ON public.employee_client_assignments(client_id);

ALTER TABLE public.employee_client_assignments ENABLE ROW LEVEL SECURITY;

-- Admin-only (o app usa service_role no server para leitura; gestão é do admin)
DROP POLICY IF EXISTS employee_client_assignments_select_admin ON public.employee_client_assignments;
CREATE POLICY employee_client_assignments_select_admin
  ON public.employee_client_assignments
  FOR SELECT
  USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS employee_client_assignments_insert_admin ON public.employee_client_assignments;
CREATE POLICY employee_client_assignments_insert_admin
  ON public.employee_client_assignments
  FOR INSERT
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS employee_client_assignments_update_admin ON public.employee_client_assignments;
CREATE POLICY employee_client_assignments_update_admin
  ON public.employee_client_assignments
  FOR UPDATE
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS employee_client_assignments_delete_admin ON public.employee_client_assignments;
CREATE POLICY employee_client_assignments_delete_admin
  ON public.employee_client_assignments
  FOR DELETE
  USING ((SELECT public.is_admin()));
