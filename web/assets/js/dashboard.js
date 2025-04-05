// Simple form validation and message display for demonstration
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("dashboardVerificationForm");
  const emailInput = document.getElementById("emailInput");
  const emailError = document.getElementById("emailError");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

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

    // If valid, show success message
    successMessage.classList.remove("d-none");

    // Clear the form
    form.reset();
  });
});
