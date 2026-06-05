/** Data substituted into a convocation template. */
export interface ConvocationData {
  data: string   // pre-formatted date string shown to the player
  hora: string   // pre-formatted time string
  local: string  // location name
  custo: string  // pre-formatted cost string (e.g. "R$ 30,00")
}

/** A team entry used when building the drawn-teams message. */
export interface TeamForMessage {
  name: string
  players: Array<{ name: string; slotType: 'goalkeeper' | 'line' }>
}

/** A roster player entry used when building the payment checklist. */
export interface RosterPlayerForChecklist {
  name: string
  paid: boolean
}

/** A single financial entry used when building the cash-box communication message. */
export interface CashBoxEntry {
  description: string
  value: number  // integer cents (always positive)
  type: 'credit' | 'debit'
}

/** Input for the cash-box communication message. */
export interface CashBoxCommunicationData {
  previousBalance: number  // integer cents
  entries: CashBoxEntry[]
  currentBalance: number   // integer cents
}

// ─── Builders ────────────────────────────────────────────────────────────────

/**
 * Substitutes {{data}}, {{hora}}, {{local}} and {{custo}} placeholders in the template.
 * The same placeholder may appear more than once; all occurrences are replaced.
 *
 * @param template Convocation template stored in profiles.convocation_template.
 * @param data     Values to substitute.
 */
export function buildConvocationMessage(template: string, data: ConvocationData): string {
  return template
    .replace(/\{\{data\}\}/g, data.data)
    .replace(/\{\{hora\}\}/g, data.hora)
    .replace(/\{\{local\}\}/g, data.local)
    .replace(/\{\{custo\}\}/g, data.custo)
}

/**
 * Builds the drawn-teams message.
 * Each team is shown with its name in bold and players prefixed with 🧤 (goalkeeper)
 * or ⚽ (line). No internal stats are shown per-team.
 * Teams are separated by a blank line.
 *
 * @param teams Ordered list of teams with their player rosters.
 */
export function buildDrawnTeamsMessage(teams: TeamForMessage[]): string {
  return teams
    .map(team => {
      const playerLines = team.players
        .map(p => `${p.slotType === 'goalkeeper' ? '🧤' : '⚽'} ${p.name}`)
        .join('\n')
      return `*${team.name}*${playerLines.length > 0 ? '\n' + playerLines : ''}`
    })
    .join('\n\n')
}

/**
 * Builds the payment checklist message.
 * Players are sorted alphabetically by name. Paid players are marked ✅, unpaid ❌.
 * Does not mutate the input array.
 *
 * @param players Roster players with their payment status.
 */
export function buildPaymentChecklistMessage(players: RosterPlayerForChecklist[]): string {
  if (players.length === 0) return ''
  return [...players]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(p => `${p.paid ? '✅' : '❌'} ${p.name}`)
    .join('\n')
}

/**
 * Builds the cash-box communication message.
 * Shows previous balance, each entry with its sign and BRL amount, and current balance.
 * All monetary values are formatted as "R$ X,XX".
 *
 * @param data Cash-box data including previous balance, entries, and current balance.
 */
export function buildCashBoxMessage(data: CashBoxCommunicationData): string {
  const lines: string[] = [
    '*Comunicação da Caixinha*',
    '',
    `Saldo anterior: ${formatBRL(data.previousBalance)}`,
  ]

  for (const entry of data.entries) {
    const sign = entry.type === 'credit' ? '+' : '-'
    lines.push(`${sign} ${entry.description}: ${formatBRL(entry.value)}`)
  }

  lines.push('')
  lines.push(`Saldo atual: ${formatBRL(data.currentBalance)}`)

  return lines.join('\n')
}

/** Formats an integer cent amount as "R$ X,XX". */
function formatBRL(cents: number): string {
  return `R$ ${(Math.abs(cents) / 100).toFixed(2).replace('.', ',')}`
}
