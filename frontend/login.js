const BASE_URL = "http://localhost:5000";

document.addEventListener('DOMContentLoaded', function() {
  // First check if we're already logged in with a valid token
  checkAuthStatus();
  
  const loginForm = document.getElementById('loginForm');
  const loginButton = document.getElementById('loginButton');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    if (!email || !password) {
      errorMessage.textContent = 'Please enter both email and password.';
      errorMessage.classList.add('show');
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        errorMessage.textContent = data.error || 'Login failed or wrong credentials. Please try again.';
        errorMessage.classList.add('show');
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
        return;
      }

      const data = await response.json();
      
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      
      // Store user data in localStorage (optional but useful for UI)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Verify the token is valid before redirecting
      const authCheck = await verifyToken(data.token);
      if (authCheck.valid) {
        window.location.href = 'index.html';
      } else {
        // If verification fails, clear the stored token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        errorMessage.textContent = 'Authentication failed. Please try again.';
        errorMessage.classList.add('show');
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
      }
    } catch (err) {
      console.error('Login error:', err);
      // Clear any stored tokens on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      errorMessage.textContent = 'An error occurred. Please try again.';
      errorMessage.classList.add('show');
      loginButton.disabled = false;
      loginButton.textContent = 'Login';
    }
  });
});

async function checkAuthStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const authCheck = await verifyToken(token);
      if (authCheck.valid) {
        // Update user data in localStorage if needed
        if (authCheck.user) {
          localStorage.setItem('user', JSON.stringify(authCheck.user));
        }
        window.location.href = 'index.html';
      } else {
        // Token is invalid, clear storage
        clearAuthData();
      }
    } catch (err) {
      console.error('Auth check error:', err);
      clearAuthData();
    }
  }
}

async function verifyToken(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/verify-auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();
    return {
      valid: true,
      user: data.user
    };
  } catch (err) {
    console.error('Token verification error:', err);
    return { valid: false };
  }
}

function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
