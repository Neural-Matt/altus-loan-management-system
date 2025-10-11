export const formatCurrencyZMW = (value: number | undefined | null) =>
  typeof value === 'number' && !isNaN(value)
    ? new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW', minimumFractionDigits: 2 }).format(value)
    : '—';

export const formatNumber = (value: number | undefined | null) =>
  typeof value === 'number' && !isNaN(value)
    ? new Intl.NumberFormat('en-ZM').format(value)
    : '—';
