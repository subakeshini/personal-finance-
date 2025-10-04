const form = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const totalExpenseEl = document.getElementById('totalExpense');
const filterCategory = document.getElementById('filterCategory');
const filterDate = document.getElementById('filterDate');

let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');

// Load filters from sessionStorage
filterCategory.value = sessionStorage.getItem('filterCategory') || '';
filterDate.value = sessionStorage.getItem('filterDate') || '';

// Update total expense
function updateTotal() {
  const filtered = getFilteredExpenses();
  const total = filtered.reduce((sum, exp) => sum + Number(exp.amount), 0);
  totalExpenseEl.textContent = total.toFixed(2);
}

// Filter logic
function getFilteredExpenses() {
  return expenses.filter(exp => {
    const matchCategory = !filterCategory.value || exp.category === filterCategory.value;
    const matchDate = !filterDate.value || exp.date === filterDate.value;
    return matchCategory && matchDate;
  });
}

// Render expense list
function renderExpenses() {
  expenseList.innerHTML = '';
  const filtered = getFilteredExpenses();

  filtered.forEach(exp => {
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.dataset.id = exp.id;
    li.innerHTML = `
      <span>₹${exp.amount}</span> - 
      <span>${exp.category}</span> on 
      <span>${exp.date}</span> 
      ${exp.notes ? ` - <em>${exp.notes}</em>` : ''}

      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    `;
    expenseList.appendChild(li);
  });

  updateTotal();
}

// Submit expense
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  const amount = parseFloat(data.get('amount'));
  const category = data.get('category');
  const date = data.get('date');
  const notes = data.get('notes');

  if (!amount || !category || !date) {
    alert('Please fill in amount, category, and date.');
    return;
  }

  const newExpense = {
    id: Date.now(),
    amount,
    category,
    date,
    notes
  };

  expenses.push(newExpense);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  form.reset();
  renderExpenses();
});

// ⌨️ Submit with Enter key on any input
form.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    form.requestSubmit();
  }
});

// 🎯 Event Delegation for Edit/Delete
expenseList.addEventListener('click', e => {
  const li = e.target.closest('li.expense-item');
  const id = Number(li.dataset.id);
  const expense = expenses.find(e => e.id === id);

  if (e.target.classList.contains('delete')) {
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
  }

  if (e.target.classList.contains('edit')) {
    li.innerHTML = `
      <input type="number" class="edit-amount" value="${expense.amount}" />
      <input type="text" class="edit-category" value="${expense.category}" />
      <input type="date" class="edit-date" value="${expense.date}" />
      <input type="text" class="edit-notes" value="${expense.notes}" />
      <button class="save">Save</button>
      <button class="cancel">Cancel</button>
    `;
  }

  if (e.target.classList.contains('cancel')) {
    renderExpenses();
  }

  if (e.target.classList.contains('save')) {
    const updated = {
      id,
      amount: parseFloat(li.querySelector('.edit-amount').value),
      category: li.querySelector('.edit-category').value,
      date: li.querySelector('.edit-date').value,
      notes: li.querySelector('.edit-notes').value
    };

    if (!updated.amount || !updated.category || !updated.date) {
      alert('Amount, category, and date are required.');
      return;
    }

    const index = expenses.findIndex(e => e.id === id);
    expenses[index] = updated;
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
  }
});

// Filters
[filterCategory, filterDate].forEach(input => {
  input.addEventListener('change', () => {
    sessionStorage.setItem('filterCategory', filterCategory.value);
    sessionStorage.setItem('filterDate', filterDate.value);
    renderExpenses();
  });
});

// Initial load
renderExpenses();
