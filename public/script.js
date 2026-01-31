// Register button handler using localStorage. When the user clicks
// register, read all fields (name, email, password, confirm password),
// ensure none are empty, confirm that the password and confirm
// password match, then store the new user in localStorage.
registerBtn.addEventListener('click', () => {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
  // Basic validations for required fields
  if (!name || !email || !password || !confirmPassword) {
    showMessage('Please fill in all fields');
    return;
  }
  // Validate password match
  if (password !== confirmPassword) {
    showMessage('Passwords do not match');
    return;
  }
  // Retrieve existing users from localStorage
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.some((u) => u.email === email)) {
    showMessage('User already exists');
    return;
  }
  // Create new user object using the entered name
  const newUser = { name, email, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  showMessage('Registration successful. You can now login.', false);
  // After a short delay, switch back to the login tab
  setTimeout(() => loginTab.click(), 500);
});
