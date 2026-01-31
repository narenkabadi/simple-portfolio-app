// Client‑side logic for handling tab switching, registration and login.
document.addEventListener('DOMContentLoaded', function () {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const messageDiv = document.getElementById('message');

  // Switch to login form
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    messageDiv.textContent = '';
  });

  // Switch to register form
  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    messageDiv.textContent = '';
  });

  // Helper to display a feedback message
  function showMessage(msg, isError = true) {
    messageDiv.style.color = isError ? 'red' : 'green';
    messageDiv.textContent = msg;
  }

  // Login button handler
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) {
      showMessage('Please enter email and password');
      return;
    }
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Store user details in localStorage and redirect to portfolio page
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/portfolio.html';
      } else {
        showMessage(data.message || 'Login failed');
      }
    } catch (err) {
      showMessage('Error occurred during login');
    }
  });

  // Register button handler
  registerBtn.addEventListener('click', async () => {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    if (!email || !password) {
      showMessage('Please enter email and password');
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMessage('Registration successful. You can now login.', false);
        // Optionally switch to login tab automatically after successful registration
        setTimeout(() => loginTab.click(), 500);
      } else {
        showMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      showMessage('Error occurred during registration');
    }
  });
});
