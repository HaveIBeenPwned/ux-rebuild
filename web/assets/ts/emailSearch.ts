import { LoadingButton, type LoadingButtonElement } from "./loadingButton";

/**
 * Initialize the breach timeline functionality
 */
export function initEmailSearch() {
  // Email search functionality
  const emailInput = document.getElementById("emailInput") as HTMLInputElement | null;
  const checkButton = document.getElementById("checkButton") as LoadingButtonElement | null;
  const breachTimeline = document.getElementById("breachTimeline") as HTMLElement | null;

  if (emailInput && checkButton && breachTimeline) {
    emailInput.addEventListener("input", function (this: HTMLInputElement) {
      if (this.value.trim() !== "") {
        this.classList.remove("is-invalid");
      }
    });

    checkButton.addEventListener("click", async (e) => {
      e.preventDefault(); // Prevent default form submission
      const email = emailInput.value.trim();

      if (email === "") {
        // Show validation error if email is empty
        emailInput.classList.add("is-invalid");
        return;
      }

      const loadingButton = LoadingButton.getInstance(checkButton);
      loadingButton?.start();
      await performSearch(emailInput, breachTimeline);
      loadingButton?.stop();

      // Clear any previous validation errors
      emailInput.classList.remove("is-invalid");

      // Show the breach timeline section
      breachTimeline.classList.remove("d-none");

      // Scroll to the breach timeline section
      breachTimeline.scrollIntoView({ behavior: "smooth" });
    });
  }

  // NotifyMe button functionality
  const notifyMeBtn = document.getElementById("notifyMeBtn") as HTMLButtonElement | null;

  if (notifyMeBtn && emailInput) {
    notifyMeBtn.addEventListener("click", (e: MouseEvent) => {
      // Get the email from the search input
      const email = emailInput.value.trim();

      if (email) {
        // Store the email in session storage for use on the notifications page
        sessionStorage.setItem("searchedEmail", email);
      }
    });
  }
}

async function performSearch(emailInput: HTMLInputElement, breachTimeline: HTMLElement) {
  const email = emailInput.value.trim();

  // Simulate an API call to check for breaches
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (email && isValidEmail(email)) {
    // In a real app, you would call an API to check if the email has been pwned
    // For demo purposes, we'll just show the breach timeline
    breachTimeline.classList.remove("d-none");

    // Store the email in session storage for use on the notifications page
    sessionStorage.setItem("searchedEmail", email);

    // Scroll to results
    breachTimeline.scrollIntoView({ behavior: "smooth" });
  } else {
    alert("Please enter a valid email address.");
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
