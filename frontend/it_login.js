// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  console.log("Login form found:", loginForm !== null);

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("Form submitted");

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const messageDiv = document.getElementById("loginMessage");
    const submitButton = this.querySelector('button[type="submit"]');
    const buttonText = submitButton.innerHTML;

    // Show loading state
    submitButton.innerHTML = '<div class="spinner"></div>Logging in...';
    submitButton.classList.add("loading");
    submitButton.disabled = true;

    console.log("Attempting login with username:", username);

    if (username === "itadmin" && password === "admin123") {
      console.log("Credentials match");
      messageDiv.textContent = "Login successful! Redirecting...";
      messageDiv.className = "login-message success";

      // Store login state and initial data
      localStorage.setItem("isLoggedIn", "true");

      // Redirect to dashboard
      setTimeout(() => {
        console.log("Redirecting to dashboard...");
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      console.log("Invalid credentials");
      messageDiv.textContent = "Invalid username or password";
      messageDiv.className = "login-message error";

      // Reset button state
      submitButton.innerHTML = buttonText;
      submitButton.classList.remove("loading");
      submitButton.disabled = false;
    }
  });
});
