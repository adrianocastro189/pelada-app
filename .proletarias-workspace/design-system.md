# Design System & Wireframes — Pelada App

**Autor:** Web Designer  
**Data:** 2026-06-04  
**Status:** Pronto para implementação

---

## 1. Direção Estética

### Conceito: "Gramado"

O Pelada App existe num sábado de manhã: sol, grama molhada, galera animada. Não é um sistema empresarial — é uma ferramenta entre amigos.

**Palavras-chave:** campestre · solar · descontraído · vigoroso · tátil

**Paleta visual:** Placares de quadra (números grandes, alto contraste) · Energia de camisa de time (cores sólidas, identidade forte) · Apps de esporte casual — não apps de academia premium.

**Emojis:** Usados pontualmente em cabeçalhos, empty states e microcopy. Nunca substituem palavras — complementam o tom.

**Imagens:** Todas em SVG, geradas dinamicamente em código. Nenhuma imagem rasterizada.

---

## 2. Design System

### 2.1 Paleta de Cores

```css
/* Primária — Verde Grama */
--color-primary-900: #0F3D22;
--color-primary-700: #1B6B3A;   /* cor principal: top bar, botões primários, ícones ativos */
--color-primary-500: #2E9E58;   /* hover states */
--color-primary-300: #6FCF97;   /* acentos claros */
--color-primary-100: #D4EFDF;   /* backgrounds suaves */

/* Acento — Solar */
--color-accent-500:  #FFB800;   /* amarelo solar: FAB, botão sortear, badges de destaque */
--color-accent-300:  #FFD966;
--color-accent-100:  #FFF8DC;

/* Semânticas */
--color-success:     #22C55E;   /* crédito, pago, balanceado */
--color-danger:      #EF4444;   /* débito, não pago, apagar, delta negativo */
--color-warning:     #F59E0B;   /* delta positivo pendente */
--color-info:        #3B82F6;

/* Neutros */
--color-neutral-800: #1F2937;   /* texto principal */
--color-neutral-600: #4B5563;   /* texto secundário */
--color-neutral-400: #9CA3AF;   /* placeholder, label desabilitada */
--color-neutral-200: #E5E7EB;   /* bordas, divisores */
--color-neutral-100: #F3F4F6;   /* background de input */
--color-neutral-50:  #F9FAFB;

/* Superfície */
--color-surface:     #FFFFFF;   /* cards, modais, bottom sheets */
--color-background:  #F5F6F0;   /* fundo geral */
```

**Regra de ouro:** `primary-700` domina a interface. `accent-500` aparece em momentos de ação (sortear, FAB). Créditos sempre em `success`; débitos sempre em `danger`.

### 2.2 Tipografia

Duas famílias do Google Fonts — sem fallback genérico.

| Família | Uso | Caracter |
|---|---|---|
| **Fredoka** | Títulos, display, headings | Redonda, bold, irreverente |
| **Nunito** | UI, body, labels, inputs | Redonda, altamente legível |

```css
--text-display:    32px / 700 / Fredoka / line-height 1.2;
--text-h1:         24px / 700 / Fredoka / line-height 1.3;
--text-h2:         18px / 700 / Fredoka / line-height 1.4;
--text-h3:         16px / 600 / Nunito  / line-height 1.4;
--text-body:       15px / 400 / Nunito  / line-height 1.6;
--text-body-bold:  15px / 700 / Nunito;
--text-label:      13px / 600 / Nunito  / line-height 1.4;
--text-caption:    12px / 400 / Nunito  / color: neutral-600;
--text-mono:       20px / 700 / Nunito  / letter-spacing: -0.02em;
```

### 2.3 Espaçamento

Escala de 4px base:

```css
--space-1:   4px
--space-2:   8px
--space-3:  12px
--space-4:  16px   /* padding interno de card, padding horizontal de página */
--space-5:  20px
--space-6:  24px   /* padding vertical de seção */
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

### 2.4 Bordas, Sombras e Raios

```css
/* Raios */
--radius-sm:   8px    /* chips, badges */
--radius-md:  12px    /* botões, inputs */
--radius-lg:  16px    /* cards */
--radius-xl:  24px    /* bottom sheets */
--radius-full: 9999px /* pills, FAB */

/* Sombras */
--shadow-sm:  0 1px  3px rgba(0,0,0,0.08);
--shadow-md:  0 4px 12px rgba(0,0,0,0.12);
--shadow-lg:  0 8px 24px rgba(0,0,0,0.16);
--shadow-fab: 0 4px 16px rgba(27,107,58,0.40);
```

### 2.5 Breakpoints e Grid

Mobile-first. Desenhado para 375–430px.

```css
--bp-sm:   480px
--bp-md:   768px
--bp-lg:  1024px

max-width: 480px;
margin: 0 auto;
```

Layout: coluna única. Padding horizontal: `--space-4` (16px).

### 2.6 Regras de Scroll

⚠️ Invioláveis:

1. **Zero scroll horizontal na página** — sem exceção.
2. **Campos de mensagem copiável**: `overflow-x: auto` no `<textarea>`, nunca no container pai.
3. **Chips de filtro**: se longo, `overflow-x: auto` no container, **não** na página.

---

## 3. Componentes Base (T6.1)

### Button
- Variants: `primary` | `secondary` | `ghost` | `accent` | `destructive`
- Props: `variant`, `fullWidth`, `disabled`, classes HTML nativas
- Testes: cada variant, fullWidth, disabled, onClick

### Card
- Container genérico com sombra
- Props: `children`, `className`, `onClick`
- Testes: renderiza children, clica

### Input
- Com label + campo de erro
- Props: `label`, `error`, HTML input attributes
- Testes: renderiza label, exibe erro, propaga props

### Textarea
- Com label + campo de erro
- Props: `label`, `error`, HTML textarea attributes
- Testes: análogo a Input

### Accordion
- Expandível/colapsível
- Props: `title`, `icon`, `badge`, `badgeVariant`, `defaultOpen`, `children`
- Animação: chevron rotaciona, conteúdo slide-down
- Testes: fecha/abre, `defaultOpen={true}`, chevron

### Chip
- Pequeno botão/tag
- Props: `label`, `active`, `onClick`
- Testes: estilos ativo/inativo, onClick

### Badge
- Pequena label de status
- Props: `label`, `variant` (default|critical|success|danger)
- Testes: cada variant

### FAB (Floating Action Button)
- Botão redondo flutuante
- Props: `onClick`, `label` (aria-label), `icon` (padrão: '+')
- Testes: renderiza, clica, aria-label

### BottomNav
- 4 tabs: ⚽ Peladas · 👥 Peladeiros · 💰 Caixinha · ⚙️ Config
- Props: `active: 'peladas' | 'players' | 'financial' | 'config'`, `onNavigate`
- Testes: 4 tabs, ativo tem cor primary-700, navega

### BottomSheet
- Modal que sobe do fundo
- Props: `open`, `onClose`, `title`, `children`
- Animação: slideUp
- Testes: não renderiza se `open={false}`, renderiza se `open={true}`, fecha ao overlay click, fecha ao Escape

---

## 4. Estrutura de Arquivos

```
src/ui/styles/
├── tokens.css      # Variáveis CSS globais
├── global.css      # Reset + base + safe-area
└── animations.css  # Keyframes (slideUp, etc)

src/ui/components/
├── Button.tsx
├── Card.tsx
├── Input.tsx
├── Textarea.tsx
├── Accordion.tsx
├── Chip.tsx
├── Badge.tsx
├── FAB.tsx
├── BottomNav.tsx
├── BottomSheet.tsx
└── index.ts        # Re-exports
```

---

## 5. Critérios de Aceitação T6.1

- [ ] `tokens.css` com todas as variáveis (nenhuma ausente)
- [ ] `global.css` importado em `main.tsx`
- [ ] 10 componentes implementados
- [ ] Todos os testes RTL passando
- [ ] `npm run build` passa sem erros TypeScript
- [ ] Zero hardcode de valores (todas variáveis CSS)
