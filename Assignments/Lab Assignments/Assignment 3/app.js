const body = document.body;
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('[data-view]');
const todayLabel = document.getElementById('todayLabel');

function showView(viewId) {
  views.forEach((view) => view.classList.toggle('active', view.id === viewId));
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === viewId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navItems.forEach((item) => item.addEventListener('click', () => showView(item.dataset.view)));

todayLabel.textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());

const bmiForm = document.getElementById('bmiForm');
bmiForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const height = Number(document.getElementById('height').value);
  const weight = Number(document.getElementById('weight').value);
  const message = document.getElementById('bmiMessage');
  if (!height || !weight || height < 50 || weight < 10) {
    message.textContent = 'Please enter valid height and weight values.';
    return;
  }
  const bmi = weight / ((height / 100) ** 2);
  let category = 'Normal weight';
  let position = 50;
  if (bmi < 18.5) { category = 'Underweight'; position = Math.max(8, bmi / 18.5 * 33); }
  else if (bmi >= 25) { category = 'Overweight'; position = Math.min(92, 66 + (bmi - 25) * 2); }
  document.getElementById('bmiValue').textContent = bmi.toFixed(1);
  document.getElementById('bmiCategory').textContent = category;
  document.querySelector('.scale-line i').style.left = `${position}%`;
  message.textContent = '';
});

const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [
    { input: document.getElementById('firstName'), error: 'First name is required.' },
    { input: document.getElementById('lastName'), error: 'Last name is required.' },
    { input: document.getElementById('email'), error: 'Enter a valid email address.' },
    { input: document.getElementById('password'), error: 'Use at least 8 characters.' }
  ];
  let valid = true;
  fields.forEach(({ input, error }) => {
    const value = input.value.trim();
    const isValid = input.id === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : input.id === 'password' ? value.length >= 8 : value.length > 0;
    input.classList.toggle('invalid', !isValid);
    input.nextElementSibling.textContent = isValid ? '' : error;
    valid = valid && isValid;
  });
  const terms = document.getElementById('terms');
  if (!terms.checked) valid = false;
  const success = document.getElementById('signupSuccess');
  success.textContent = valid ? 'Account created successfully. Welcome to Focus Lab.' : 'Please fix the highlighted fields to continue.';
  success.style.color = valid ? '#39825b' : '#bd5048';
});

const storedTheme = localStorage.getItem('focus-theme') || 'citrus';
applyTheme(storedTheme);
document.querySelectorAll('.theme-option').forEach((option) => option.addEventListener('click', () => applyTheme(option.dataset.theme)));
function applyTheme(theme) {
  body.dataset.theme = theme === 'citrus' ? '' : theme;
  document.querySelectorAll('.theme-option').forEach((option) => option.classList.toggle('selected', option.dataset.theme === theme));
  const names = { citrus: 'Citrus morning', ocean: 'Coastal blue', berry: 'Berry night' };
  document.getElementById('themeName').textContent = names[theme];
  localStorage.setItem('focus-theme', theme);
}

function updateClock() {
  const now = new Date();
  const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  document.getElementById('clockTime').textContent = time;
  document.getElementById('clockPeriod').textContent = now.toLocaleTimeString('en-US', { hour: 'numeric' }).slice(-2);
  document.getElementById('clockDate').textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(now);
}
updateClock();
setInterval(updateClock, 1000);

let tasks = JSON.parse(localStorage.getItem('focus-tasks') || '[]');
let currentFilter = 'all';
const taskList = document.getElementById('taskList');
function renderTasks() {
  const visibleTasks = tasks.filter((task) => currentFilter === 'all' || (currentFilter === 'active' ? !task.completed : task.completed));
  taskList.innerHTML = visibleTasks.map((task) => `<li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}"><input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete"><span>${escapeHtml(task.text)}</span><button class="delete-task" type="button" aria-label="Delete task">×</button></li>`).join('');
  document.getElementById('emptyState').classList.toggle('hidden', visibleTasks.length > 0);
  const remaining = tasks.filter((task) => !task.completed).length;
  document.getElementById('taskCount').textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left`;
  localStorage.setItem('focus-tasks', JSON.stringify(tasks));
}
function escapeHtml(text) { return text.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]); }
document.getElementById('todoForm').addEventListener('submit', (event) => { event.preventDefault(); const input = document.getElementById('taskInput'); const text = input.value.trim(); if (text) { tasks.unshift({ id: Date.now(), text, completed: false }); input.value = ''; renderTasks(); } });
taskList.addEventListener('click', (event) => { const item = event.target.closest('.task-item'); if (!item) return; const id = Number(item.dataset.id); if (event.target.matches('input')) tasks = tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task); if (event.target.matches('.delete-task')) tasks = tasks.filter((task) => task.id !== id); renderTasks(); });
document.querySelectorAll('.filter').forEach((filter) => filter.addEventListener('click', () => { currentFilter = filter.dataset.filter; document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === filter)); renderTasks(); }));
document.getElementById('clearCompleted').addEventListener('click', () => { tasks = tasks.filter((task) => !task.completed); renderTasks(); });
renderTasks();
