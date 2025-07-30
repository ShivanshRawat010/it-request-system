const BASE_URL = "https://it-request-system-1cjr.onrender.com";

document.addEventListener('DOMContentLoaded', function () {
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const messageDiv = document.getElementById('message');
  const submitButton = document.getElementById('submitResetPassword');

  // Extract token from URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    messageDiv.textContent = 'Invalid or missing password reset token.';
    messageDiv.classList.add('show');
    submitButton.disabled = true;
    return;
  }

  resetPasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.classList.remove('show');

    const newPassword = resetPasswordForm.newPassword.value;
    const confirmPassword = resetPasswordForm.confirmPassword.value;

    if (!newPassword || !confirmPassword) {
      messageDiv.textContent = 'Please fill in all fields.';
      messageDiv.classList.add('show');
      messageDiv.style.color = 'red';
      return;
    }

    if (newPassword !== confirmPassword) {
      messageDiv.textContent = 'Passwords do not match.';
      messageDiv.classList.add('show');
      messageDiv.style.color = 'red';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Resetting...';

    try {
      const response = await fetch(`${BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        messageDiv.textContent = data.error || 'Failed to reset password. Please try again.';
        messageDiv.classList.add('show');
        messageDiv.style.color = 'red';
        submitButton.disabled = false;
        submitButton.textContent = 'Reset Password';
        return;
      }

      messageDiv.textContent = 'Password has been reset successfully. You can now log in with your new password.';
      messageDiv.classList.add('show');
      messageDiv.style.color = 'green';
      submitButton.disabled = true;
      submitButton.textContent = 'Reset Password';
    } catch (err) {
      console.error('Reset password error:', err);
      messageDiv.textContent = 'An error occurred. Please try again.';
      messageDiv.classList.add('show');
      messageDiv.style.color = 'red';
      submitButton.disabled = false;
      submitButton.textContent = 'Reset Password';
    }
  });
});
