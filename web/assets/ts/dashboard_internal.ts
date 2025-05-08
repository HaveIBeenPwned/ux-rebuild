import { Alert, Modal, Popover, Tab, Tooltip } from "bootstrap";

// Dashboard internal functionality
export function initializeDashboardInternal() {
  // Set the user's email and initial in the UI
  const userEmailElement = document.getElementById("userEmail") as HTMLElement | null;
  const userInitialElement = document.getElementById("userInitial") as HTMLElement | null;

  if (userEmailElement && userInitialElement) {
    // Get the email from localStorage
    const email: string | null = localStorage.getItem("hibp_verified_email");

    // If no email is found, redirect to the dashboard login page
    if (!email) {
      window.location.href = "dashboard.html";
      return;
    }

    if (userEmailElement) {
      userEmailElement.textContent = email;
    }

    if (userInitialElement) {
      userInitialElement.innerHTML = `<span>${email.charAt(0).toUpperCase()}</span>`;
    }

    // Initialize all popovers on page load
    initializePopovers();

    // Logout button functionality
    const logoutButton = document.getElementById("logoutButton") as HTMLElement | null;
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        // Clear the verified email from local storage
        localStorage.removeItem("hibp_verified_email");

        // Redirect to the dashboard login page
        window.location.href = "dashboard.html";
      });
    }

    // Enable URL hash updates when tabs are changed
    const tabLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-bs-toggle="pill"]'));
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
  const runFullScanButton = document.getElementById("runFullScanButton") as HTMLButtonElement | null;
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
          const returnNotification = document.getElementById("returnNotificationPlaceholder") as HTMLElement | null;
          if (returnNotification) {
            returnNotification.innerHTML = alertHtml;
          } else {
            console.error("Could not find a place to insert the alert notification");
          }
        }
      }, 3000);
    });
  }

  // Set user info
  setUserInfo();

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
  const notificationSuccess = document.getElementById("notificationSuccess") as HTMLElement | null;

  if (notificationConfirmed === "true" && notificationSuccess) {
    notificationSuccess.classList.remove("d-none");

    // Auto-hide the message after 10 seconds
    setTimeout(() => {
      notificationSuccess.classList.add("d-none");
    }, 10000);
  }
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

function setUserInfo(): void {
  // Mock user data - in a real app, this would come from the server
  const user: User = {
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
  };

  // Set user email in the sidebar
  const userEmailElement = document.getElementById("userEmail") as HTMLElement | null;
  if (userEmailElement) {
    userEmailElement.textContent = user.email;
  }

  // Set user initial in the avatar
  const userInitialElement = document.getElementById("userInitial") as HTMLElement | null;
  if (userInitialElement) {
    userInitialElement.textContent = user.firstName.charAt(0);
  }

  // Also set it in the notification email field
  const notificationEmailElement = document.getElementById("notificationEmail") as HTMLInputElement | null;
  if (notificationEmailElement) {
    notificationEmailElement.value = user.email;
  }
}

function setupNotificationToggle(): void {
  const notificationsSwitch = document.getElementById("notificationsSwitch") as HTMLInputElement | null;
  const notificationStatus = document.getElementById("notificationStatus") as HTMLElement | null;
  const saveButton = document.getElementById("saveNotificationPreferences") as HTMLButtonElement | null;
  const notificationBadge = document.querySelector('a[href="#notifications"] .badge') as HTMLElement | null;
  const notificationEmail = document.getElementById("notificationEmail") as HTMLInputElement | null;
  const digestEmailCheck = document.getElementById("digestEmailCheck") as HTMLInputElement | null;

  // Initial form state
  let initialEmail = "";
  let initialDigestSetting = false;

  if (notificationEmail) {
    initialEmail = notificationEmail.value;
  }

  if (digestEmailCheck) {
    initialDigestSetting = digestEmailCheck.checked;
  }

  if (notificationsSwitch && notificationStatus && saveButton) {
    // When the switch is toggled
    notificationsSwitch.addEventListener("change", function () {
      if (this.checked) {
        notificationStatus.textContent = "On";
        notificationStatus.classList.remove("text-danger");
        notificationStatus.classList.add("text-success");
        enableSaveButton();
      } else {
        notificationStatus.textContent = "Off";
        notificationStatus.classList.remove("text-success");
        notificationStatus.classList.add("text-danger");
        enableSaveButton();
      }
    });

    // When the email is changed
    if (notificationEmail) {
      notificationEmail.addEventListener("input", () => {
        enableSaveButton();
      });
    }

    // When the digest setting is changed
    if (digestEmailCheck) {
      digestEmailCheck.addEventListener("change", () => {
        enableSaveButton();
      });
    }

    // When the save button is clicked
    saveButton.addEventListener("click", () => {
      // Here you would typically save the preferences to the server
      // For this demo, we'll just update the UI

      if (notificationsSwitch.checked) {
        if (notificationBadge) {
          notificationBadge.textContent = "On";
          notificationBadge.classList.remove("bg-danger");
          notificationBadge.classList.add("bg-success");
        }

        // Show a success message
        showReturnNotification("success", "Notifications enabled successfully.");
      } else {
        if (notificationBadge) {
          notificationBadge.textContent = "Off";
          notificationBadge.classList.remove("bg-success");
          notificationBadge.classList.add("bg-danger");
        }

        // Show a success message
        showReturnNotification("success", "Notifications disabled successfully.");
      }

      // Update the initial values
      if (notificationEmail) {
        initialEmail = notificationEmail.value;
      }

      if (digestEmailCheck) {
        initialDigestSetting = digestEmailCheck.checked;
      }

      // Disable the save button
      saveButton.setAttribute("disabled", "disabled");
    });
  }

  // Helper function to enable the save button
  function enableSaveButton(): void {
    if (saveButton) {
      const emailChanged = notificationEmail && notificationEmail.value !== initialEmail;
      const digestChanged = digestEmailCheck && digestEmailCheck.checked !== initialDigestSetting;

      if (emailChanged || digestChanged) {
        saveButton.removeAttribute("disabled");
      }
    }
  }
}

function setupLogoutButton(): void {
  const logoutButton = document.getElementById("logoutButton") as HTMLElement | null;
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // In a real application, this would call a logout API endpoint
      // For this demo, we'll just redirect to the login page
      window.location.href = "dashboard.html";
    });
  }
}

function setupRunFullScanButton(): void {
  const runFullScanButton = document.getElementById("runFullScanButton") as HTMLButtonElement | null;
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

function showReturnNotification(type: string, message: string): void {
  const notificationPlaceholder = document.getElementById("returnNotificationPlaceholder") as HTMLElement | null;
  if (notificationPlaceholder) {
    // Create alert element
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = "alert";

    // Add icon based on type
    let icon = "";
    switch (type) {
      case "success":
        icon = '<i class="bi bi-check-circle-fill me-2"></i>';
        break;
      case "danger":
        icon = '<i class="bi bi-exclamation-circle-fill me-2"></i>';
        break;
      case "warning":
        icon = '<i class="bi bi-exclamation-triangle-fill me-2"></i>';
        break;
      case "info":
        icon = '<i class="bi bi-info-circle-fill me-2"></i>';
        break;
    }

    // Set alert content
    alert.innerHTML = `
        <div class="d-flex">
          ${icon}
          <div>${message}</div>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;

    // Clear previous alerts
    notificationPlaceholder.innerHTML = "";

    // Append the alert
    notificationPlaceholder.appendChild(alert);

    // Automatically dismiss after 5 seconds
    setTimeout(() => {
      const bsAlert = new Alert(alert);
      bsAlert.close();
    }, 5000);
  }
}

function initializePopovers(): void {
  // Initialize all popovers
  const popoverTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
  const popoverList = [...popoverTriggerList].map((popoverTriggerEl) => new Popover(popoverTriggerEl));

  // Initialize all tooltips
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  [...tooltipTriggerList].map((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
}

// Domain management functionality
function setupDomainManagement(): void {
  // Check if we have domains to display
  const hasVerifiedDomains = localStorage.getItem("hibp_has_domains") === "true";
  const noDomainView = document.getElementById("noDomainView") as HTMLElement | null;
  const domainsTableView = document.getElementById("domainsTableView") as HTMLElement | null;

  if (noDomainView && domainsTableView) {
    if (hasVerifiedDomains) {
      // Show the domains table and hide the empty state
      noDomainView.classList.add("d-none");
      domainsTableView.classList.remove("d-none");
    } else {
      // Show the empty state and hide the domains table
      noDomainView.classList.remove("d-none");
      domainsTableView.classList.add("d-none");
    }
  }

  // Set up domain search functionality
  setupDomainSearch();

  // Set up verification method selection
  setupVerificationMethodSelection();

  // Set up domain verification button
  setupDomainVerification();

  // Set up domain removal functionality
  setupDomainRemoval();

  // Add global modal cleanup handler
  // TODO: Need to investigate why this is needed
  setupModalCleanup();
}

// Handle domain search functionality with slide animation
function setupDomainSearch(): void {
  const searchButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".domain-search-btn"));
  const domainListView = document.getElementById("domainListView") as HTMLElement | null;
  const domainSearchView = document.getElementById("domainSearchView") as HTMLElement | null;
  const searchDomainTitle = document.getElementById("searchDomainTitle") as HTMLElement | null;
  const domainSearchBackBtn = document.getElementById("domainSearchBackBtn") as HTMLElement | null;
  const domainSearchResults = document.getElementById("domainSearchResults") as HTMLElement | null;
  const searchFilter = document.getElementById("domainSearchFilter") as HTMLInputElement | null;
  const searchBreachFilter = document.getElementById("domainSearchBreachFilter") as HTMLSelectElement | null;

  // Initialize popovers and tooltips for the domain search view
  initializePopovers();

  if (!searchButtons.length || !domainListView || !domainSearchView) {
    return; // Required elements not found
  }

  // Add event listeners to search buttons
  for (const button of searchButtons) {
    button.addEventListener("click", function () {
      const domain = this.getAttribute("data-domain");
      showDomainSearchResults(domain);
    });
  }

  // Back button functionality
  if (domainSearchBackBtn) {
    domainSearchBackBtn.addEventListener("click", hideDomainSearchResults);
  }

  // Filter functionality
  if (searchFilter) {
    searchFilter.addEventListener("input", function () {
      filterDomainSearchResults(this.value);
    });
  }

  // Breach filter functionality
  if (searchBreachFilter) {
    searchBreachFilter.addEventListener("change", function () {
      sortDomainSearchResults(this.value);
    });
  }

  // Function to show domain search results with animation
  function showDomainSearchResults(domain: string | null): void {
    // Update the domain title
    if (searchDomainTitle) {
      searchDomainTitle.textContent = domain || "";
    }

    // Update domain stats in the summary cards
    updateDomainSummaryStats(domain);

    // Clear previous results
    if (domainSearchResults) {
      domainSearchResults.innerHTML = "";
    }

    // Load mock data for demo
    loadMockDomainSearchResults(domain);

    // Initialize popovers for the domain summary cards
    initializePopovers();

    // First fade out domain list view
    if (domainListView) {
      domainListView.style.opacity = "0";
    }

    // After short delay, hide domain list and show search view
    setTimeout(() => {
      // Hide domain list and show search view
      if (domainListView) {
        domainListView.classList.add("slide-left");
      }
      if (domainSearchView) {
        domainSearchView.classList.add("slide-left");
      }

      // Fade in search view
      setTimeout(() => {
        if (domainSearchView) {
          domainSearchView.style.opacity = "1";
        }
      }, 50);
    }, 300);
  }

  // Helper function to update domain summary statistics
  function updateDomainSummaryStats(domain: string | null): void {
    // Find the row in the domains table for this domain to get the stats
    const domainRow = document.querySelector(`button[data-domain=""]`)?.closest("tr");

    // Get the stats elements
    const totalBreachedEl = document.getElementById("totalBreachedAddresses") as HTMLElement | null;
    const nonSpamBreachedEl = document.getElementById("nonSpamBreachedAddresses") as HTMLElement | null;
    const stealerLogEl = document.getElementById("stealerLogAddresses") as HTMLElement | null;

    if (domainRow) {
      // In a real app, we'd get this from an API, but for demo we'll use the table data
      const addressCount = domainRow.querySelector("td:nth-child(2)")?.textContent || "0";
      const stealerLogCount = domainRow.querySelector("td:nth-child(3)")?.textContent || "0";

      // Calculate a reasonable value for non-spam breaches (in a real app this would be from API)
      // For demo purposes, we'll use about 80% of total breaches
      const totalAddresses = Number.parseInt(addressCount.replace(/,/g, ""));
      const nonSpamAddresses = Math.round(totalAddresses * 0.78);

      // Update the UI elements
      if (totalBreachedEl) totalBreachedEl.textContent = addressCount;
      if (nonSpamBreachedEl) nonSpamBreachedEl.textContent = nonSpamAddresses.toLocaleString();
      if (stealerLogEl) stealerLogEl.textContent = stealerLogCount;
    } else {
      // Fallback to mock data if domain row not found
      if (totalBreachedEl) totalBreachedEl.textContent = "1,245";
      if (nonSpamBreachedEl) nonSpamBreachedEl.textContent = "972";
      if (stealerLogEl) stealerLogEl.textContent = "17";
    }
  }

  // Function to hide domain search results with animation
  function hideDomainSearchResults(): void {
    // First fade out search view
    if (domainSearchView) {
      domainSearchView.style.opacity = "0";
    }

    // After short delay, hide search view and show domain list
    setTimeout(() => {
      // Hide search view and show domain list
      if (domainListView) {
        domainListView.classList.remove("slide-left");
      }
      if (domainSearchView) {
        domainSearchView.classList.remove("slide-left");
      }

      // Fade in domain list
      setTimeout(() => {
        if (domainListView) {
          domainListView.style.opacity = "1";
        }
      }, 50);
    }, 300);
  }

  // Global variables to store the full dataset and current view state
  let allEmailData: { email: string; breaches: number; pwnedSites: string }[] = [];
  let filteredEmailData: { email: string; breaches: number; pwnedSites: string }[] = [];
  let currentFilter = "";
  let currentSortBy = "all";

  // Function to load mock search results
  function loadMockDomainSearchResults(domain: string | null): void {
    // Generate more mock email addresses for the domain (3 pages worth)
    allEmailData = [
      { email: "info@", breaches: 8, pwnedSites: "Adobe, LinkedIn, Dropbox, Yahoo, Canva, Quora, MySpace, MyFitnessPal" },
      { email: "contact@", breaches: 5, pwnedSites: "Adobe, LinkedIn, Dropbox, Yahoo, Quora" },
      { email: "support@", breaches: 7, pwnedSites: "Adobe, LinkedIn, Dropbox, Yahoo, Canva, Quora, MyFitnessPal" },
      { email: "admin@", breaches: 10, pwnedSites: "Adobe, LinkedIn, Dropbox, Yahoo, Canva, Quora, MySpace, MyFitnessPal, Tumblr, Zynga" },
      { email: "webmaster@", breaches: 4, pwnedSites: "Adobe, LinkedIn, Yahoo, Tumblr" },
      { email: "sales@", breaches: 6, pwnedSites: "Adobe, LinkedIn, Dropbox, Yahoo, Canva, Quora" },
      { email: "marketing@", breaches: 3, pwnedSites: "LinkedIn, Dropbox, Yahoo" },
      { email: "help@", breaches: 2, pwnedSites: "Adobe, LinkedIn" },
      { email: "billing@", breaches: 5, pwnedSites: "Adobe, LinkedIn, Yahoo, Canva, MyFitnessPal" },
      { email: "hr@", breaches: 7, pwnedSites: "Adobe, LinkedIn, Dropbox, Yahoo, Canva, MySpace, MyFitnessPal" },
      { email: "developers@", breaches: 6, pwnedSites: "LinkedIn, Adobe, Dropbox, GitHub, Canva, MyFitnessPal" },
      { email: "media@", breaches: 3, pwnedSites: "Snapchat, Adobe, Canva" },
      { email: "editor@", breaches: 4, pwnedSites: "Adobe, Dropbox, LinkedIn, Quora" },
      { email: "subscriptions@", breaches: 2, pwnedSites: "Adobe, Canva" },
      { email: "abuse@", breaches: 1, pwnedSites: "Dropbox" },
      { email: "no-reply@", breaches: 3, pwnedSites: "LinkedIn, Tumblr, Zynga" },
      { email: "payments@", breaches: 5, pwnedSites: "Adobe, LinkedIn, Dropbox, Marriott, eBay" },
      { email: "privacy@", breaches: 4, pwnedSites: "Adobe, LinkedIn, Yahoo, Evernote" },
    ];

    // Initialize with all data
    filteredEmailData = [...allEmailData];

    // Set default filter to 'all' and apply
    currentSortBy = "all";
    // Sort by breach count
    filteredEmailData.sort((a, b) => b.breaches - a.breaches);

    // Update the result count
    updateResultCount();

    // Display all results
    displayAllResults();
  }

  // Function to display all results
  function displayAllResults(): void {
    // Clear previous results
    if (domainSearchResults) {
      domainSearchResults.innerHTML = "";
    }

    // Update the result count
    updateResultCount();

    // Display all the data
    for (const item of filteredEmailData) {
      const row = document.createElement("tr");
      row.className = "domain-search-result-item";
      row.innerHTML = `
          <td>${item.email}</td>
          <td class="text-end">${item.breaches}</td>
          <td>${item.pwnedSites}</td>
        `;
      if (domainSearchResults) {
        domainSearchResults.appendChild(row);
      }
    }
  }

  // Helper function to update the result count display
  function updateResultCount(): void {
    const countElement = document.getElementById("domainSearchResultCount") as HTMLElement | null;
    if (countElement) {
      countElement.textContent = filteredEmailData.length.toString();
    }
  }

  // Function to filter search results
  function filterDomainSearchResults(query: string): void {
    currentFilter = query.toLowerCase();

    // Filter the full dataset
    if (currentFilter === "") {
      filteredEmailData = [...allEmailData]; // Reset to all data if filter is empty
    } else {
      filteredEmailData = allEmailData.filter((item) => {
        // Only filter by email alias now
        const emailMatch = item.email.toLowerCase().includes(currentFilter);
        return emailMatch;
      });
    }

    // Sort by breach count
    filteredEmailData.sort((a, b) => b.breaches - a.breaches);

    // Update the result count
    updateResultCount();

    // Show all results
    displayAllResults();
  }

  // Function to sort/filter search results
  function sortDomainSearchResults(filterValue: string): void {
    currentSortBy = filterValue;

    // First, reset to all filtered data based on the text search filter
    if (currentFilter === "") {
      filteredEmailData = [...allEmailData];
    } else {
      filteredEmailData = allEmailData.filter((item) => {
        const emailMatch = item.email.toLowerCase().includes(currentFilter);
        return emailMatch;
      });
    }

    // Then apply the breach filter if not showing all
    if (filterValue !== "all") {
      // For demo purposes, we're using LinkedIn as the most recent breach
      const recentBreachName = "LinkedIn";

      // Filter to only show emails affected by the recent breach
      filteredEmailData = filteredEmailData.filter((item) => item.pwnedSites.includes(recentBreachName));
    }

    // Sort by breach count as default
    filteredEmailData.sort((a, b) => b.breaches - a.breaches);

    // Update the result count
    updateResultCount();

    // Display all results
    displayAllResults();
  }
}

function setupVerificationMethodSelection(): void {
  // With Bootstrap's tab component, we don't need to manually handle tab switching
  // as it's handled by Bootstrap's JavaScript.
  // We just need to initialize the tabs if needed.

  // Store the current verification method when a tab is clicked
  const tabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("#verificationTabs .nav-link"));

  for (const tab of tabButtons) {
    tab.addEventListener("shown.bs.tab", (event) => {
      if (event.target && event.target instanceof HTMLElement) {
        // Get the ID of the activated tab (without the -tab suffix)
        const activeMethod = event.target.id.replace("-tab", "");
        // Store this as the current method - useful when verifying
        localStorage.setItem("current_verification_method", activeMethod);
      }
    });
  }

  // Initialize with DNS as the default method
  localStorage.setItem("current_verification_method", "dns");
}

function setupDomainVerification(): void {
  // Get elements for step 1
  const domainInputStep = document.getElementById("domainInputStep") as HTMLElement | null;
  const domainLoadingStep = document.getElementById("domainLoadingStep") as HTMLElement | null;
  const verificationMethodsStep = document.getElementById("verificationMethodsStep") as HTMLElement | null;
  const continueButton = document.getElementById("continueToDomainVerification") as HTMLButtonElement | null;
  const domainInput = document.getElementById("domainInput") as HTMLInputElement | null;
  const goBackButton = document.getElementById("goBackButton") as HTMLButtonElement | null;

  // Get elements for step 2
  const verifyButton = document.getElementById("verifyButton") as HTMLButtonElement | null;
  const verificationSpinner = document.getElementById("verificationSpinner") as HTMLElement | null;
  const tabContent = document.getElementById("verificationTabContent") as HTMLElement | null;

  // Handle the continue button to move from step 1 to loading to step 2
  if (continueButton && domainInput) {
    continueButton.addEventListener("click", () => {
      const domain = domainInput.value.trim();

      if (!domain) {
        domainInput.classList.add("is-invalid");
        return;
      }

      // Hide step 1, show loading step
      if (domainInputStep) {
        domainInputStep.classList.add("d-none");
      }
      if (domainLoadingStep) {
        domainLoadingStep.classList.remove("d-none");
      }
      continueButton.classList.add("d-none"); // Hide continue button during loading

      // Remove the data-bs-dismiss attribute from the goBackButton
      // as we don't want it to close the modal in step 2
      if (goBackButton) {
        goBackButton.removeAttribute("data-bs-dismiss");
      }

      // Simulate domain validation (1.2 seconds)
      setTimeout(() => {
        // Hide loading step, show step 2
        if (domainLoadingStep) {
          domainLoadingStep.classList.add("d-none");
        }
        if (verificationMethodsStep) {
          verificationMethodsStep.classList.remove("d-none");
        }
        if (verifyButton) {
          verifyButton.classList.remove("d-none"); // Show the verify button
        }

        // Show the Go Back button when in step 2
        if (goBackButton) {
          goBackButton.classList.remove("d-none");
        }

        // Update domain placeholders in the instructions with the entered domain
        const placeHolders = Array.from(document.querySelectorAll<HTMLElement>(".domain-name-placeholder, #domainNamePlaceholder"));
        for (const placeholder of placeHolders) {
          placeholder.textContent = domain;
        }
      }, 1200);
    });

    // Clear invalid state when input changes
    domainInput.addEventListener("input", function () {
      this.classList.remove("is-invalid");
    });
  }

  // Handle go back button to return to step 1 or close modal depending on current step
  if (goBackButton) {
    goBackButton.addEventListener("click", (event) => {
      // If we're in step 2, go back to step 1 and prevent modal from closing
      if (verificationMethodsStep && !verificationMethodsStep.classList.contains("d-none")) {
        // Prevent the default dismiss behavior
        event.preventDefault();

        // Go back to step 1
        if (domainInputStep) {
          domainInputStep.classList.remove("d-none");
        }
        if (verificationMethodsStep) {
          verificationMethodsStep.classList.add("d-none");
        }
        if (verifyButton) {
          verifyButton.classList.add("d-none"); // Hide the verify button
        }
        if (continueButton) {
          continueButton.classList.remove("d-none"); // Show continue button
        }

        // Hide the Go Back button when back in step 1
        goBackButton.classList.add("d-none");

        // Restore the data-bs-dismiss attribute for step 1
        goBackButton.setAttribute("data-bs-dismiss", "modal");
      }
    });
  }

  // Handle the verify button functionality
  if (verifyButton && domainInput) {
    verifyButton.addEventListener("click", () => {
      const domain = domainInput.value.trim();

      if (!domain) {
        // We shouldn't reach here, but just in case
        if (domainInputStep) {
          domainInputStep.classList.remove("d-none");
        }
        if (verificationMethodsStep) {
          verificationMethodsStep.classList.add("d-none");
        }
        domainInput.classList.add("is-invalid");
        return;
      }

      // Hide tab content and show spinner
      if (verificationSpinner && tabContent) {
        tabContent.classList.add("d-none");
        verificationSpinner.classList.remove("d-none");
      }

      // Simulate verification process (3 seconds)
      setTimeout(() => {
        // Hide the spinner
        if (verificationSpinner) {
          verificationSpinner.classList.add("d-none");
        }

        // Set domains flag in localStorage and update UI
        localStorage.setItem("hibp_has_domains", "true");

        // Hide modal
        const modalElement = document.getElementById("verificationModal");
        if (modalElement) {
          const modal = Modal.getOrCreateInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }

        // Show success message
        showReturnNotification("success", `Domain ${domain} verified successfully! You can now monitor email addresses on this domain.`);

        // Update domain UI
        const noDomainView = document.getElementById("noDomainView") as HTMLElement | null;
        const domainsTableView = document.getElementById("domainsTableView") as HTMLElement | null;

        if (noDomainView && domainsTableView) {
          noDomainView.classList.add("d-none");
          domainsTableView.classList.remove("d-none");
        }
      }, 3000);
    });
  }
}

function setupDomainRemoval(): void {
  const removeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".remove-domain"));
  const confirmRemovalButton = document.getElementById("confirmDomainRemoval") as HTMLButtonElement | null;
  let domainToRemove: string | null = null;

  for (const button of removeButtons) {
    button.addEventListener("click", function () {
      domainToRemove = this.getAttribute("data-domain");
    });
  }

  if (confirmRemovalButton) {
    confirmRemovalButton.addEventListener("click", () => {
      if (domainToRemove) {
        // Remove from UI (in a real app, would remove from database)
        const domainRow = document.querySelector(`button[data-domain="${domainToRemove}"]`)?.closest("tr");
        if (domainRow) {
          domainRow.remove();
        }

        // Check if any domains are left
        const remainingDomains = document.querySelectorAll("#domainsTableBody tr").length;
        if (remainingDomains === 0) {
          // No domains left, update localStorage and UI
          localStorage.setItem("hibp_has_domains", "false");

          const noDomainView = document.getElementById("noDomainView") as HTMLElement | null;
          const domainsTableView = document.getElementById("domainsTableView") as HTMLElement | null;

          if (noDomainView && domainsTableView) {
            noDomainView.classList.remove("d-none");
            domainsTableView.classList.add("d-none");
          }
        }

        // Force cleanup modal and backdrop immediately
        // forceCleanupModalBackdrop();

        // Show success message
        showReturnNotification("success", `Domain ${domainToRemove} has been removed from your account.`);

        // Reset domainToRemove
        domainToRemove = null;
      }
    });
  }
}

function setupModalCleanup(): void {
  const verificationModal = document.getElementById("verificationModal") as HTMLElement | null;

  if (verificationModal) {
    verificationModal.addEventListener("hidden.bs.modal", () => {
      // Reset modal to step 1 when closed
      const domainInputStep = document.getElementById("domainInputStep") as HTMLElement | null;
      const domainLoadingStep = document.getElementById("domainLoadingStep") as HTMLElement | null;
      const verificationMethodsStep = document.getElementById("verificationMethodsStep") as HTMLElement | null;
      const verifyButton = document.getElementById("verifyButton") as HTMLButtonElement | null;
      const continueButton = document.getElementById("continueToDomainVerification") as HTMLButtonElement | null;
      const domainInput = document.getElementById("domainInput") as HTMLInputElement | null;
      const tabContent = document.getElementById("verificationTabContent") as HTMLElement | null;
      const verificationSpinner = document.getElementById("verificationSpinner") as HTMLElement | null;
      const goBackButton = document.getElementById("goBackButton") as HTMLButtonElement | null;

      if (domainInputStep && verificationMethodsStep) {
        // Reset to step 1
        domainInputStep.classList.remove("d-none");
        if (domainLoadingStep) {
          domainLoadingStep.classList.add("d-none");
        }
        verificationMethodsStep.classList.add("d-none");
      }

      if (verifyButton && continueButton) {
        verifyButton.classList.add("d-none");
        continueButton.classList.remove("d-none");
      }

      // Make sure the Go Back button is hidden in step 1
      if (goBackButton) {
        goBackButton.classList.add("d-none");
        goBackButton.setAttribute("data-bs-dismiss", "modal");
      }

      if (domainInput) {
        domainInput.value = "";
        domainInput.classList.remove("is-invalid");
      }

      // Reset the verification flow
      if (tabContent && verificationSpinner) {
        tabContent.classList.remove("d-none");
        verificationSpinner.classList.add("d-none");
      }

      // Reset tab to the first tab (DNS)
      const dnsTab = document.getElementById("dns-tab") as HTMLElement | null;
      if (dnsTab) {
        // Create a new Bootstrap Tab instance and show it
        const bootstrapTab = new Tab(dnsTab);
        bootstrapTab.show();
      }
    });
  }

  // Add global modal cleanup handler for domain removal
  document.addEventListener("hidden.bs.modal", (event) => {
    if ((event.target as HTMLElement).id === "domainRemovalPrompt") {
      // Force cleanup of any lingering modal backdrops
      const modalBackdrops = Array.from(document.querySelectorAll<HTMLElement>(".modal-backdrop"));
      for (const backdrop of modalBackdrops) {
        backdrop.classList.remove("show");
        backdrop.classList.remove("fade");
        backdrop.remove();
      }

      // Restore body styling
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  });
}

// Function to setup navigation from breaches table to stealer logs tab
function setupStealerLogsNavigation(): void {
  // Find all stealer logs links in the breaches table (both badge and button)
  const stealerLogsLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.breach-table-container a[href="#stealer-logs"]'));

  for (const link of stealerLogsLinks) {
    link.addEventListener("click", (event) => {
      // Prevent the default hash change behavior
      event.preventDefault();

      // Get the sidebar link and programmatically click it to activate the tab
      const sidebarLink = document.querySelector('.sidebar-section a[href="#stealer-logs"]') as HTMLElement | null;

      if (sidebarLink) {
        // Create a Bootstrap Tab instance and show it
        const bsTab = new Tab(sidebarLink);
        bsTab.show();
      } else {
        console.error("Sidebar stealer logs link not found");

        // Fallback method if sidebar link isn't found
        const stealerLogsTab = document.querySelector("#stealer-logs") as HTMLElement | null;
        const tabPanes = Array.from(document.querySelectorAll<HTMLElement>(".tab-pane"));

        if (stealerLogsTab) {
          // Hide all tabs
          for (const pane of tabPanes) {
            pane.classList.remove("show", "active");
          }

          // Show stealer logs tab
          stealerLogsTab.classList.add("show", "active");

          // Update URL hash
          window.history.replaceState(null, "", "#stealer-logs");
        }
      }
    });
  }
}

// Setup subscription management
function setupSubscriptionManagement(): void {
  // Elements
  const activeSubscriptionView = document.getElementById("activeSubscriptionView") as HTMLElement | null;
  const noSubscriptionView = document.getElementById("noSubscriptionView") as HTMLElement | null;
  const pricingPlansSection = document.getElementById("pricingPlansSection") as HTMLElement | null;
  const showPricingPlansBtn = document.getElementById("showPricingPlansBtn") as HTMLButtonElement | null;
  const generateQuoteBtn = document.getElementById("generateQuoteBtn") as HTMLButtonElement | null;
  const subscriptionPricingToggle = document.getElementById("subscriptionPricingToggle") as HTMLInputElement | null;
  const priceValues = document.querySelectorAll(".price-value") as NodeListOf<HTMLElement>;
  const pricePeriods = Array.from(document.querySelectorAll<HTMLElement>(".pricing-period"));
  const selectPlanButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".select-plan-btn"));

  // Check if the user has a subscription (mock data - would be from API in real app)
  const hasSubscription = localStorage.getItem("hibp_has_subscription") === "true";

  // Show the appropriate view based on subscription status
  if (activeSubscriptionView && noSubscriptionView) {
    if (hasSubscription) {
      activeSubscriptionView.classList.remove("d-none");
      noSubscriptionView.classList.add("d-none");
    } else {
      activeSubscriptionView.classList.add("d-none");
      noSubscriptionView.classList.remove("d-none");
    }
  }

  // DEMO ONLY: Add a hidden button to toggle subscription status for testing
  const subscriptionTab = document.getElementById("subscription") as HTMLElement | null;
  if (subscriptionTab) {
    const demoToggleBtn = document.createElement("button");
    demoToggleBtn.className = "btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0 m-2";
    demoToggleBtn.style.opacity = "0.5";
    demoToggleBtn.innerHTML = "Toggle Demo State";
    demoToggleBtn.addEventListener("click", () => {
      const currentState = localStorage.getItem("hibp_has_subscription") === "true";
      localStorage.setItem("hibp_has_subscription", (!currentState).toString());

      if (currentState) {
        // Switch to no subscription view
        if (activeSubscriptionView) {
          activeSubscriptionView.classList.add("d-none");
        }
        if (noSubscriptionView) {
          noSubscriptionView.classList.remove("d-none");
        }
        showReturnNotification("info", "Demo: Showing no subscription state");
      } else {
        // Switch to active subscription view
        if (activeSubscriptionView) {
          activeSubscriptionView.classList.remove("d-none");
        }
        if (noSubscriptionView) {
          noSubscriptionView.classList.add("d-none");
        }
        if (pricingPlansSection) {
          pricingPlansSection.classList.add("d-none");
        }
        if (showPricingPlansBtn) {
          showPricingPlansBtn.classList.remove("d-none");
        }
        showReturnNotification("info", "Demo: Showing active subscription state");
      }
    });
    subscriptionTab.appendChild(demoToggleBtn);
  }

  // Price data for subscription plans (monthly and yearly)
  const priceData = [
    { monthly: "$3.95", yearly: "$39.50" },
    { monthly: "$19", yearly: "$190" },
    { monthly: "$32", yearly: "$320" },
    { monthly: "$137", yearly: "$1,370" },
    { monthly: "$274", yearly: "$2,740" },
    { monthly: "Custom", yearly: "Custom" },
    { monthly: "$995", yearly: "$9,950" },
    { monthly: "$1,850", yearly: "$18,500" },
    { monthly: "$2,750", yearly: "$27,500" },
  ];

  // Handle pricing toggle
  if (subscriptionPricingToggle) {
    subscriptionPricingToggle.addEventListener("change", function () {
      const isYearly = this.checked;
      updatePrices(isYearly);
    });
  }

  // Function to update prices based on billing period
  function updatePrices(isYearly: boolean): void {
    priceValues.forEach((priceElement, index) => {
      if (index < priceData.length) {
        priceElement.textContent = isYearly ? priceData[index].yearly : priceData[index].monthly;
      }
    });

    for (const periodElement of pricePeriods) {
      periodElement.textContent = isYearly ? "per year" : "per month";
    }
  }

  // Show pricing plans when button is clicked
  if (showPricingPlansBtn && pricingPlansSection) {
    showPricingPlansBtn.addEventListener("click", () => {
      pricingPlansSection.classList.remove("d-none");
      showPricingPlansBtn.classList.add("d-none");
    });
  }

  // Handle plan selection
  for (const button of selectPlanButtons) {
    button.addEventListener("click", function () {
      const planName = this.getAttribute("data-plan");

      // Here would be code to initiate the subscription process
      // For demo, we'll just show a notification
      showReturnNotification("success", `You have selected the ${planName} plan. Redirecting to checkout...`);

      // Hide the pricing section after selection
      setTimeout(() => {
        if (pricingPlansSection) {
          pricingPlansSection.classList.add("d-none");
        }
        if (showPricingPlansBtn) {
          showPricingPlansBtn.classList.remove("d-none");
        }
      }, 3000);
    });
  }

  // Generate quote button functionality
  if (generateQuoteBtn) {
    generateQuoteBtn.addEventListener("click", () => {
      // In a real app, this would open a modal or redirect to a quote page
      showReturnNotification("info", "Generating quote for your subscription. You will receive it via email shortly.");
    });
  }

  // Manage billing button functionality
  const manageBillingBtn = document.getElementById("manageBillingBtn") as HTMLButtonElement | null;
  if (manageBillingBtn) {
    manageBillingBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReturnNotification("info", "Redirecting to the billing management portal...");
    });
  }

  // Change email button functionality
  const changeEmailBtn = document.getElementById("changeEmailBtn") as HTMLButtonElement | null;
  if (changeEmailBtn) {
    changeEmailBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReturnNotification("info", "Opening email change form...");
    });
  }
}

// API Key generation functionality
function setupApiKeyGeneration(): void {
  const generateButton = document.getElementById("generateApiKeyBtn") as HTMLButtonElement | null;
  const apiKeyGenerateSection = document.getElementById("apiKeyGenerateSection") as HTMLElement | null;
  const apiKeyDisplaySection = document.getElementById("apiKeyDisplaySection") as HTMLElement | null;
  const apiKeyDisplay = document.getElementById("apiKeyDisplay") as HTMLInputElement | null;
  const copyApiKeyBtn = document.getElementById("copyApiKeyBtn") as HTMLButtonElement | null;

  if (!generateButton || !apiKeyGenerateSection || !apiKeyDisplaySection || !apiKeyDisplay) {
    return; // Required elements not found
  }

  // Initialize tooltips for copy button
  if (copyApiKeyBtn) {
    new Tooltip(copyApiKeyBtn);
  }

  // Generate API key button click handler
  generateButton.addEventListener("click", () => {
    // Show loading state
    const originalContent = generateButton.innerHTML;
    generateButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating...';
    generateButton.disabled = true;

    // Simulate API call to generate a key (2 seconds)
    setTimeout(() => {
      // Generate a mock API key
      const apiKey = generateMockApiKey();

      // Update the UI
      apiKeyDisplay.value = apiKey;

      // Show the key display section and hide the generate button
      apiKeyGenerateSection.classList.add("d-none");
      apiKeyDisplaySection.classList.remove("d-none");

      // Reset the generate button state
      generateButton.innerHTML = originalContent;
      generateButton.disabled = false;
    }, 2000);
  });

  // Copy to clipboard functionality
  if (copyApiKeyBtn) {
    copyApiKeyBtn.addEventListener("click", () => {
      // Get the API key value
      const apiKey = apiKeyDisplay.value;

      // Copy to clipboard
      navigator.clipboard
        .writeText(apiKey)
        .then(() => {
          // Update tooltip content temporarily
          const tooltip = Tooltip.getOrCreateInstance(copyApiKeyBtn);
          const originalTitle = copyApiKeyBtn.getAttribute("data-bs-original-title");

          // Change tooltip text to show copied
          copyApiKeyBtn.setAttribute("data-bs-original-title", "Copied!");
          tooltip.show();

          // Update button icon temporarily
          copyApiKeyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';

          // Reset tooltip and icon after 2 seconds
          setTimeout(() => {
            if (originalTitle) {
              copyApiKeyBtn.setAttribute("data-bs-original-title", originalTitle);
            }
            copyApiKeyBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
            tooltip.hide();
          }, 2000);
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
        });
    });
  }

  // Helper function to generate a mock API key
  function generateMockApiKey(): string {
    // Generate a random alphanumeric string to simulate an API key
    // Format: 32 character string (similar to the one shown in the image)
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let apiKey = "3bada700e2"; // Start with the prefix shown in the image

    // Generate a 22 more random characters to reach 32 total
    for (let i = 0; i < 22; i++) {
      apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return apiKey;
  }
}
