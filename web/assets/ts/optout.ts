import { LoadingButton, type LoadingButtonElement } from "./loadingButton";
import { delay } from "./utils";

export function initializeOptOutPage() {
  const optoutForm = document.getElementById("optoutForm");
  if (optoutForm) {
    const optoutBtn = document.getElementById("optoutBtn");
    const step1 = document.getElementById("optout-step-1");
    const step2 = document.getElementById("optout-step-2");
    const verificationMessage = document.getElementById("verification-message");
    const optoutFormTyped = optoutForm as HTMLFormElement | null;
    const optoutBtnTyped = optoutBtn as LoadingButtonElement | null;
    const step1Typed = step1 as HTMLElement | null;
    const step2Typed = step2 as HTMLElement | null;
    const verificationMessageTyped = verificationMessage as HTMLElement | null;
    const optoutMethodBtnsTyped = Array.from(document.querySelectorAll<LoadingButtonElement>(".optout-method-btn"));

    // Check URL parameters to determine which view to show
    const urlParams = new URLSearchParams(window.location.search);
    const emailToken = urlParams.get("email_token");

    if (emailToken) {
      // If email is confirmed, show opt-out methods
      step1Typed?.classList.add("d-none");
      step2Typed?.classList.remove("d-none");
      // Add click event listener to all opt-out method buttons
      for (const btn of optoutMethodBtnsTyped) {
        btn.addEventListener("click", async (e: MouseEvent) => {
          e.preventDefault();

          // Find the adjacent success message
          const successMessage = btn.parentElement?.querySelector<HTMLElement>(".success-message");
          const loadingButton = LoadingButton.getOrCreateInstance(btn);
          loadingButton.start();
          await optOut(emailToken, btn.dataset.optout);
          loadingButton.stop();
          successMessage?.classList.remove("d-none");
          if (successMessage) {
            successMessage.style.opacity = "0";
            successMessage.style.transition = "opacity 0.3s ease-in-out";
            setTimeout(() => {
              successMessage.style.opacity = "1";
            }, 10);
          }
        });
      }
    }

    if (optoutFormTyped && optoutBtnTyped && verificationMessageTyped) {
      optoutFormTyped.addEventListener("submit", async (e: Event) => {
        const emailInput = document.getElementById("emailInput") as HTMLInputElement | null;
        if (emailInput?.value && emailInput.value.length > 0) {
          e.preventDefault();

          const loadingButton = LoadingButton.getOrCreateInstance(optoutBtnTyped);
          // Start loading animation
          loadingButton.start();
          await sendOptOutEmail(emailInput.value);
          loadingButton.stop();
          const cardRow = document.querySelector<HTMLElement>(".card-glow .row");
          cardRow?.classList.add("d-none");
          verificationMessageTyped.classList.remove("d-none");
        }
      });
    }
  }
}

async function sendOptOutEmail(email: string) {
  // Simulate an API call to send the opt-out email
  console.log(`Sending opt-out email to ${email}`);
  await delay(2000);
}

async function optOut(emailToken: string, method: string | undefined) {
  // Simulate an API call to opt out the user
  console.log(`Opting out using token ${emailToken} via ${method}`);
  await delay(2000);
}
