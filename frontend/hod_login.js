document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const submitButton = this.querySelector('button[type="submit"]');
    const buttonText = submitButton.innerHTML;

    // Show loading state
    submitButton.innerHTML = '<div class="spinner"></div>Logging in...';
    submitButton.classList.add("loading");
    submitButton.disabled = true;

    // Hardcoded HR credentials
    if (username === "shivanshrawat2003@gmail.com" && password === "111" || username==="hod@example.com" && password==="111") {
      messageDiv.textContent = "Login successful! Redirecting...";
      messageDiv.className = "login-message success";

      // Store login state and username
      localStorage.setItem("isHodLoggedIn", "true");
      localStorage.setItem("loggedInUser", username);  // Store the username/email

      // Redirect to HR dashboard
      setTimeout(() => {
        window.location.href = "hod_dashboard.html";
      }, 1500);
    } else {
      messageDiv.textContent = "Invalid username or password";
      messageDiv.className = "login-message error";

      // Reset button state
      submitButton.innerHTML = buttonText;
      submitButton.classList.remove("loading");
      submitButton.disabled = false;
    }
  });
});
