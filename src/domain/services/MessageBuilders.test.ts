import { describe, expect, it } from 'vitest'
import {
  buildCashBoxMessage,
  buildConvocationMessage,
  buildDrawnTeamsMessage,
  buildPaymentChecklistMessage,
} from './MessageBuilders'
import type { CashBoxCommunicationData, TeamForMessage } from './MessageBuilders'

// ─── Convocation ─────────────────────────────────────────────────────────────

describe('buildConvocationMessage', () => {
  it('substitutes all four placeholders', () => {
    const result = buildConvocationMessage(
      'Pelada {{data}} às {{hora}} no {{local}}. Custo: {{custo}}.',
      { data: '10/06/2026', hora: '19:00', local: 'Campo do Zé', custo: 'R$ 30,00' },
    )
    expect(result).toBe('Pelada 10/06/2026 às 19:00 no Campo do Zé. Custo: R$ 30,00.')
  })

  it('leaves the template unchanged when there are no placeholders', () => {
    expect(
      buildConvocationMessage('Pelada confirmada!', { data: '', hora: '', local: '', custo: '' }),
    ).toBe('Pelada confirmada!')
  })

  it('substitutes the same placeholder appearing multiple times', () => {
    const result = buildConvocationMessage('{{data}} e outra vez {{data}}', {
      data: '10/06',
      hora: '',
      local: '',
      custo: '',
    })
    expect(result).toBe('10/06 e outra vez 10/06')
  })

  it('handles an empty template', () => {
    expect(buildConvocationMessage('', { data: 'x', hora: 'y', local: 'z', custo: 'w' })).toBe('')
  })
})

// ─── Drawn teams ─────────────────────────────────────────────────────────────

describe('buildDrawnTeamsMessage', () => {
  const teams: TeamForMessage[] = [
    {
      name: 'Time A',
      players: [
        { name: 'João', slotType: 'goalkeeper' },
        { name: 'Pedro', slotType: 'line' },
        { name: 'Carlos', slotType: 'line' },
      ],
    },
    {
      name: 'Time B',
      players: [
        { name: 'Marcos', slotType: 'goalkeeper' },
        { name: 'Lucas', slotType: 'line' },
      ],
    },
  ]

  it('prefixes goalkeepers with 🧤 and line players with ⚽', () => {
    const result = buildDrawnTeamsMessage(teams)
    expect(result).toContain('🧤 João')
    expect(result).toContain('⚽ Pedro')
    expect(result).toContain('⚽ Carlos')
    expect(result).toContain('🧤 Marcos')
    expect(result).toContain('⚽ Lucas')
  })

  it('bolds team names with asterisks', () => {
    const result = buildDrawnTeamsMessage(teams)
    expect(result).toContain('*Time A*')
    expect(result).toContain('*Time B*')
  })

  it('separates teams with a blank line', () => {
    const result = buildDrawnTeamsMessage(teams)
    expect(result).toContain('\n\n')
  })

  it('handles a team with no players', () => {
    const result = buildDrawnTeamsMessage([{ name: 'Time Vazio', players: [] }])
    expect(result).toContain('*Time Vazio*')
  })
})

// ─── Payment checklist ────────────────────────────────────────────────────────

describe('buildPaymentChecklistMessage', () => {
  it('sorts players alphabetically by name', () => {
    const result = buildPaymentChecklistMessage([
      { name: 'Zé', paid: true },
      { name: 'Ana', paid: false },
      { name: 'Carlos', paid: true },
    ])
    const lines = result.split('\n')
    expect(lines[0]).toContain('Ana')
    expect(lines[1]).toContain('Carlos')
    expect(lines[2]).toContain('Zé')
  })

  it('marks paid players with ✅ and unpaid with ❌', () => {
    const result = buildPaymentChecklistMessage([
      { name: 'João', paid: true },
      { name: 'Pedro', paid: false },
    ])
    expect(result).toContain('✅ João')
    expect(result).toContain('❌ Pedro')
  })

  it('returns an empty string for an empty roster', () => {
    expect(buildPaymentChecklistMessage([])).toBe('')
  })

  it('does not mutate the input array', () => {
    const players = [{ name: 'B', paid: true }, { name: 'A', paid: false }]
    buildPaymentChecklistMessage(players)
    expect(players[0].name).toBe('B')
  })
})

// ─── Cash-box communication ───────────────────────────────────────────────────

describe('buildCashBoxMessage', () => {
  const data: CashBoxCommunicationData = {
    previousBalance: 10000,
    entries: [
      { description: 'Entrada pelada', value: 5000, type: 'credit' },
      { description: 'Compra bola', value: 3000, type: 'debit' },
    ],
    currentBalance: 12000,
  }

  it('includes the title', () => {
    expect(buildCashBoxMessage(data)).toContain('*Comunicação da Caixinha*')
  })

  it('shows previous balance formatted as BRL', () => {
    expect(buildCashBoxMessage(data)).toContain('R$ 100,00')
  })

  it('shows current balance formatted as BRL', () => {
    expect(buildCashBoxMessage(data)).toContain('R$ 120,00')
  })

  it('prefixes credits with + and debits with -', () => {
    const result = buildCashBoxMessage(data)
    expect(result).toContain('+ Entrada pelada')
    expect(result).toContain('- Compra bola')
  })

  it('formats entry values as BRL', () => {
    const result = buildCashBoxMessage(data)
    expect(result).toContain('R$ 50,00')
    expect(result).toContain('R$ 30,00')
  })

  it('works with zero previous balance', () => {
    const result = buildCashBoxMessage({ ...data, previousBalance: 0 })
    expect(result).toContain('R$ 0,00')
  })

  it('works with an empty entries list', () => {
    const result = buildCashBoxMessage({ previousBalance: 500, entries: [], currentBalance: 500 })
    expect(result).toContain('R$ 5,00')
  })
})
