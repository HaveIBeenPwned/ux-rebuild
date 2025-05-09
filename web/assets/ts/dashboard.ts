// Simple form validation and message display for dashboard login
export function initializeDashboardPage() {
  const form = document.getElementById("dashboardVerificationForm") as HTMLFormElement;
  if (form) {
    const emailInput = document.getElementById("emailInput") as HTMLInputElement;
    const emailError = document.getElementById("emailError") as HTMLElement;
    const errorMessage = document.getElementById("errorMessage") as HTMLElement;
    const successMessage = document.getElementById("successMessage") as HTMLElement;

    // Check if we have a verified user in local storage
    const verifiedEmail: string | null = localStorage.getItem("hibp_verified_email");
    if (verifiedEmail) {
      // User is already verified, redirect to dashboard content
      window.location.href = "dashboard_internal.html";
    }

    form.addEventListener("submit", (event: Event) => {
      event.preventDefault();

      // Reset messages
      emailError.classList.add("d-none");
      errorMessage.classList.add("d-none");
      successMessage.classList.add("d-none");

      // Simple email validation
      const email: string = emailInput.value.trim();
      const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  }
}
