var expenseList = [];
//cha

class Expense {
  amount;
  date;
  category;
  note;
  type;

  constructor(amount, date, category, note, type) {
    this.amount = amount;
    this.date = date;
    this.category = category;
    this.note = note;
    this.type = type;
  }
}

function addExpense(amount, date, category, note) {
  if (amount <= 0 || !date || !type) return;
}
