const STORAGE_KEY = 'expenses';

class ObserverList {
  constructor() {
    this.observers = [];
  }

  add(obj) {
    return this.observers.push(obj);
  }

  count() {
    return this.observers.length;
  }

  get(index) {
    if (index > -1 && index < this.observers.length) {
      return this.observers[index];
    }
  }

  indexOf(obj, startIndex) {
    var i = startIndex;
    while (i < this.observers.length) {
      if (this.observers[i] === obj) {
        return i;
      }
      i++;
    }
    return -1;
  }

  removeAt(index) {
    this.observers.splice(index, 1);
  }
}

class Observable {
  constructor() {
    this.expenses = [];
    this.observers = new ObserverList();
  }

  addObserver(observer) {
    this.observers.add(observer);
  }

  removeObserver(observer) {
    this.observers.removeAt(this.observers.indexOf(observer, 0));
  }

  notify(context) {
    var observerCount = this.observers.count();
    for (var i = 0; i < observerCount; i++) {
      this.observers.get(i).update(context);
    }
  }
}

const expenseModel = new Observable();

window.onload = function () {
  const storedExpenses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  expenseModel.expenses.push(...storedExpenses);
  expenseModel.notify();
};

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenseModel.expenses));
}

function addExpense() {
  const expenseName = prompt('Введите название расхода:');
  const expenseAmount = parseFloat(prompt('Введите сумму расхода:'));

  if (expenseName && !isNaN(expenseAmount)) {
    expenseModel.expenses.push({ name: expenseName, amount: expenseAmount });
    expenseModel.notify();
    saveToLocalStorage();
  } else {
    alert('Пожалуйста, введите корректные данные.');
  }
}

function deleteExpense(index) {
  expenseModel.expenses.splice(index, 1);
  expenseModel.notify();
  saveToLocalStorage();
}

function updateUI() {
  updateExpensesList();
  updateTotalExpense();
}

function updateExpensesList() {
  const expensesList = document.getElementById('expenses-list');
  expensesList.innerHTML = '';

  expenseModel.expenses.forEach((expense, index) => {
    const listItem = document.createElement('li');
    listItem.className = 'expense-item';
    listItem.innerHTML = `
      <span>${expense.name}: ${expense.amount}</span>
      <button class="delete-button" type="button" onclick="deleteExpense(${index})">Удалить</button>
    `;
    expensesList.appendChild(listItem);
  });
}

function updateTotalExpense() {
  const totalExpenseElement = document.getElementById('totalExpense');
  const totalExpense = expenseModel.expenses.reduce((total, expense) => total + expense.amount, 0);
  totalExpenseElement.textContent = totalExpense;
}

expenseModel.addObserver({
  update: function () {
    updateUI();
  }
});

class ExpenseCalculator extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        #app{
            font-size: 20px;
            font-family:'Trebuchet MS', sans-serif;
        }
        .expense-item {
          margin-bottom: 10px;
          padding: 10px;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
        }
        button{
            background-color: green;
            color: white;
            padding: 10px 30px;
            border-radius: 10px;
            cursor:pointer;
        }
      </style>
      <div id="app">
        <ul id="expenses-list"></ul>
        <p>Общая сумма расходов: <span id="totalExpense">0</span></p>
        <button id="addExpenseButton">Добавить расход</button>
      </div>
    `;

    document.getElementById('addExpenseButton').addEventListener('click', addExpense);

    updateUI();
  }
}

customElements.define('expense-calculator', ExpenseCalculator);
