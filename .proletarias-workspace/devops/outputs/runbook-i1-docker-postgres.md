# Runbook I1 — Docker Compose Postgres 16

**Projeto:** Pelada App  
**Objetivo:** Subir Postgres 16 local para rodar testes de integração  
**Status:** Arquivos commitados — requer ação do CEO

---

## Arquivos criados

| Arquivo | Onde fica | O que faz |
|---|---|---|
| `docker-compose.yml` | raiz do repo | Define o container Postgres 16 de testes |
| `vitest.config.integration.ts` | raiz do repo | Config Vitest para testes de integração (environment: node, inclui `*.integration.test.ts`) |
| `.env.test` | raiz do repo | DATABASE_URL local para os testes |
| `package.json` (script atualizado) | raiz do repo | `test:integration` agora roda o Vitest de verdade |

---

## Pré-requisitos

- **Docker Desktop** instalado e rodando ([docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop))
- `docker compose` v2.x+ disponível no terminal (verifique com `docker compose version`)

---

## Como rodar os testes de integração localmente

```bash
# 1. Sobe o container Postgres (aguarda o healthcheck antes de retornar)
docker compose up -d --wait

# 2. Roda os testes de integração
npm run test:integration

# 3. Derruba o container ao terminar
docker compose down
```

Se quiser manter o container rodando entre sessões (mais rápido), omita o `docker compose down`.

---

## Convenção de nomeação dos arquivos de teste

Testes de integração devem seguir o padrão:

```
src/infrastructure/db/__tests__/PlayerRepository.integration.test.ts
src/infrastructure/db/__tests__/PeladaRepository.integration.test.ts
```

O padrão `*.integration.test.ts` é o que o `vitest.config.integration.ts` usa para incluir apenas esses testes.

---

## O que ainda falta (responsabilidade do Dev)

- `pg` (node-postgres) ainda não está instalado — adicionar: `npm install -D pg @types/pg`
- Implementar `PgSqlExecutor` em `src/infrastructure/db/`
- Escrever os testes de integração dos repositórios
- Script de criação de schema para o banco de teste (pode ser inline nos `beforeAll` dos testes ou um arquivo SQL separado)

---

## Variáveis de ambiente

| Variável | Valor local (`.env.test`) | Valor em CI |
|---|---|---|
| `DATABASE_URL` | `postgresql://pelada:pelada_test@localhost:5432/pelada_test` | Definido no workflow `ci.yml` |

O `.env.test` é lido automaticamente pelo Vitest quando o modo é `test`. Não é um arquivo secreto — as credenciais são apenas para o container local descartável.
