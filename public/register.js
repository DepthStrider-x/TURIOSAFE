// register.js
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
  
    if (!username || !email || !password) {
      alert('Please fill all required fields.');
      return;
    }
    if (password !== confirm) {
      alert('Passwords do not match.');
      return;
    }
  
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
  
      const data = await res.json().catch(() => null);
  
      if (!res.ok || !data || !data.success) {
        const msg = data?.error || res.statusText || 'Registration failed';
        alert('Register failed: ' + msg);
        return;
      }
  
      alert('Registered successfully! Please login.');
      window.location.href = 'login.html';
    } catch (err) {
      console.error(err);
      alert('Network error: ' + err.message);
    }
  });