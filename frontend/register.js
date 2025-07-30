const BASE_URL = "http://localhost:5000";

document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const registerButton = document.getElementById('registerButton');
  const registerMessage = document.getElementById('registerMessage');

  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    registerMessage.textContent = '';

    const username = registerForm.regUsername.value.trim();
    const name = registerForm.regName.value.trim();
    const email = registerForm.regEmail.value.trim();
    const password = registerForm.regPassword.value;
    const department = registerForm.regDepartment.value;
    const employeeCode = registerForm.regEmployeeCode.value.trim();
    const designation = registerForm.regDesignation.value.trim();
    const contactNumber = registerForm.regContactNumber.value.trim();

    if (!username || !name || !email || !password || !department || !employeeCode || !designation || !contactNumber) {
      registerMessage.textContent = 'Please fill in all required fields.';
      return;
    }

    registerButton.disabled = true;
    registerButton.textContent = 'Registering...';

    try {
      const response = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, email, password, department, employeeCode, designation, contactNumber }),
      });

      if (!response.ok) {
        const data = await response.json();
        registerMessage.textContent = data.error || 'Registration failed. Please try again.';
        registerButton.disabled = false;
        registerButton.textContent = 'Register';
        return;
      }

      registerMessage.textContent = 'Registration successful! You can now log in.';
      registerButton.disabled = false;
      registerButton.textContent = 'Register';

      // Optionally, clear the registration form
      registerForm.reset();
    } catch (err) {
      console.error('Registration error:', err);
      registerMessage.textContent = 'An error occurred. Please try again.';
      registerButton.disabled = false;
      registerButton.textContent
    }
  });
});
