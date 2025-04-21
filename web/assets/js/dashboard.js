// Simple form validation and message display for dashboard login
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("dashboardVerificationForm");
  const emailInput = document.getElementById("emailInput");
  const emailError = document.getElementById("emailError");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  // Check if we have a verified user in local storage
  const verifiedEmail = localStorage.getItem("hibp_verified_email");
  if (verifiedEmail) {
    // User is already verified, redirect to dashboard content
    window.location.href = "dashboard_internal.html";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Reset messages
    emailError.classList.add("d-none");
    errorMessage.classList.add("d-none");
    successMessage.classList.add("d-none");

    // Simple email validation
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      // Show inline error
      emailError.classList.remove("d-none");
      // Show alert error
      errorMessage.classList.remove("d-none");
      return;
    }

    // For development: Skip verification and consider the user verified immediately
    localStorage.setItem("hibp_verified_email", email);

    // Show success message briefly before redirecting
    successMessage.classList.remove("d-none");

    // Short delay to show success message before redirecting to dashboard
    setTimeout(() => {
      window.location.href = "dashboard_internal.html";
    }, 1000);
  });
});
