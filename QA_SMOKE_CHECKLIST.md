## QA / Smoke Checklist (Valle 360)

Este checklist é a evidência prática para declarar o ambiente **“pronto”** após as migrações e padronizações.

### Pré-requisitos
- **Ambiente**: produção (Vercel) com variáveis/integrações configuradas.
- **Conta**: 1 usuário **super_admin**, 1 usuário **colaborador**, 1 usuário **cliente**.

### Gate: Prontidão (obrigatório)
- Acessar `/admin/prontidao`
  - **Esperado**: `overall = pass` (ou no máximo `warn` apenas em itens não-críticos).
  - **Validar**:
    - **schema**: `pass` (tabelas críticas existem)
    - **ai**: `pass` (OpenRouter ou OpenAI configurado)
    - **cpanel**: `pass` (CPANEL_USER/CPANEL_PASSWORD/CPANEL_DOMAIN) ou `warn` (se você optou por best-effort)
    - **cron**: `warn/pass` (após 24h deve virar `pass`)

### SuperAdmin: Criar colaborador + mailbox + boas-vindas (cPanel + SendGrid)
- Ir em `/admin/colaboradores/novo`
  - Preencher dados do colaborador e concluir.
  - **Esperado**:
    - Usuário/colaborador criado
    - Endpoint `/api/cpanel/create-email` retorna `success=true` quando credenciais cPanel estão corretas
    - E-mail transacional de boas-vindas enviado via SendGrid (com **login**, **senha**, **link do sistema** e **link do webmail**)
  - **Evidência**:
    - print do toast “criado”
    - log no SendGrid

### Cliente: Solicitação apenas como Stepper (sem Kanban interno)
- Ir em `/cliente/solicitacao`
  - Abrir uma solicitação e avançar etapas.
  - **Esperado**:
    - Cliente **não** vê board/colunas internas
    - A solicitação vira tarefa interna via APIs (sem vazar `board_id/column_id` para o cliente)

### Cliente: Métricas sociais (dados reais)
- Ir em `/cliente/painel/desempenho`
  - **Esperado**:
    - A tela carrega (sem mock)
    - Endpoint `/api/client/social/metrics?days=30` responde com série diária
  - **Evidência**:
    - print do gráfico/tabela

### Menções (@mentions): Kanban + Chats
- Em Kanban: abrir um card, comentar com `@nome`
  - **Esperado**:
    - Menção vira “chip”
    - `/api/mentions/process` cria notificação e tenta e-mail (best-effort)
- Em Mensagens: enviar msg com `@nome`
  - **Esperado**:
    - Chip renderizado
    - Notificação criada

### Crons (Vercel): endpoints GET
- Validar que os cron endpoints aceitam **GET**:
  - `/api/cron/collection`
  - `/api/cron/overdue`
  - `/api/cron/ml`
  - `/api/cron/social-metrics`
  - `/api/cron/social-publish`
- **Esperado**:
  - Execução cria `integration_logs` com `integration_id='cron'` e `action` correspondente

### Feature Flags: Admin
- Ir em `/admin/feature-flags`
  - **Esperado**:
    - Lista de features carrega (RLS ativo e políticas ok)
    - Toggle funciona para super_admin

### Segurança: Advisors (Supabase)
- Rodar o “Security Advisor” no projeto Supabase
  - **Esperado**: **0 findings** (ou somente itens assumidos conscientemente).


