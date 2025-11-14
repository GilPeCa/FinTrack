/* FinTrack - Vanilla JS for managing transactions and localStorage */
(function () {
  'use strict';

  const STORAGE_KEY = 'fintrack_transactions';
  const LAST_SAVED_KEY = 'fintrack_lastSaved';

  // DOM refs
  const form = document.getElementById('transaction-form');
  const descInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const typeSelect = document.getElementById('type');
  const transactionsList = document.getElementById('transactions-list');
  const totalIncomeEl = document.getElementById('total-income');
  const totalExpensesEl = document.getElementById('total-expenses');
  const balanceEl = document.getElementById('current-balance');
  const clearBtn = document.getElementById('clear-btn');
  const exportBtn = document.getElementById('export-btn');
  const lastSavedEl = document.getElementById('last-saved');

  let transactions = [];

  /* Utilities */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  const currency = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });

  function formatCurrency(value) {
    return currency.format(value);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function friendlyDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString();
  }

  /* Persistence */
  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to read transactions from localStorage', e);
      return [];
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      const ts = nowIso();
      localStorage.setItem(LAST_SAVED_KEY, ts);
      updateLastSaved(ts);
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }

  function updateLastSaved(iso) {
    if (!lastSavedEl) return;
    if (!iso) {
      const raw = localStorage.getItem(LAST_SAVED_KEY);
      iso = raw || null;
    }
    if (!iso) {
      lastSavedEl.textContent = '';
      return;
    }
    const d = new Date(iso);
    lastSavedEl.textContent = 'Last saved: ' + d.toLocaleString();
  }

  /* Render */
  function renderTransactions() {
    if (!transactionsList) return;
    transactionsList.innerHTML = '';

    if (transactions.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No transactions yet. Add one using the form above.';
      transactionsList.appendChild(empty);
      updateSummary();
      return;
    }

    transactions
      .slice()
      .reverse()
      .forEach(tx => {
        const el = document.createElement('div');
        el.className = 'tx ' + (tx.type === 'income' ? 'income' : 'expense');

        const meta = document.createElement('div');
        meta.className = 'meta';

        const desc = document.createElement('div');
        desc.className = 'desc';
        desc.textContent = tx.description || '(no description)';

        const type = document.createElement('div');
        type.className = 'type';
        type.textContent = tx.type === 'income' ? 'Income' : 'Expense' + ' • ' + friendlyDate(tx.date);

        meta.appendChild(desc);

        const small = document.createElement('div');
        small.className = 'type';
        small.textContent = (tx.type === 'income' ? 'Income' : 'Expense') + ' • ' + friendlyDate(tx.date);
        meta.appendChild(small);

        const right = document.createElement('div');
        right.style.display = 'flex';
        right.style.alignItems = 'center';
        right.style.gap = '12px';

        const amount = document.createElement('div');
        amount.className = 'amount';
        amount.textContent = (tx.type === 'income' ? '+ ' : '- ') + formatCurrency(Math.abs(tx.amount));

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.title = 'Delete';
        delBtn.innerHTML = '🗑';
        delBtn.dataset.id = tx.id;
        delBtn.addEventListener('click', () => {
          removeTransaction(tx.id);
        });

        right.appendChild(amount);
        right.appendChild(delBtn);

        el.appendChild(meta);
        el.appendChild(right);

        transactionsList.appendChild(el);
      });

    updateSummary();
  }

  function updateSummary() {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);

    const balance = income - expenses;

    if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(income);
    if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(expenses);
    if (balanceEl) balanceEl.textContent = formatCurrency(balance);
  }

  /* Actions */
  function addTransactionFromForm(e) {
    e.preventDefault();

    const description = (descInput.value || '').trim();
    const amountRaw = amountInput.value;
    const type = typeSelect.value;

    const amount = parseFloat(amountRaw);
    if (!description) {
      alert('Please enter a description.');
      return;
    }
    if (Number.isNaN(amount) || amount === 0) {
      alert('Please enter a non-zero amount.');
      return;
    }
    if (!type || (type !== 'income' && type !== 'expense')) {
      alert('Please select a valid type.');
      return;
    }

    const tx = {
      id: uid(),
      description,
      amount: Math.abs(amount),
      type,
      date: nowIso()
    };

    transactions.push(tx);
    saveTransactions();
    renderTransactions();

    form.reset();
    descInput.focus();
  }

  function removeTransaction(id) {
    const idx = transactions.findIndex(t => t.id === id);
    if (idx === -1) return;
    transactions.splice(idx, 1);
    saveTransactions();
    renderTransactions();
  }

  function clearAll() {
    if (!confirm('Clear all transactions? This cannot be undone.')) return;
    transactions = [];
    saveTransactions();
    renderTransactions();
  }

  function exportJSON() {
    const data = {
      exportedAt: nowIso(),
      transactions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fintrack-export-' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* Init */
  function init() {
    transactions = loadTransactions();
    renderTransactions();
    updateLastSaved();

    if (form) form.addEventListener('submit', addTransactionFromForm);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    if (exportBtn) exportBtn.addEventListener('click', exportJSON);
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
