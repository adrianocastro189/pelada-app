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

## Pendências / pontos de atenção

- **Permissão do `pelada_app` no Neon:** o usuário de produção não pode criar tabelas. O `npm run migration:up` só vai funcionar com uma connection string de um usuário com permissão de DDL (ex: `neondb_owner`). Para novas migrations, rodar manualmente no SQL Editor do Neon ou resolver a permissão com `GRANT CREATE ON SCHEMA public TO pelada_app`.

- **Teste unitário do `NeonSqlExecutor`** (`src/infrastructure/db/NeonSqlExecutor.test.ts`): provavelmente está mockando a chamada no estilo antigo e vai quebrar. Precisa ser atualizado para refletir a nova API (`.query()` em vez de chamada direta).

- **`npm run migration:up` no Windows usa PowerShell** — a sintaxe de env var inline é diferente do bash. Ver exemplo acima.
