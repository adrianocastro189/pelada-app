# Runbook I2 — Pipeline CI/CD + GitHub Pages

**Projeto:** Pelada App  
**Objetivo:** CI automático em PRs + deploy automático em GitHub Pages no merge para `main`  
**Status:** Workflows commitados — requer ativação manual no GitHub

---

## Arquivos criados

| Arquivo | O que faz |
|---|---|
| `.github/workflows/ci.yml` | Roda lint + unit tests + integration tests em todo push (exceto `main`) e em PRs para `main` |
| `.github/workflows/cd.yml` | Build + deploy para GitHub Pages a cada push em `main` |
| `vite.config.ts` (atualizado) | Adicionado `base: process.env.VITE_BASE ?? '/'` + `start_url: '.'` no PWA manifest |

---

## Passo 1 — Ativar GitHub Pages no repositório

1. Acesse o repositório no GitHub
2. Vá em **Settings** → **Pages**
3. Em **Source**, selecione **GitHub Actions** (não `Deploy from a branch`)
4. Salve

> Isso é necessário para que o workflow `cd.yml` consiga fazer o deploy via `actions/deploy-pages`.

---

## Passo 2 — Commitar e fazer push dos arquivos

Faça o commit de todos os arquivos novos/modificados e push para `main`:

```bash
git add docker-compose.yml vitest.config.integration.ts .env.test \
        package.json vite.config.ts \
        .github/workflows/ci.yml .github/workflows/cd.yml
git commit -m "chore: add Docker Postgres, integration test config, CI/CD workflows"
git push origin main
```

O push para `main` vai disparar o workflow `cd.yml` e o primeiro deploy acontece automaticamente.

---

## Passo 3 — Verificar o deploy

Após o push:

1. Vá em **Actions** no repositório e acompanhe o workflow **"Deploy to GitHub Pages"**
2. Quando concluído, acesse: `https://<seu-usuario>.github.io/pelada-app/`

O URL exato é exibido no painel do workflow (output do step `deployment`).

---

## O que cada workflow faz

### `ci.yml` — Integração Contínua

**Gatilho:** push em qualquer branch exceto `main`, e pull requests para `main`

```
checkout → setup Node 22 → npm ci → lint → unit tests → integration tests
                                                           ↑
                                         Postgres 16 roda como service do Actions
```

Os testes de integração recebem `DATABASE_URL` via variável de ambiente do workflow — não precisam de Docker local.

### `cd.yml` — Deploy Contínuo

**Gatilho:** push em `main` (ou seja: merge de PR)

```
checkout → setup Node 22 → npm ci → build (VITE_BASE=/pelada-app/) → upload artifact → deploy pages
```

A variável `VITE_BASE` é definida automaticamente a partir do nome do repositório (`github.event.repository.name`). Nenhum secret precisa ser criado manualmente.

---

## Secrets necessários

**Nenhum.** O deploy para GitHub Pages funciona com o `GITHUB_TOKEN` nativo — sem PAT, sem chave SSH.

---

## Branch protection recomendada (opcional)

Para garantir que `main` nunca receba código que quebra os testes:

1. **Settings** → **Branches** → **Add branch protection rule**
2. Branch: `main`
3. Marcar: **Require status checks to pass before merging**
4. Adicionar o check: `ci` (o job do `ci.yml`)
5. Marcar: **Require branches to be up to date before merging**

---

## Notas sobre o PWA e base path

O `vite.config.ts` foi atualizado com:

```ts
base: process.env.VITE_BASE ?? '/'
```

- **Localmente** (`npm run dev`): `VITE_BASE` não está definida, então `base = '/'` — funciona normalmente.
- **Em produção** (GitHub Pages): `VITE_BASE = /pelada-app/` — o Vite e o `vite-plugin-pwa` ajustam todos os assets e o manifest automaticamente.

O `start_url` do manifest foi alterado de `'/'` para `'.'` (relativo), o que garante que o PWA instale corretamente independente do base path.
