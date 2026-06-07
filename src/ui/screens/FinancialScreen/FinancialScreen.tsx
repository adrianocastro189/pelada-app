import { useEffect, useState } from 'react';
import { Button, Card, Input, BottomSheet } from '@ui/components';
import { useApp } from '@ui/AppContext';
import type { FinancialRecordRecord } from '@ports/repositories/FinancialRecordRepository';
import type { BalancesResult } from '@application/use-cases/financial/GetBalancesUseCase';
import './FinancialScreen.css';

/** Parses a 'YYYY-MM-DD' string as a local-timezone Date (avoids UTC midnight → previous-day shift). */
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface FinancialScreenProps {
  profileId: string;
}

/**
 * Screen for managing financial records and caixa (cash box) balance.
 * Lists, creates, and deletes financial records with balance display.
 */
export function FinancialScreen({ profileId }: FinancialScreenProps): JSX.Element {
  const app = useApp();
  const [records, setRecords] = useState<FinancialRecordRecord[]>([]);
  const [balances, setBalances] = useState<BalancesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    /** Display string in R$ typed by the user (e.g. "4.01"); converted to cents only on submit. */
    valueDisplay: '',
    type: 'credit' as 'credit' | 'debit',
  });

  // Load records, balances and description suggestions on mount and when month/year change
  useEffect(() => {
    const loadFinancialData = async () => {
      setLoading(true);
      try {
        const [recordsData, balancesData, suggestionsData] = await Promise.all([
          app.listFinancialRecords.execute(profileId),
          app.getBalances.execute(profileId, selectedYear, selectedMonth - 1),
          app.getDescriptionSuggestions.execute(profileId, ''),
        ]);
        setRecords(recordsData);
        setBalances(balancesData);
        setSuggestions(suggestionsData);
      } finally {
        setLoading(false);
      }
    };
    loadFinancialData();
  }, [profileId, selectedMonth, selectedYear, app]);

  const handleCreateRecord = async () => {
    const valueCents = Math.round(parseFloat(formData.valueDisplay || '0') * 100);
    if (!formData.description.trim() || valueCents <= 0) return;
    try {
      await app.createFinancialRecord.execute(profileId, {
        date: parseLocalDate(formData.date),
        description: formData.description.trim(),
        value: valueCents,
        type: formData.type,
      });
      // Reset form and reload
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        valueDisplay: '',
        type: 'credit',
      });
      setShowCreateSheet(false);
      const [recordsData, balancesData, suggestionsData] = await Promise.all([
        app.listFinancialRecords.execute(profileId),
        app.getBalances.execute(profileId, selectedYear, selectedMonth - 1),
        app.getDescriptionSuggestions.execute(profileId, ''),
      ]);
      setRecords(recordsData);
      setBalances(balancesData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await app.deleteFinancialRecord.execute(recordId);
      setConfirmDeleteId(null);
      // Reload records and refresh suggestions (a deletion may remove a unique description)
      const [recordsData, balancesData, suggestionsData] = await Promise.all([
        app.listFinancialRecords.execute(profileId),
        app.getBalances.execute(profileId, selectedYear, selectedMonth - 1),
        app.getDescriptionSuggestions.execute(profileId, ''),
      ]);
      setRecords(recordsData);
      setBalances(balancesData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const formatCurrency = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="financial-screen">
      <header className="financial-header">
        <h1>💰 Caixa</h1>
        <p>Gestão financeira</p>
      </header>

      <main className="financial-main">
        {/* Balances */}
        {balances && (
          <div className="balances-container">
            <div className="balance-card general">
              <p className="balance-label">Saldo Geral</p>
              <p className="balance-value">{formatCurrency(balances.general)}</p>
            </div>
            <div className="balance-card month">
              <p className="balance-label">{monthName}</p>
              <p className="balance-value">{formatCurrency(balances.month)}</p>
            </div>
            <div className="balance-card previous">
              <p className="balance-label">Mês Anterior</p>
              <p className="balance-value">{formatCurrency(balances.previousMonth)}</p>
            </div>
          </div>
        )}

        {/* Month/Year Filter */}
        <div className="financial-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Mês</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="filter-select"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(2024, m - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Ano</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="filter-select"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Records List */}
        {loading ? (
          <p className="financial-loading">Carregando...</p>
        ) : records.length === 0 ? (
          <p className="financial-empty">Nenhum registro neste período</p>
        ) : (
          <div className="records-list">
            {records.map(record => (
              <Card key={record.id} className="record-card">
                <div className="record-header">
                  <div className="record-info">
                    <h4 className="record-description">{record.description}</h4>
                    <p className="record-date">{formatDate(record.date)}</p>
                  </div>
                  <div className="record-amount-delete">
                    <p className={`record-amount ${record.type}`}>
                      {record.type === 'credit' ? '+' : '-'} {formatCurrency(record.value)}
                    </p>
                    <button
                      className="record-delete"
                      onClick={() => setConfirmDeleteId(record.id)}
                      aria-label={`Excluir ${record.description}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={() => setShowCreateSheet(true)}
          className="financial-create-button"
        >
          + Novo Registro
        </Button>
      </main>

      {/* Create sheet */}
      <BottomSheet
        open={showCreateSheet}
        onClose={() => {
          setShowCreateSheet(false);
          setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            valueDisplay: '',
            type: 'credit',
          });
        }}
        title="Novo Registro Financeiro"
      >
        <form
          className="financial-create-form"
          onSubmit={e => {
            e.preventDefault();
            handleCreateRecord();
          }}
        >
          <Input
            label="Descrição *"
            placeholder="Ex: Venda de uniforme"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            list="financial-description-suggestions"
            required
          />
          {suggestions.length > 0 && (
            <datalist id="financial-description-suggestions">
              {suggestions.map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}

          <Input
            label="Data *"
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="financial-form-row">
            <div>
              <label className="form-label">Tipo</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as 'credit' | 'debit' })}
                className="form-select"
              >
                <option value="credit">➕ Entrada</option>
                <option value="debit">➖ Saída</option>
              </select>
            </div>
            <div>
              <label className="form-label">Valor (R$) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.valueDisplay}
                onChange={e => setFormData({ ...formData, valueDisplay: e.target.value })}
                className="form-number"
                required
              />
            </div>
          </div>

          <Button variant="primary" fullWidth type="submit">
            Registrar
          </Button>
        </form>
      </BottomSheet>

      {/* Delete confirmation sheet */}
      <BottomSheet
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Excluir Registro?"
      >
        <div className="financial-delete-confirm">
          <p>Tem certeza que deseja excluir este registro?</p>
          <div className="financial-delete-buttons">
            <Button variant="ghost" fullWidth onClick={() => setConfirmDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              fullWidth
              onClick={() => {
                if (confirmDeleteId) {
                  handleDeleteRecord(confirmDeleteId);
                }
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
