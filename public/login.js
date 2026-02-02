// login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const usernameOrEmail = document.getElementById('usernameOrEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
  
    if (!usernameOrEmail || !password) {
      alert('Please enter username/email and password.');
      return;
    }
  
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });
  
      const data = await res.json().catch(() => null);
  
      if (!res.ok || !data || !data.success) {
        const msg = data?.error || res.statusText || 'Login failed';
        alert('Login failed: ' + msg);
        return;
      }
  
      // Save token and go to index
      localStorage.setItem('token', data.token);
      alert('Logged in successfully.');
      window.location.href = 'index.html';
    } catch (err) {
      console.error(err);
      alert('Network error: ' + err.message);
    }
  });