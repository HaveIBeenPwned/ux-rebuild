import { LoadingButton, type LoadingButtonElement } from "./loadingButton";
import { delay } from "./utils";

export function initializeNotificationPage() {
  // Form submission handling
  const notificationForm = document.getElementById("notificationForm") as HTMLFormElement;
  if (notificationForm) {
    const notificationInitial = document.getElementById("notificationInitial") as HTMLElement;
    const notificationSent = document.getElementById("notificationSent") as HTMLElement;
    const resendVerificationBtn = document.getElementById("resendVerificationBtn") as LoadingButtonElement;
    const notificationEmailInput = document.getElementById("notificationEmail") as HTMLInputElement;

    let submittedEmail = "";

    // Check if there's an email in session storage (from search)
    if (notificationEmailInput) {
      const searchedEmail = sessionStorage.getItem("searchedEmail");
      if (searchedEmail) {
        notificationEmailInput.value = searchedEmail;
      }
    }

    notificationForm.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      // Get email from form
      submittedEmail = notificationEmailInput.value;
      if (submittedEmail) {
        console.log("Notification requested for:", submittedEmail);
        await sendVerificationEmail(submittedEmail);
        notificationInitial.classList.add("d-none");
        notificationSent.classList.remove("d-none");
      }
    });

    // Resend verification button handler
    if (resendVerificationBtn) {
      resendVerificationBtn.addEventListener("click", async (e) => {
        const loadingButton = LoadingButton.getOrCreateInstance(resendVerificationBtn);
        loadingButton.start();
        const btnText = resendVerificationBtn.querySelector<HTMLSpanElement>(".btn-text");
        if (btnText) {
          const originalText = btnText.innerHTML;
          console.log("Verification email resent to:", submittedEmail);
          await sendVerificationEmail(submittedEmail);
          loadingButton.stop();
          btnText.innerHTML = '<i class="bi bi-check-circle me-2"></i>Email Sent';
          resendVerificationBtn.classList.remove("btn-outline-primary");
          resendVerificationBtn.classList.add("bg-success", "btn-primary");
          await delay(3000);
          btnText.innerHTML = originalText;
          resendVerificationBtn.classList.remove("bg-success", "btn-primary");
          resendVerificationBtn.classList.add("btn-outline-primary");
        }
      });
    }
  }
}

async function sendVerificationEmail(email: string) {
  // Implement actual API call to send verification email
  await delay(1500);
}
