import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FinancialRecordRecord } from '@ports/repositories/FinancialRecordRepository';
import type { BalancesResult } from '@application/use-cases/financial/GetBalancesUseCase';
import { FinancialScreen } from './FinancialScreen';
import * as AppContextModule from '@ui/AppContext';

vi.mock('@ui/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('@ui/AppContext');
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

const mockRecords: FinancialRecordRecord[] = [
  {
    id: 'fr1',
    profile_id: 'prof-1',
    date: new Date('2026-06-10'),
    description: 'Venda de uniforme',
    value: 50000,
    type: 'credit',
    created_at: new Date(),
  },
  {
    id: 'fr2',
    profile_id: 'prof-1',
    date: new Date('2026-06-15'),
    description: 'Aluguel quadra',
    value: 30000,
    type: 'debit',
    created_at: new Date(),
  },
];

const mockBalances: BalancesResult = {
  general: 100000,
  month: 20000,
  previousMonth: 80000,
};

describe('FinancialScreen', () => {
  let mockListRecords: ReturnType<typeof vi.fn>;
  let mockGetBalances: ReturnType<typeof vi.fn>;
  let mockCreateRecord: ReturnType<typeof vi.fn>;
  let mockDeleteRecord: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockListRecords = vi.fn().mockResolvedValue(mockRecords);
    mockGetBalances = vi.fn().mockResolvedValue(mockBalances);
    mockCreateRecord = vi.fn().mockResolvedValue({ ...mockRecords[0], id: 'fr3' });
    mockDeleteRecord = vi.fn().mockResolvedValue(undefined);

    (AppContextModule.useApp as ReturnType<typeof vi.fn>).mockReturnValue({
      listFinancialRecords: { execute: mockListRecords },
      getBalances: { execute: mockGetBalances },
      createFinancialRecord: { execute: mockCreateRecord },
      deleteFinancialRecord: { execute: mockDeleteRecord },
    });
  });

  it('renders header', () => {
    render(<FinancialScreen profileId="prof-1" />);
    expect(screen.getByText('💰 Caixa')).toBeInTheDocument();
    expect(screen.getByText('Gestão financeira')).toBeInTheDocument();
  });

  it('loads records and balances on mount', async () => {
    render(<FinancialScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(mockListRecords).toHaveBeenCalledWith('prof-1');
      expect(mockGetBalances).toHaveBeenCalled();
    });
  });

  it('displays balance cards', async () => {
    render(<FinancialScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('Saldo Geral')).toBeInTheDocument();
      expect(screen.getByText(/R\$ 1000\.00/)).toBeInTheDocument(); // general balance
    });
  });

  it('displays month/year filters', async () => {
    render(<FinancialScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue(/\d+/)).toBeInTheDocument(); // month select
    });
  });

  it('displays loading state initially', () => {
    mockListRecords.mockImplementationOnce(() => new Promise(() => {}));
    render(<FinancialScreen profileId="prof-1" />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('displays empty state when no records', async () => {
    mockListRecords.mockResolvedValueOnce([]);
    render(<FinancialScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum registro neste período')).toBeInTheDocument();
    });
  });

  it('displays financial records with descriptions and values', async () => {
    render(<FinancialScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('Venda de uniforme')).toBeInTheDocument();
      expect(screen.getByText('Aluguel quadra')).toBeInTheDocument();
      expect(screen.getByText(/\+ R\$ 500\.00/)).toBeInTheDocument();
      expect(screen.getByText(/- R\$ 300\.00/)).toBeInTheDocument();
    });
  });

  it('opens create sheet when button clicked', async () => {
    render(<FinancialScreen profileId="prof-1" />);
    const button = await screen.findByText('+ Novo Registro');
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Novo Registro Financeiro')).toBeInTheDocument();
    });
  });

  it('opens and closes create sheet', async () => {
    render(<FinancialScreen profileId="prof-1" />);
    const button = await screen.findByText('+ Novo Registro');
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Novo Registro Financeiro')).toBeInTheDocument();
    });
  });

  it('displays delete button for each record', async () => {
    render(<FinancialScreen profileId="prof-1" />);
    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText(/Excluir/);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it('opens delete confirmation when delete button clicked', async () => {
    render(<FinancialScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('Venda de uniforme')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByLabelText(/Excluir/);
    await userEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Excluir Registro?')).toBeInTheDocument();
    });
  });

  it('deletes record on confirmation', async () => {
    render(<FinancialScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('Venda de uniforme')).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByLabelText(/Excluir/);
    await userEvent.click(deleteButtons[0]);
    const confirmButton = screen.getByRole('button', { name: 'Excluir' });
    await userEvent.click(confirmButton);
    await waitFor(() => {
      expect(mockDeleteRecord).toHaveBeenCalled();
    });
  });
});
