// Currency formatting utilities

export function formatCurrency(amount: number, currencyCode: string = 'GBP'): string {
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

  // Always convert to GBP (£) if the currency code is 'GBP' or not recognized
  const normalizedCode = currencyCode === 'GBP' || !currencySymbols[currencyCode] ? 'GBP' : currencyCode;
  const symbol = currencySymbols[normalizedCode];

  // For currencies that typically don't show decimals (like JPY)
  const shouldShowDecimals = !['JPY', 'CNY'].includes(currencyCode);

  if (shouldShowDecimals) {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else {
    return `${symbol}${amount.toLocaleString('en-US')}`;
  }
}

/**
 * Format currency with optional VAT indicator
 * @param amount - The amount to format
 * @param currencyCode - The currency code (IGNORED - always uses GBP/£)
 * @param vatApplicable - Whether to show "+VAT" suffix
 * @returns Formatted currency string with optional +VAT suffix (always shows £)
 */
export function formatCurrencyWithVAT(amount: number, currencyCode?: string, vatApplicable?: boolean): string {
  // Always use GBP (£) regardless of what currency code is passed
  const formattedAmount = formatCurrency(amount, 'GBP');
  return vatApplicable ? `${formattedAmount} +VAT` : formattedAmount;
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