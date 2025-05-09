import { Tab, Tooltip } from "bootstrap";
import { initializePopovers } from "./utils";
import { setupDomainManagement } from "./Dashboard/domain_search";
import { showReturnNotification } from "./Dashboard/dashboard_utils";
import { setupStealerLogsNavigation } from "./Dashboard/stealer_logs";
import { setupNotificationToggle } from "./Dashboard/notification_toggle";
import { setupSubscriptionManagement } from "./Dashboard/subscription_management";
import { setupApiKeyGeneration } from "./Dashboard/api_keys";

// Dashboard internal functionality
export function initializeDashboardInternal() {
  // Set the user's email and initial in the UI
  const userEmailElement = document.getHtmlElementById<HTMLElement>("userEmail");
  const userInitialElement = document.getHtmlElementById<HTMLElement>("userInitial");

  if (userEmailElement && userInitialElement) {
    // Get the email from localStorage
    const email: string | null = localStorage.getItem("hibp_verified_email");

    // If no email is found, redirect to the dashboard login page
    if (!email) {
      window.location.href = "dashboard.html";
      return;
    }

    /*
    if (userEmailElement) {
      userEmailElement.textContent = email;
    }

    if (userInitialElement) {
      userInitialElement.innerHTML = `<span>${email.charAt(0).toUpperCase()}</span>`;
    }
    */

    // Initialize all popovers on page load
    initializePopovers();

    // Logout button functionality
    const logoutButton = document.getHtmlElementById<HTMLButtonElement>("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        // Clear the verified email from local storage
        localStorage.removeItem("hibp_verified_email");

        // Redirect to the dashboard login page
        window.location.href = "dashboard.html";
      });
    }

    // Enable URL hash updates when tabs are changed
    const tabLinks = document.queryHtmlElements<HTMLAnchorElement>('[data-bs-toggle="pill"]');
    if (tabLinks.length > 0) {
      for (const link of tabLinks) {
        link.addEventListener("shown.bs.tab", (event) => {
          if (event.target && event.target instanceof HTMLAnchorElement && event.target.hash.startsWith("#")) {
            // Update URL with the tab ID, but don't add history entry
            window.history.replaceState(null, "", event.target.hash);
          }
        });
      }

      // Activate the tab based on URL hash on page load
      if (window.location.hash) {
        const hash = window.location.hash;
        const tabToActivate = document.querySelector(`[href="${hash}"]`);
        if (tabToActivate) {
          const tab = new Tab(tabToActivate);
          tab.show();
        }
      }
    }
  }

  // Setup stealer logs navigation from breaches table
  setupStealerLogsNavigation();

  // Run Full Scan button functionality
  const runFullScanButton = document.getHtmlElementById<HTMLButtonElement>("runFullScanButton");
  if (runFullScanButton) {
    runFullScanButton.addEventListener("click", (event) => {
      event.preventDefault();
      console.log("Full scan button clicked");

      // Update button to show loading state
      const originalContent = runFullScanButton.innerHTML;
      runFullScanButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Scanning...';
      runFullScanButton.disabled = true;

      // Simulate scanning process (3 seconds)
      setTimeout(() => {
        console.log("Scan timeout complete, showing results");
        // Restore button
        runFullScanButton.innerHTML = originalContent;
        runFullScanButton.disabled = false;

        // Show scan complete alert
        const alertHtml = `
            <div class="alert alert-success alert-dismissible fade show mb-4" role="alert">
              <div class="d-flex">
                <i class="bi bi-check-circle-fill me-2 fs-5"></i>
                <div>
                  <strong>Scan complete!</strong> Your results are up to date.
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            </div>
          `;

        // Get the overview tab's first card
        const overviewTab = document.querySelector("#overview .card:first-child .card-body") as HTMLElement | null;

        console.log("Overview tab element:", overviewTab);

        if (overviewTab) {
          // Create temporary div to hold our HTML
          const temp = document.createElement("div");
          temp.innerHTML = alertHtml;

          // Find the target insertion point
          const insertTarget = overviewTab.querySelector("div.d-flex.justify-content-between");
          console.log("Insert target:", insertTarget);

          if (insertTarget && temp.firstChild) {
            // Insert at the beginning of the card body (before the d-flex element)
            overviewTab.insertBefore(temp.firstChild, insertTarget);
          } else {
            if (temp.firstChild) {
              // Fallback if the target element is not found - prepend to the card body
              overviewTab.prepend(temp.firstChild);
            }
          }
        } else {
          // Fallback if overview tab not found - add to return notification placeholder
          const returnNotification = document.getHtmlElementById<HTMLElement>("returnNotificationPlaceholder");
          if (returnNotification) {
            returnNotification.innerHTML = alertHtml;
          } else {
            console.error("Could not find a place to insert the alert notification");
          }
        }
      }, 3000);
    });
  }

  // Set up notification toggle
  setupNotificationToggle();

  // Set up logout button
  setupLogoutButton();

  // Run full scan button
  setupRunFullScanButton();

  // Initialize domain management
  setupDomainManagement();

  // Initialize subscription management
  setupSubscriptionManagement();

  // Setup API key generation functionality
  setupApiKeyGeneration();

  // Check for notification confirmation
  const urlParams = new URLSearchParams(window.location.search);
  const notificationConfirmed = urlParams.get("notification_confirmed");
  const notificationSuccess = document.getHtmlElementById<HTMLElement>("notificationSuccess");

  if (notificationConfirmed === "true" && notificationSuccess) {
    notificationSuccess.classList.remove("d-none");

    // Auto-hide the message after 10 seconds
    setTimeout(() => {
      notificationSuccess.classList.add("d-none");
    }, 10000);
  }
}

function setupLogoutButton() {
  const logoutButton = document.getHtmlElementById<HTMLElement>("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // In a real application, this would call a logout API endpoint
      // For this demo, we'll just redirect to the login page
      window.location.href = "dashboard.html";
    });
  }
}

function setupRunFullScanButton() {
  const runFullScanButton = document.getHtmlElementById<HTMLButtonElement>("runFullScanButton");
  if (runFullScanButton) {
    runFullScanButton.addEventListener("click", (e) => {
      e.preventDefault();
      // Show a loading message
      showReturnNotification("info", "Running full scan... This may take a few moments.");

      // In a real app, this would trigger an API call to perform the scan
      // For this demo, we'll just show a success message after a delay
      setTimeout(() => {
        showReturnNotification("success", "Scan completed successfully. No new breaches found.");
      }, 3000);
    });
  }
}
