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

  // Login button handler using localStorage instead of serverless APIs.  When the
  // user clicks the login button, read the entered email and password,
  // validate that both fields are provided, then look up the user in the
  // locally stored users array.  If the credentials match a stored user,
  // persist the user object to localStorage under the `user` key and
  // redirect to the portfolio page.  Otherwise display an error message.
  loginBtn.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) {
      showMessage('Please enter email and password');
      return;
    }
    // Retrieve users from localStorage (empty array if not present)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existing = users.find((u) => u.email === email && u.password === password);
    if (existing) {
      // Save the current user session and go to the portfolio page
      localStorage.setItem('user', JSON.stringify(existing));
      window.location.href = '/portfolio.html';
    } else {
      showMessage('Invalid email or password');
    }
  });

  // Register button handler using localStorage.  When the user clicks
  // register, validate the inputs, check if the email is already
  // registered, then add the new user to the users array.  The user's
  // name is set to a static value ("Naren A. Kabadi") because we
  // don't collect a name on the form.  After storing, show a success
  // message and switch to the login tab.
  registerBtn.addEventListener('click', () => {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    if (!email || !password) {
      showMessage('Please enter email and password');
      return;
    }
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some((u) => u.email === email)) {
      showMessage('User already exists');
      return;
    }
    // Create new user with email, password and a static name
    const newUser = { email, password, name: 'Naren A. Kabadi' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showMessage('Registration successful. You can now login.', false);
    setTimeout(() => loginTab.click(), 500);
  });
});
