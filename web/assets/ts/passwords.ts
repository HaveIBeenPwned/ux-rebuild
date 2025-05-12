import { LoadingButton, type LoadingButtonElement } from "./loadingButton";
import { delay } from "./utils";

export function initializePwnedPasswordsSearch() {
  // Password checking functionality
  const passwordForm = document.getElementById("passwordForm") as HTMLFormElement;

  if (passwordForm) {
    const passwordInput = document.getElementById("passwordInput") as HTMLInputElement;
    const checkButton = document.getElementById("checkButton") as LoadingButtonElement;
    const goodResult = document.getElementById("pwned-result-good") as HTMLElement;
    const badResult = document.getElementById("pwned-result-bad") as HTMLElement;
    const occurrenceCount = document.getElementById("occurrence-count") as HTMLElement;

    // Hide results initially
    goodResult.classList.add("d-none");
    badResult.classList.add("d-none");

    // Add opacity classes for transition
    goodResult.classList.add("opacity-0");
    badResult.classList.add("opacity-0");

    // Add transition CSS
    goodResult.style.transition = "opacity 0.4s ease-in-out";
    badResult.style.transition = "opacity 0.4s ease-in-out";

    // Handle form submissions (Enter key)
    passwordForm.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      await handlePasswordCheck();
    });

    // Handle direct button clicks
    checkButton.addEventListener("click", async (e: MouseEvent) => {
      e.preventDefault();
      await handlePasswordCheck();
    });

    // Function to handle password checking
    async function handlePasswordCheck() {
      const password: string = passwordInput.value.trim();

      if (!password) {
        // Empty password, don't do anything
        return;
      }

      // Hide any previous results with animation
      await hideResultsWithAnimation();

      // Manually trigger the loading state
      if (!checkButton.loadingButton) {
        // Initialize if not already done
        checkButton.loadingButton = new LoadingButton(checkButton, {
          loadingClass: "is-loading",
          disableButton: true,
          resetAfter: 0,
        });
      }

      // Start loading animation
      checkButton.loadingButton.start();

      // Simulate API call
      const results = await Promise.all([checkPasswordSecurity(password), delay(100 + Math.random() * 200)]);
      const prevalence = results[0];
      // Stop loading animation
      if (checkButton.loadingButton) {
        checkButton.loadingButton.stop();
      }

      if (prevalence > 0) {
        showPwnedResult(prevalence);
      } else {
        showSafeResult();
      }

      // Function to hide results with animation
      async function hideResultsWithAnimation() {
        // If neither result is visible, no need for animation
        if (goodResult.classList.contains("d-none") && badResult.classList.contains("d-none")) {
          return Promise.resolve();
        }

        // Add opacity-0 class to start fade-out animation
        if (!goodResult.classList.contains("d-none")) {
          goodResult.classList.add("opacity-0");
        }

        if (!badResult.classList.contains("d-none")) {
          badResult.classList.add("opacity-0");
        }

        // Wait for animation to complete
        await delay(400);

        // Hide elements after fade-out completes
        goodResult.classList.add("d-none");
        badResult.classList.add("d-none");
      }

      function showPwnedResult(count: number) {
        goodResult.classList.add("d-none");
        badResult.classList.remove("d-none");

        // Format the count with commas
        occurrenceCount.textContent = count.toLocaleString();

        // Scroll to results
        badResult.scrollIntoView({ behavior: "smooth", block: "center" });

        // Trigger animation after a brief delay to ensure DOM has updated
        setTimeout(() => {
          badResult.classList.remove("opacity-0");
        }, 50);
      }

      function showSafeResult() {
        badResult.classList.add("d-none");
        goodResult.classList.remove("d-none");

        // Scroll to results
        goodResult.scrollIntoView({ behavior: "smooth", block: "center" });

        // Trigger animation after a brief delay to ensure DOM has updated
        setTimeout(() => {
          goodResult.classList.remove("opacity-0");
        }, 50);
      }
    }
  }
}

async function checkPasswordSecurity(password: string) {
  // For demo purposes, we'll consider common passwords as "pwned"
  const commonPasswords: string[] = ["password", "123456", "qwerty", "admin", "welcome", "password123"];

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  if (commonPasswords.includes(password.toLowerCase())) {
    // Password found in breach database
    const fakeCount: number = Math.floor(Math.random() * 5000000) + 1000000;
    return fakeCount;
  }
  // Password not found
  return 0;
}
