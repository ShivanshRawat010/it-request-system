const BASE_URL = "http://localhost:5000";

// Parse query parameters from URL
function getQueryParams() {
  const params = {};
  window.location.search.substring(1).split("&").forEach(pair => {
    const [key, value] = pair.split("=");
    params[decodeURIComponent(key)] = decodeURIComponent(value || "");
  });
  return params;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = getQueryParams();
  const requestId = params.id;
  const type = params.type;

  const form = document.getElementById("rejectForm");
  const commentInput = document.getElementById("comment");
  const messageDiv = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const comment = commentInput.value.trim();
    if (!comment) {
      messageDiv.textContent = "Rejection comment is required.";
      messageDiv.style.color = "red";
      return;
    }

    // Show loading state on submit button
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Submitting...";

    try {
      const response = await fetch(`${BASE_URL}/api/requests/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          role: type,
          comment: comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit rejection");
      }

      messageDiv.textContent = "Request rejected successfully.";
      messageDiv.style.color = "green";

      // Disable form after success
      commentInput.disabled = true;
      submitButton.disabled = true;
    } catch (error) {
      messageDiv.textContent = error.message;
      messageDiv.style.color = "red";

      // Restore submit button state on error
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
