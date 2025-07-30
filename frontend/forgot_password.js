const BASE_URL = "https://it-request-system-1cjr.onrender.com";

document.addEventListener('DOMContentLoaded', function () {
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const messageDiv = document.getElementById('message');
  const submitButton = document.getElementById('submitForgotPassword');

  forgotPasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.classList.remove('show');

    const email = forgotPasswordForm.email.value.trim();

    if (!email) {
      messageDiv.textContent = 'Please enter your registered email address.';
      messageDiv.classList.add('show');
      messageDiv.style.color = 'red';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      const response = await fetch(`${BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        messageDiv.textContent = data.error || 'Failed to send reset link. Please try again.';
        messageDiv.classList.add('show');
        messageDiv.style.color = 'red';
        submitButton.disabled = false;
        submitButton.textContent = 'Send Reset Link';
        return;
      }

      messageDiv.textContent = 'A reset link has been sent to your email address if it is registered.';
      messageDiv.classList.add('show');
      messageDiv.style.color = 'green';
      submitButton.disabled = false;
      submitButton.textContent = 'Send Reset Link';
    } catch (err) {
      console.error('Forgot password error:', err);
      messageDiv.textContent = 'An error occurred. Please try again.';
      messageDiv.classList.add('show');
      messageDiv.style.color = 'red';
      submitButton.disabled = false;
      submitButton.textContent = 'Send Reset Link';
    }
  });
});
