# Diagnóstico de sessão — para continuidade

> Este arquivo documenta o que foi feito em sessão de diagnóstico em 2026-06-05.
> Pode ser deletado após o dev estar alinhado.

---

## Contexto

O app estava criado e buildando, mas **nenhuma tabela existia no banco Neon de produção**.
O projeto tem um sistema de migrations próprio (`MigrationRunner`) que até então só era chamado nos testes de integração — nunca na inicialização real do app.

---

## O que foi feito

### 1. Adicionado script `npm run migration:up`

Criados os seguintes arquivos para permitir rodar migrations manualmente via CLI:

- **`scripts/migrate.ts`** — lê `DATABASE_URL` do ambiente, conecta via `PgSqlExecutor` (usa `pg`, já era devDependency) e executa `MigrationRunner.migrate(ALL_MIGRATIONS)`
- **`tsconfig.scripts.json`** — estende `tsconfig.app.json` para resolver os path aliases (`@ports/*`, `@infrastructure/*` etc.) no contexto Node/tsx
- **`package.json`** — adicionado script `"migration:up": "tsx --tsconfig tsconfig.scripts.json scripts/migrate.ts"`
- **`tsx`** adicionado como devDependency (executor TypeScript para Node)

**Como usar:**

```powershell
# PowerShell (Windows)
$env:DATABASE_URL="postgresql://user:password@host/db?sslmode=require"; npm run migration:up
```

```bash
# bash/zsh (Linux/Mac)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require" npm run migration:up
```

---

### 2. Migrations aplicadas manualmente no Neon

O usuário `pelada_app` **não tem permissão de CREATE no schema public** do Neon.
Por isso o script acima falhou com `permission denied for schema public`.

Como solução imediata, o SQL completo foi executado diretamente no **SQL Editor do Neon** (console.neon.tech) com o usuário owner (`neondb_owner`).

O script completo está preservado abaixo para referência:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id         TEXT        PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE player_position AS ENUM ('goalkeeper', 'line');
CREATE TYPE player_speed    AS ENUM ('slow', 'medium', 'fast');
CREATE TYPE slot_type       AS ENUM ('goalkeeper', 'line');
CREATE TYPE player_status   AS ENUM ('active', 'inactive');
CREATE TYPE financial_record_type AS ENUM ('credit', 'debit');

CREATE TABLE profiles (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT        NOT NULL,
  convocation_template  TEXT        NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE players (
  id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT              NOT NULL,
  nickname      TEXT,
  phone         TEXT,
  stars         NUMERIC(2, 1)     NOT NULL DEFAULT 3.0
                                  CHECK (stars >= 0.0 AND stars <= 5.0),
  position      player_position   NOT NULL DEFAULT 'line',
  speed         player_speed      NOT NULL DEFAULT 'medium',
  default_type  slot_type         NOT NULL DEFAULT 'line',
  invited_by_id UUID              REFERENCES players(id) ON DELETE SET NULL,
  status        player_status     NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT now()
);
CREATE INDEX idx_players_profile_id ON players(profile_id);
CREATE INDEX idx_players_status     ON players(profile_id, status);

CREATE TABLE peladas (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date              DATE        NOT NULL,
  time              TIME,
  location          TEXT,
  players_per_team  SMALLINT    NOT NULL CHECK (players_per_team > 0),
  max_goalkeepers   SMALLINT    NOT NULL DEFAULT 1 CHECK (max_goalkeepers >= 0),
  cost_per_player   BIGINT      NOT NULL DEFAULT 0 CHECK (cost_per_player >= 0),
  goalkeeper_pays   BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_peladas_profile_id ON peladas(profile_id);
CREATE INDEX idx_peladas_date       ON peladas(profile_id, date DESC);

CREATE TABLE pelada_teams (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pelada_id   UUID        NOT NULL REFERENCES peladas(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pelada_teams_pelada_id ON pelada_teams(pelada_id);

CREATE TABLE pelada_players (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pelada_id   UUID        NOT NULL REFERENCES peladas(id)  ON DELETE CASCADE,
  player_id   UUID        NOT NULL REFERENCES players(id)  ON DELETE CASCADE,
  slot_type   slot_type   NOT NULL,
  paid        BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pelada_id, player_id)
);
CREATE INDEX idx_pelada_players_pelada_id ON pelada_players(pelada_id);
CREATE INDEX idx_pelada_players_player_id ON pelada_players(player_id);

CREATE TABLE draw_assignments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pelada_id       UUID        NOT NULL REFERENCES peladas(id)       ON DELETE CASCADE,
  pelada_team_id  UUID        NOT NULL REFERENCES pelada_teams(id)  ON DELETE CASCADE,
  player_id       UUID        NOT NULL REFERENCES players(id)       ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pelada_id, player_id)
);
CREATE INDEX idx_draw_assignments_pelada_id ON draw_assignments(pelada_id);

CREATE TABLE financial_records (
  id          UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID                  NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date        DATE                  NOT NULL,
  description TEXT                  NOT NULL,
  value       BIGINT                NOT NULL CHECK (value > 0),
  type        financial_record_type NOT NULL,
  created_at  TIMESTAMPTZ           NOT NULL DEFAULT now()
);
CREATE INDEX idx_financial_records_profile_id ON financial_records(profile_id);
CREATE INDEX idx_financial_records_date       ON financial_records(profile_id, date DESC);

CREATE TABLE subcaixinhas (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  goal           BIGINT      CHECK (goal IS NULL OR goal > 0),
  current_value  BIGINT      NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subcaixinhas_profile_id ON subcaixinhas(profile_id);

INSERT INTO schema_migrations (id) VALUES
  ('0001_create_enums'),
  ('0002_create_profiles'),
  ('0003_create_players'),
  ('0004_create_peladas'),
  ('0005_create_pelada_teams'),
  ('0006_create_pelada_players'),
  ('0007_create_draw_assignments'),
  ('0008_create_financial_records'),
  ('0009_create_subcaixinhas');
```

---

### 3. Correção de breaking change no `@neondatabase/serverless`

**Arquivo alterado:** `src/infrastructure/db/NeonSqlExecutor.ts`

A versão `^1.1.0` do pacote quebrou a API de chamada como função:

| Antes (quebrado) | Depois (correto) |
|---|---|
| `execute(sql, ...params)` | `execute.query(sql, params)` |
| resultado era `T[]` diretamente | resultado continua sendo `T[]` diretamente |

Detalhe importante: `execute.query()` retorna as rows **diretamente como array** (não um objeto `{ rows: [...] }`), pois `FullResults` é `false` por padrão. O `NeonSqlExecutor` já encapsula isso corretamente.

Também foi adicionado `disableWarningInBrowsers: true` na inicialização do `neon()` para suprimir o aviso de segurança do browser, que é esperado nessa arquitetura (app browser-only sem backend).

---

## Sessão de correção de bugs (2026-06-05, parte 2)

Sessão focada em bugs de UX/dados reportados ao usar o app com dados reais.

### Bug 1 — `stars.toFixed is not a function` no cadastro de peladeiros

**Causa raiz:** a coluna `stars` é `NUMERIC(2,1)`, e o driver `pg` retorna `NUMERIC`/`DECIMAL`
como **string** (para preservar precisão). O tipo `PlayerRecord.stars: number` era uma mentira
em runtime, e `stars.toFixed()` quebrava em `PlayersScreen`.

**Correção:** coerção no repositório (que é quem promete `number` no contrato da porta).
- `src/infrastructure/db/repositories/PostgresPlayerRepository.ts` — novo helper `mapRow` que
  faz `stars: Number(record.stars)` e centraliza o `new Date(created_at)` (antes duplicado em 6 lugares).
- `src/infrastructure/db/repositories/PlayerRepository.integration.test.ts` — removidos os
  `Number(result.stars)` das asserções; o teste agora **exige** o tipo `number` em vez de mascarar
  o defeito com coerção no próprio teste.

### Bug 2 — Edição e inativação de peladeiros

- **Faltava botão de editar:** `PlayersScreen` agora usa um único `BottomSheet` para criar e editar.
  Cada card tem botão ✏️ que abre o cadastro pré-preenchido; o submit chama `updatePlayer` ou
  `createPlayer` conforme o caso.
- **Inativar saiu do "check" e foi para o cadastro:** removido o botão de toggle (✅/⭕) do card.
  A ação Inativar/Reativar agora vive dentro do formulário de edição, com **confirmação** antes de
  inativar (passo "Inativar Fulano? … Cancelar / Confirmar"), seguindo o Padrão de Confirmação da spec.
  Reativar continua imediato (não é destrutivo). Card mostra apenas um badge "Inativo".

### Bug 3 — Adicionar/remover jogador no roster da pelada

`src/ui/screens/PeladaScreen/PeladaScreen.tsx`: o accordion Roster ganhou botão
"+ Adicionar jogador" que abre um `BottomSheet` listando os peladeiros ativos ainda fora do roster
(adiciona usando o `default_type` do jogador). Cada item do roster ganhou ✕ para remover.
Passou a usar o `profileId` que já era recebido por prop mas estava sem uso.

### Bug 4 — Sorteio de times: `No teams defined for this pelada`

**Causa raiz (estrutural, alinhada à spec):** a pelada precisa dos **nomes dos times** (um por linha),
e é isso que determina a quantidade de times. O formulário só capturava "jogadores por time" e
**nunca criava os times**, então `DrawTeamsUseCase` lançava `No teams defined for this pelada`.

**Correção:**
- `src/application/use-cases/pelada/CreatePeladaUseCase.ts` — recebe `teamNames: string[]`, valida
  mínimo de 2, normaliza (trim + descarta linhas vazias) e persiste os times com `sort_order`.
- `src/application/use-cases/pelada/ClonePeladaUseCase.ts` — copia os nomes dos times para a pelada
  clonada (campo clonável conforme spec).
- `src/composition-root.ts` — injeta `peladaTeamRepo` em `createPelada` e `clonePelada`.
- `src/ui/screens/PeladasScreen/PeladasScreen.tsx` — novo campo `Textarea` "Nomes dos times
  (um por linha)" (default `Time A / Time B`); o submit faz split por linha e passa o array.

### Verificação

- `tsc --noEmit` limpo.
- Suíte: 368 passando; as **3 falhas restantes são todas em `NeonSqlExecutor.test.ts`** e já falhavam
  na árvore limpa (confirmado via `git stash`) — exatamente o pendente nº 2 abaixo.

### Ponto de atenção (resolvido na parte 4)

`AddToRosterUseCase` limitava a capacidade de linha por `players_per_team`, mas a spec define a
capacidade total como **nº de times × jogadores por time**. Corrigido — ver parte 4.

---

## Sessão de mensagens + posição (2026-06-05, parte 3)

### Mensagens (spec módulo 8)

A lógica de domínio já existia em `src/domain/services/MessageBuilders.ts` (testada), mas **nunca
tinha sido plugada na UI**. Foi isso que se fez.

- Novo componente reutilizável `src/ui/components/MessageCard.tsx` (+ CSS + teste): título, texto
  pronto para WhatsApp e botão **📋 Copiar** com confirmação "✓ Copiado"; mostra dica quando vazio.
- Novo accordion **Mensagens 💬** em `src/ui/screens/PeladaScreen/PeladaScreen.tsx` com:
  - **Convocação** (8.1) — usa `profiles.convocation_template` (editável no ConfigScreen) com os
    placeholders `{{data}}`/`{{hora}}`/`{{local}}`/`{{custo}}` preenchidos pela pelada. PeladaScreen
    passou a carregar o perfil (`getProfile`).
  - **Times Sorteados** (8.2) — times na ordem do sorteio, 🧤/⚽ por slot do roster.
  - **Checklist de Pagamentos** (8.3) — alfabético, ✅/❌; goleiros só quando `goalkeeper_pays`.

### Refactor do campo de posição (CRÍTICO — exige migração no banco)

**Problema:** existiam **dois campos binários redundantes** no peladeiro — `position` (goalkeeper/line)
e `default_type` (goalkeeper/line) — e o "Posicionamento (Defesa/Meio/Ataque)" da spec **nunca foi
implementado**. Decisão (do usuário): fundir tudo num **único campo `position` = goleiro | defesa |
meio | ataque**, onde `goalkeeper` define o comportamento de goleiro (slot + sorteio) e os demais
alimentam o balanceamento posicional do sorteio.

**Mudanças de código:**
- `src/domain/value-objects/types.ts` — `Position` agora tem 4 valores; novo helper
  `positionToSlotType()` (goleiro → slot goleiro, resto → slot linha).
- `src/ports/repositories/PlayerRepository.ts` — tipo `PlayerPosition`; **removido `default_type`** de
  `PlayerRecord`/`CreatePlayerInput`/`UpdatePlayerInput`.
- `src/infrastructure/db/repositories/PostgresPlayerRepository.ts` e os fakes — `default_type` fora
  do INSERT/SELECT/UPDATE.
- `src/ui/screens/PlayersScreen/PlayersScreen.tsx` — os **dois selects viraram um único** (🧤 Goleiro /
  🛡️ Defesa / 🎯 Meio / ⚔️ Ataque); rótulo em português no card.
- `src/ui/screens/PeladaScreen/PeladaScreen.tsx` — slot do roster agora **derivado da posição** via
  `positionToSlotType()`.
- `src/domain/services/TeamDrawService.ts` — a posição agora é **desempate real na alocação** (spec
  critério #2): entre times empatados em estrelas, o jogador vai ao time com menos jogadores da mesma
  posição. Goleiro continua tratado pelo slot do roster (1 por time quando nº goleiros = nº times).

**Migração necessária — `0010_player_position_field` (AINDA NÃO APLICADA no Neon):**

Sintoma se não aplicada: `invalid input value for enum player_position: "defense"` ao salvar peladeiro.
Como o `pelada_app` não tem DDL, rodar no **SQL Editor do Neon** com o owner:

```sql
BEGIN;
ALTER TABLE players ALTER COLUMN position DROP DEFAULT;
ALTER TYPE player_position RENAME TO player_position_old;
CREATE TYPE player_position AS ENUM ('goalkeeper', 'defense', 'midfield', 'attack');
ALTER TABLE players
  ALTER COLUMN position TYPE player_position
  USING (CASE WHEN position::text = 'goalkeeper' THEN 'goalkeeper' ELSE 'midfield' END)::player_position;
ALTER TABLE players ALTER COLUMN position SET DEFAULT 'midfield';
DROP TYPE player_position_old;
ALTER TABLE players DROP COLUMN default_type;
INSERT INTO schema_migrations (id) VALUES ('0010_player_position_field');
COMMIT;
```

(Players `line` existentes viram `midfield`; goleiros mantêm. `default_type` é dropado.)

### Verificação

- `tsc -b` limpo (exceto o erro pré-existente de `NeonSqlExecutor.ts`, pendente nº 2 abaixo).
- Suíte: 372 passando; as mesmas 3 falhas pré-existentes em `NeonSqlExecutor.test.ts`.

---

## Sessão de capacidade do roster (2026-06-05, parte 4)

**Bug:** numa pelada com 3 times e 5 jogadores por time, a edição do roster limitava a 5 jogadores
de linha (+ goleiros por `max_goalkeepers`), quando deveria permitir **15 de linha (5 × 3 times)**.

**Causa:** `AddToRosterUseCase` usava `players_per_team` direto como capacidade de linha, ignorando o
número de times.

**Correção:** `src/application/use-cases/roster/AddToRosterUseCase.ts` agora injeta o
`PeladaTeamRepository` e calcula `lineCapacity = players_per_team × nº de times`. A capacidade de
goleiros (`max_goalkeepers`) permanece. `src/composition-root.ts` passa o `peladaTeamRepo`.
Teste de regressão cobrindo 15 vagas de linha com 3 times.

---

## Pendências / pontos de atenção

- **Permissão do `pelada_app` no Neon:** o usuário de produção não pode criar tabelas. O `npm run migration:up` só vai funcionar com uma connection string de um usuário com permissão de DDL (ex: `neondb_owner`). Para novas migrations, rodar manualmente no SQL Editor do Neon ou resolver a permissão com `GRANT CREATE ON SCHEMA public TO pelada_app`.

- **Teste unitário do `NeonSqlExecutor`** (`src/infrastructure/db/NeonSqlExecutor.test.ts`): provavelmente está mockando a chamada no estilo antigo e vai quebrar. Precisa ser atualizado para refletir a nova API (`.query()` em vez de chamada direta).

- **`npm run migration:up` no Windows usa PowerShell** — a sintaxe de env var inline é diferente do bash. Ver exemplo acima.
