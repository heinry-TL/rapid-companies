// Currency formatting utilities

export function formatCurrency(amount: number, currencyCode: string): string {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'AUD': 'A$',
    'CAD': 'C$',
    'SGD': 'S$',
    'HKD': 'HK$',
    'JPY': '¥',
    'CNY': '¥',
  };

  const symbol = currencySymbols[currencyCode] || currencyCode;

  // For currencies that typically don't show decimals (like JPY)
  const shouldShowDecimals = !['JPY', 'CNY'].includes(currencyCode);

  if (shouldShowDecimals) {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else {
    return `${symbol}${amount.toLocaleString('en-US')}`;
  }
}

export function getCurrencySymbol(currencyCode: string): string {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'AUD': 'A$',
    'CAD': 'C$',
    'SGD': 'S$',
    'HKD': 'HK$',
    'JPY': '¥',
    'CNY': '¥',
  };

  return currencySymbols[currencyCode] || currencyCode;
}