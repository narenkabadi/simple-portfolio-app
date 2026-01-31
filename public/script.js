// Get references to tabs, forms, buttons, and message area
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Utility to show messages (red for errors, green for success)
function showMessage(msg, isError = true) {
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? 'red' : 'green';
}

// Switch to the login tab and reset form/message
loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  showMessage('', false);
});

// Switch to the registration tab and reset form/message
registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  showMessage('', false);
});

// Login handler: validate and redirect on success
loginBtn.addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) {
    showMessage('Please fill in all fields');
    return;
  }
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    showMessage('Invalid email or password');
    return;
  }
  localStorage.setItem('user', JSON.stringify(user));
  window.location.href = 'portfolio.html';
});

// Registration handler: capture name/email/password, validate, store, and reset
registerBtn.addEventListener('click', () => {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
  if (!name || !email || !password || !confirmPassword) {
    showMessage('Please fill in all fields');
    return;
  }
  if (password !== confirmPassword) {
    showMessage('Passwords do not match');
    return;
  }
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.some(u => u.email === email)) {
    showMessage('User already exists');
    return;
  }
  const newUser = { name, email, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  showMessage('Registration successful. You can now login.', false);
  setTimeout(() => loginTab.click(), 500);
});
