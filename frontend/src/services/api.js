const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request('/reports/dashboard'),

  // Accounts
  getAccounts: () => request('/accounts/'),
  createAccount: (data) => request('/accounts/', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id, data) => request(`/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Transactions
  getTransactions: (status) => request(`/transactions/${status ? `?status=${status}` : ''}`),
  createTransaction: (data) => request('/transactions/', { method: 'POST', body: JSON.stringify(data) }),
  approveTransaction: (id, data) => request(`/transactions/${id}/approve`, { method: 'POST', body: JSON.stringify(data) }),

  // Journal Entries
  getJournalEntries: (status) => request(`/journal-entries/${status ? `?status=${status}` : ''}`),
  createJournalEntry: (data) => request('/journal-entries/', { method: 'POST', body: JSON.stringify(data) }),
  approveJournalEntry: (id) => request(`/journal-entries/${id}/approve`, { method: 'POST' }),
  postJournalEntry: (id) => request(`/journal-entries/${id}/post`, { method: 'POST' }),

  // Reports
  getTrialBalance: () => request('/reports/trial-balance'),
  getIncomeStatement: (start, end) => request(`/reports/income-statement?start_date=${start}&end_date=${end}`),
  getBalanceSheet: () => request('/reports/balance-sheet'),
  getCashFlow: (start, end) => request(`/reports/cash-flow?start_date=${start}&end_date=${end}`),
  getRatios: () => request('/reports/ratios'),

  // Audit
  getAuditLogs: (limit = 100) => request(`/audit/?limit=${limit}`),
};
