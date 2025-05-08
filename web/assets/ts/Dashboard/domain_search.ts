import { Modal, Tab } from "bootstrap";
import { delay, initializePopovers } from "../utils";
import { showReturnNotification } from "./dashboard_utils";

// Domain management functionality
export function setupDomainManagement() {
  // Check if we have domains to display
  const noDomainView = document.getHtmlElementById<HTMLDivElement>("noDomainView");
  const domainsTableView = document.getHtmlElementById<HTMLDivElement>("domainsTableView");
  const domainsTableBody = document.getHtmlElementById<HTMLTableSectionElement>("domainsTableBody");

  if (noDomainView && domainsTableView) {
    if (domainsTableBody && domainsTableBody.children.length > 0) {
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
function setupDomainSearch() {
  const searchButtons = document.queryHtmlElements<HTMLButtonElement>(".domain-search-btn");
  const domainListView = document.getHtmlElementById<HTMLElement>("domainListView");
  const domainSearchView = document.getHtmlElementById<HTMLElement>("domainSearchView");
  const searchDomainTitle = document.getHtmlElementById<HTMLElement>("searchDomainTitle");
  const domainSearchBackBtn = document.getHtmlElementById<HTMLElement>("domainSearchBackBtn");
  const domainSearchResults = document.getHtmlElementById<HTMLElement>("domainSearchResults");
  const searchFilter = document.getHtmlElementById<HTMLInputElement>("domainSearchFilter");
  const searchBreachFilter = document.getHtmlElementById<HTMLSelectElement>("domainSearchBreachFilter");

  // Initialize popovers and tooltips for the domain search view
  initializePopovers();

  if (!searchButtons.length || !domainListView || !domainSearchView) {
    return; // Required elements not found
  }

  // Add event listeners to search buttons
  for (const button of searchButtons) {
    button.addEventListener("click", async function () {
      const domain = this.getAttribute("data-domain");
      await showDomainSearchResults(domain);
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
  async function showDomainSearchResults(domain: string | null) {
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
    await delay(300);

    // Hide domain list and show search view
    domainListView?.classList.add("slide-left");
    domainSearchView?.classList.add("slide-left");

    await delay(50);
    // Fade in search view

    if (domainSearchView) {
      domainSearchView.style.opacity = "1";
    }
  }

  // Helper function to update domain summary statistics
  function updateDomainSummaryStats(domain: string | null) {
    // Find the row in the domains table for this domain to get the stats
    const domainRow = document.querySelector(`button[data-domain=""]`)?.closest("tr");

    // Get the stats elements
    const totalBreachedEl = document.getHtmlElementById<HTMLElement>("totalBreachedAddresses");
    const nonSpamBreachedEl = document.getHtmlElementById<HTMLElement>("nonSpamBreachedAddresses");
    const stealerLogEl = document.getHtmlElementById<HTMLElement>("stealerLogAddresses");

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
  function hideDomainSearchResults() {
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
  function loadMockDomainSearchResults(domain: string | null) {
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
  function displayAllResults() {
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
  function updateResultCount() {
    const countElement = document.getHtmlElementById<HTMLElement>("domainSearchResultCount");
    if (countElement) {
      countElement.textContent = filteredEmailData.length.toString();
    }
  }

  // Function to filter search results
  function filterDomainSearchResults(query: string) {
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
  function sortDomainSearchResults(filterValue: string) {
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

function setupVerificationMethodSelection() {
  // With Bootstrap's tab component, we don't need to manually handle tab switching
  // as it's handled by Bootstrap's JavaScript.
  // We just need to initialize the tabs if needed.

  // Store the current verification method when a tab is clicked
  const tabButtons = document.queryHtmlElements<HTMLButtonElement>("#verificationTabs .nav-link");

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

function setupDomainVerification() {
  // Get elements for step 1
  const domainInputStep = document.getHtmlElementById<HTMLElement>("domainInputStep");
  const domainLoadingStep = document.getHtmlElementById<HTMLElement>("domainLoadingStep");
  const verificationMethodsStep = document.getHtmlElementById<HTMLElement>("verificationMethodsStep");
  const continueButton = document.getHtmlElementById<HTMLButtonElement>("continueToDomainVerification");
  const domainInput = document.getHtmlElementById<HTMLInputElement>("domainInput");
  const goBackButton = document.getHtmlElementById<HTMLButtonElement>("goBackButton");

  // Get elements for step 2
  const verifyButton = document.getHtmlElementById<HTMLButtonElement>("verifyButton");
  const verificationSpinner = document.getHtmlElementById<HTMLElement>("verificationSpinner");
  const tabContent = document.getHtmlElementById<HTMLElement>("verificationTabContent");

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
        const placeHolders = document.queryHtmlElements<HTMLElement>(".domain-name-placeholder, #domainNamePlaceholder");
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
        const noDomainView = document.getHtmlElementById<HTMLElement>("noDomainView");
        const domainsTableView = document.getHtmlElementById<HTMLElement>("domainsTableView");

        if (noDomainView && domainsTableView) {
          noDomainView.classList.add("d-none");
          domainsTableView.classList.remove("d-none");
        }
      }, 3000);
    });
  }
}

function setupDomainRemoval() {
  const removeButtons = document.queryHtmlElements<HTMLButtonElement>(".remove-domain");
  const confirmRemovalButton = document.getHtmlElementById<HTMLButtonElement>("confirmDomainRemoval");
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

          const noDomainView = document.getHtmlElementById<HTMLElement>("noDomainView");
          const domainsTableView = document.getHtmlElementById<HTMLElement>("domainsTableView");

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

function setupModalCleanup() {
  const verificationModal = document.getHtmlElementById<HTMLElement>("verificationModal");

  if (verificationModal) {
    verificationModal.addEventListener("hidden.bs.modal", () => {
      // Reset modal to step 1 when closed
      const domainInputStep = document.getHtmlElementById<HTMLElement>("domainInputStep");
      const domainLoadingStep = document.getHtmlElementById<HTMLElement>("domainLoadingStep");
      const verificationMethodsStep = document.getHtmlElementById<HTMLElement>("verificationMethodsStep");
      const verifyButton = document.getHtmlElementById<HTMLButtonElement>("verifyButton");
      const continueButton = document.getHtmlElementById<HTMLButtonElement>("continueToDomainVerification");
      const domainInput = document.getHtmlElementById<HTMLInputElement>("domainInput");
      const tabContent = document.getHtmlElementById<HTMLElement>("verificationTabContent");
      const verificationSpinner = document.getHtmlElementById<HTMLElement>("verificationSpinner");
      const goBackButton = document.getHtmlElementById<HTMLButtonElement>("goBackButton");

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
      const modalBackdrops = document.queryHtmlElements<HTMLElement>(".modal-backdrop");
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
