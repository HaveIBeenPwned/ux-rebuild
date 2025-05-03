// Dashboard internal functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get the email from localStorage
  const email = localStorage.getItem("hibp_verified_email");

  // If no email is found, redirect to the dashboard login page
  if (!email) {
    window.location.href = "dashboard.html";
    return;
  }

  // Set the user's email and initial in the UI
  const userEmailElement = document.getElementById("userEmail");
  const userInitialElement = document.getElementById("userInitial");

  if (userEmailElement) {
    userEmailElement.textContent = email;
  }

  if (userInitialElement) {
    userInitialElement.innerHTML = `<span>${email
      .charAt(0)
      .toUpperCase()}</span>`;
  }

  // Initialize all popovers on page load
  initializePopovers();

  // Logout button functionality
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      // Clear the verified email from local storage
      localStorage.removeItem("hibp_verified_email");

      // Redirect to the dashboard login page
      window.location.href = "dashboard.html";
    });
  }

  // Enable URL hash updates when tabs are changed
  const tabLinks = document.querySelectorAll('[data-bs-toggle="pill"]');
  if (tabLinks.length > 0) {
    tabLinks.forEach((link) => {
      link.addEventListener("shown.bs.tab", function (event) {
        // Update URL with the tab ID, but don't add history entry
        const hash = event.target.getAttribute("href");
        if (hash && hash.startsWith("#")) {
          window.history.replaceState(null, null, hash);
        }
      });
    });

    // Activate the tab based on URL hash on page load
    if (window.location.hash) {
      const hash = window.location.hash;
      const tabToActivate = document.querySelector(`[href="${hash}"]`);
      if (tabToActivate) {
        const tab = new bootstrap.Tab(tabToActivate);
        tab.show();
      }
    }
  }

  // Run Full Scan button functionality
  const runFullScanButton = document.getElementById("runFullScanButton");
  if (runFullScanButton) {
    runFullScanButton.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("Full scan button clicked");

      // Update button to show loading state
      const originalContent = runFullScanButton.innerHTML;
      runFullScanButton.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Scanning...';
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
        const overviewTab = document.querySelector(
          "#overview .card:first-child .card-body"
        );

        console.log("Overview tab element:", overviewTab);

        if (overviewTab) {
          // Create temporary div to hold our HTML
          const temp = document.createElement("div");
          temp.innerHTML = alertHtml;

          // Find the target insertion point
          const insertTarget = overviewTab.querySelector(
            "div.d-flex.justify-content-between"
          );
          console.log("Insert target:", insertTarget);

          if (insertTarget) {
            // Insert at the beginning of the card body (before the d-flex element)
            overviewTab.insertBefore(temp.firstChild, insertTarget);
          } else {
            // Fallback if the target element is not found - prepend to the card body
            overviewTab.prepend(temp.firstChild);
          }
        } else {
          // Fallback if overview tab not found - add to return notification placeholder
          const returnNotification = document.getElementById(
            "returnNotificationPlaceholder"
          );
          if (returnNotification) {
            returnNotification.innerHTML = alertHtml;
          } else {
            console.error(
              "Could not find a place to insert the alert notification"
            );
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

  // Check for notification confirmation
  const urlParams = new URLSearchParams(window.location.search);
  const notificationConfirmed = urlParams.get('notification_confirmed');
  const notificationSuccess = document.getElementById('notificationSuccess');
  
  if (notificationConfirmed === 'true' && notificationSuccess) {
    notificationSuccess.classList.remove('d-none');
    
    // Auto-hide the message after 10 seconds
    setTimeout(() => {
      notificationSuccess.classList.add('d-none');
    }, 10000);
  }
});

function setUserInfo() {
  // Mock user data - in a real app, this would come from the server
  const user = {
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
  };

  // Set user email in the sidebar
  const userEmailElement = document.getElementById("userEmail");
  if (userEmailElement) {
    userEmailElement.textContent = user.email;
  }

  // Set user initial in the avatar
  const userInitialElement = document.getElementById("userInitial");
  if (userInitialElement) {
    userInitialElement.textContent = user.firstName.charAt(0);
  }

  // Also set it in the notification email field
  const notificationEmailElement = document.getElementById("notificationEmail");
  if (notificationEmailElement) {
    notificationEmailElement.value = user.email;
  }
}

function setupNotificationToggle() {
  const notificationsSwitch = document.getElementById("notificationsSwitch");
  const notificationStatus = document.getElementById("notificationStatus");
  const saveButton = document.getElementById("saveNotificationPreferences");
  const notificationBadge = document.querySelector(
    'a[href="#notifications"] .badge'
  );
  const notificationEmail = document.getElementById("notificationEmail");
  const digestEmailCheck = document.getElementById("digestEmailCheck");

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
      notificationEmail.addEventListener("input", function () {
        enableSaveButton();
      });
    }

    // When the digest setting is changed
    if (digestEmailCheck) {
      digestEmailCheck.addEventListener("change", function () {
        enableSaveButton();
      });
    }

    // When the save button is clicked
    saveButton.addEventListener("click", function () {
      // Here you would typically save the preferences to the server
      // For this demo, we'll just update the UI

      if (notificationsSwitch.checked) {
        if (notificationBadge) {
          notificationBadge.textContent = "On";
          notificationBadge.classList.remove("bg-danger");
          notificationBadge.classList.add("bg-success");
        }

        // Show a success message
        showReturnNotification(
          "success",
          "Notifications enabled successfully."
        );
      } else {
        if (notificationBadge) {
          notificationBadge.textContent = "Off";
          notificationBadge.classList.remove("bg-success");
          notificationBadge.classList.add("bg-danger");
        }

        // Show a success message
        showReturnNotification(
          "success",
          "Notifications disabled successfully."
        );
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
  function enableSaveButton() {
    if (saveButton) {
      const emailChanged =
        notificationEmail && notificationEmail.value !== initialEmail;
      const digestChanged =
        digestEmailCheck && digestEmailCheck.checked !== initialDigestSetting;

      if (emailChanged || digestChanged) {
        saveButton.removeAttribute("disabled");
      }
    }
  }
}

function setupLogoutButton() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      // In a real application, this would call a logout API endpoint
      // For this demo, we'll just redirect to the login page
      window.location.href = "dashboard.html";
    });
  }
}

function setupRunFullScanButton() {
  const runFullScanButton = document.getElementById("runFullScanButton");
  if (runFullScanButton) {
    runFullScanButton.addEventListener("click", function (e) {
      e.preventDefault();
      // Show a loading message
      showReturnNotification(
        "info",
        "Running full scan... This may take a few moments."
      );

      // In a real app, this would trigger an API call to perform the scan
      // For this demo, we'll just show a success message after a delay
      setTimeout(function () {
        showReturnNotification(
          "success",
          "Scan completed successfully. No new breaches found."
        );
      }, 3000);
    });
  }
}

function showReturnNotification(type, message) {
  const notificationPlaceholder = document.getElementById(
    "returnNotificationPlaceholder"
  );
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
    setTimeout(function () {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  }
}

function initializePopovers() {
  // Initialize all popovers
  const popoverTriggerList = document.querySelectorAll(
    '[data-bs-toggle="popover"]'
  );
  const popoverList = [...popoverTriggerList].map(
    (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
  );

  // Initialize all tooltips
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
}

// Domain management functionality
function setupDomainManagement() {
  // Check if we have domains to display
  const hasVerifiedDomains =
    localStorage.getItem("hibp_has_domains") === "true";
  const noDomainView = document.getElementById("noDomainView");
  const domainsTableView = document.getElementById("domainsTableView");

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
function setupDomainSearch() {
  const searchButtons = document.querySelectorAll('.domain-search-btn');
  const domainListView = document.getElementById('domainListView');
  const domainSearchView = document.getElementById('domainSearchView');
  const searchDomainTitle = document.getElementById('searchDomainTitle');
  const domainSearchBackBtn = document.getElementById('domainSearchBackBtn');
  const domainSearchResults = document.getElementById('domainSearchResults');
  const searchFilter = document.getElementById('domainSearchFilter');
  const searchBreachFilter = document.getElementById('domainSearchBreachFilter');  
  
  // Initialize popovers and tooltips for the domain search view
  initializePopovers();
  
  if (!searchButtons.length || !domainListView || !domainSearchView) {
    return; // Required elements not found
  }
  
  // Add event listeners to search buttons
  searchButtons.forEach(button => {
    button.addEventListener('click', function() {
      const domain = this.getAttribute('data-domain');
      showDomainSearchResults(domain);
    });
  });
  
  // Back button functionality
  if (domainSearchBackBtn) {
    domainSearchBackBtn.addEventListener('click', hideDomainSearchResults);
  }

  
  // Filter functionality
  if (searchFilter) {
    searchFilter.addEventListener('input', function() {
      filterDomainSearchResults(this.value);
    });
  }
  
  // Breach filter functionality
  if (searchBreachFilter) {
    searchBreachFilter.addEventListener('change', function() {
      sortDomainSearchResults(this.value);
    });
  }
  
  // Function to show domain search results with animation
  function showDomainSearchResults(domain) {
    // Update the domain title
    if (searchDomainTitle) {
      searchDomainTitle.textContent = domain;
    }
    
    // Update domain stats in the summary cards
    updateDomainSummaryStats(domain);
    
    // Clear previous results
    if (domainSearchResults) {
      domainSearchResults.innerHTML = '';
    }
    
    // Load mock data for demo
    loadMockDomainSearchResults(domain);
    
    // Initialize popovers for the domain summary cards
    initializePopovers();
    
    // First fade out domain list view
    domainListView.style.opacity = '0';
    
    // After short delay, hide domain list and show search view
    setTimeout(() => {
      // Hide domain list and show search view
      domainListView.classList.add('slide-left');
      domainSearchView.classList.add('slide-left');
      
      // Fade in search view
      setTimeout(() => {
        domainSearchView.style.opacity = '1';
      }, 50);
    }, 300);
  }
  
  // Helper function to update domain summary statistics
  function updateDomainSummaryStats(domain) {
    // Find the row in the domains table for this domain to get the stats
    const domainRow = document.querySelector(`button[data-domain=""]`)?.closest('tr');
    
    // Get the stats elements
    const totalBreachedEl = document.getElementById('totalBreachedAddresses');
    const nonSpamBreachedEl = document.getElementById('nonSpamBreachedAddresses');
    const stealerLogEl = document.getElementById('stealerLogAddresses');
    
    if (domainRow) {
      // In a real app, we'd get this from an API, but for demo we'll use the table data
      const addressCount = domainRow.querySelector('td:nth-child(2)').textContent;
      const stealerLogCount = domainRow.querySelector('td:nth-child(3)').textContent;
      
      // Calculate a reasonable value for non-spam breaches (in a real app this would be from API)
      // For demo purposes, we'll use about 80% of total breaches
      const totalAddresses = parseInt(addressCount.replace(/,/g, ''));
      const nonSpamAddresses = Math.round(totalAddresses * 0.78);
      
      // Update the UI elements
      if (totalBreachedEl) totalBreachedEl.textContent = addressCount;
      if (nonSpamBreachedEl) nonSpamBreachedEl.textContent = nonSpamAddresses.toLocaleString();
      if (stealerLogEl) stealerLogEl.textContent = stealerLogCount;
    } else {
      // Fallback to mock data if domain row not found
      if (totalBreachedEl) totalBreachedEl.textContent = '1,245';
      if (nonSpamBreachedEl) nonSpamBreachedEl.textContent = '972';
      if (stealerLogEl) stealerLogEl.textContent = '17';
    }
  }
  
  // Function to hide domain search results with animation
  function hideDomainSearchResults() {
    // First fade out search view
    domainSearchView.style.opacity = '0';
    
    // After short delay, hide search view and show domain list
    setTimeout(() => {
      // Hide search view and show domain list
      domainListView.classList.remove('slide-left');
      domainSearchView.classList.remove('slide-left');
      
      // Fade in domain list
      setTimeout(() => {
        domainListView.style.opacity = '1';
      }, 50);
    }, 300);
  }
  
  // Global variables to store the full dataset and current view state
  let allEmailData = [];
  let filteredEmailData = [];
  let currentFilter = '';
  let currentSortBy = 'all';
  
  // Function to load mock search results
  function loadMockDomainSearchResults(domain) {
    // Generate more mock email addresses for the domain (3 pages worth)
    allEmailData = [
      { email: `info@`, breaches: 8, pwnedSites: 'Adobe, LinkedIn, Dropbox, Yahoo, Canva, Quora, MySpace, MyFitnessPal' },
      { email: `contact@`, breaches: 5, pwnedSites: 'Adobe, LinkedIn, Dropbox, Yahoo, Quora' },
      { email: `support@`, breaches: 7, pwnedSites: 'Adobe, LinkedIn, Dropbox, Yahoo, Canva, Quora, MyFitnessPal' },
      { email: `admin@`, breaches: 10, pwnedSites: 'Adobe, LinkedIn, Dropbox, Yahoo, Canva, Quora, MySpace, MyFitnessPal, Tumblr, Zynga' },
      { email: `webmaster@`, breaches: 4, pwnedSites: 'Adobe, LinkedIn, Yahoo, Tumblr' },
      { email: `sales@`, breaches: 6, pwnedSites: 'Adobe, LinkedIn, Dropbox, Yahoo, Canva, Quora' },
      { email: `marketing@`, breaches: 3, pwnedSites: 'LinkedIn, Dropbox, Yahoo' },
      { email: `help@`, breaches: 2, pwnedSites: 'Adobe, LinkedIn' },
      { email: `billing@`, breaches: 5, pwnedSites: 'Adobe, LinkedIn, Yahoo, Canva, MyFitnessPal' },
      { email: `hr@`, breaches: 7, pwnedSites: 'Adobe, LinkedIn, Dropbox, Yahoo, Canva, MySpace, MyFitnessPal' },
      { email: `developers@`, breaches: 6, pwnedSites: 'LinkedIn, Adobe, Dropbox, GitHub, Canva, MyFitnessPal' },
      { email: `media@`, breaches: 3, pwnedSites: 'Snapchat, Adobe, Canva' },
      { email: `editor@`, breaches: 4, pwnedSites: 'Adobe, Dropbox, LinkedIn, Quora' },
      { email: `subscriptions@`, breaches: 2, pwnedSites: 'Adobe, Canva' },
      { email: `abuse@`, breaches: 1, pwnedSites: 'Dropbox' },
      { email: `no-reply@`, breaches: 3, pwnedSites: 'LinkedIn, Tumblr, Zynga' },
      { email: `payments@`, breaches: 5, pwnedSites: 'Adobe, LinkedIn, Dropbox, Marriott, eBay' },
      { email: `privacy@`, breaches: 4, pwnedSites: 'Adobe, LinkedIn, Yahoo, Evernote' }
    ];
    
    // Initialize with all data
    filteredEmailData = [...allEmailData];
    
    // Set default filter to 'all' and apply
    currentSortBy = 'all';
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
      domainSearchResults.innerHTML = '';
    }
    
    // Update the result count
    updateResultCount();
    
    // Display all the data
    filteredEmailData.forEach(item => {
      const row = document.createElement('tr');
      row.className = 'domain-search-result-item';
      row.innerHTML = `
        <td>${item.email}</td>
        <td class="text-end">${item.breaches}</td>
        <td>${item.pwnedSites}</td>
      `;
      domainSearchResults.appendChild(row);
    });
  }
  
  // Helper function to update the result count display
  function updateResultCount() {
    const countElement = document.getElementById('domainSearchResultCount');
    if (countElement) {
      countElement.textContent = filteredEmailData.length;
    }
  }
  
  // Function to filter search results
  function filterDomainSearchResults(query) {
    currentFilter = query.toLowerCase();
    
    // Filter the full dataset
    if (currentFilter === '') {
      filteredEmailData = [...allEmailData]; // Reset to all data if filter is empty
    } else {
      filteredEmailData = allEmailData.filter(item => {
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
  function sortDomainSearchResults(filterValue) {
    currentSortBy = filterValue;
    
    // First, reset to all filtered data based on the text search filter
    if (currentFilter === '') {
      filteredEmailData = [...allEmailData];
    } else {
      filteredEmailData = allEmailData.filter(item => {
        const emailMatch = item.email.toLowerCase().includes(currentFilter);
        return emailMatch;
      });
    }
    
    // Then apply the breach filter if not showing all
    if (filterValue !== 'all') {
      // For demo purposes, we're using LinkedIn as the most recent breach
      const recentBreachName = 'LinkedIn';
      
      // Filter to only show emails affected by the recent breach
      filteredEmailData = filteredEmailData.filter(item => 
        item.pwnedSites.includes(recentBreachName)
      );
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
  const tabButtons = document.querySelectorAll('#verificationTabs .nav-link');
  
  tabButtons.forEach(tab => {
    tab.addEventListener('shown.bs.tab', function(event) {
      // Get the ID of the activated tab (without the -tab suffix)
      const activeMethod = event.target.id.replace('-tab', '');
      // Store this as the current method - useful when verifying
      localStorage.setItem('current_verification_method', activeMethod);
    });
  });
  
  // Initialize with DNS as the default method
  localStorage.setItem('current_verification_method', 'dns');
}

function setupDomainVerification() {
  // Get elements for step 1
  const domainInputStep = document.getElementById("domainInputStep");
  const domainLoadingStep = document.getElementById("domainLoadingStep");
  const verificationMethodsStep = document.getElementById("verificationMethodsStep");
  const continueButton = document.getElementById("continueToDomainVerification");
  const domainInput = document.getElementById("domainInput");
  const goBackButton = document.getElementById("goBackButton");
  
  // Get elements for step 2
  const verifyButton = document.getElementById("verifyButton");
  const verificationSpinner = document.getElementById("verificationSpinner");
  const tabContent = document.getElementById("verificationTabContent");
  
  // Handle the continue button to move from step 1 to loading to step 2
  if (continueButton && domainInput) {
    continueButton.addEventListener("click", function() {
      const domain = domainInput.value.trim();
      
      if (!domain) {
        domainInput.classList.add("is-invalid");
        return;
      }
      
      // Hide step 1, show loading step
      domainInputStep.classList.add("d-none");
      domainLoadingStep.classList.remove("d-none");
      continueButton.classList.add("d-none"); // Hide continue button during loading
      
      // Remove the data-bs-dismiss attribute from the goBackButton
      // as we don't want it to close the modal in step 2
      if (goBackButton) {
        goBackButton.removeAttribute("data-bs-dismiss");
      }
      
      // Simulate domain validation (1.2 seconds)
      setTimeout(() => {
        // Hide loading step, show step 2
        domainLoadingStep.classList.add("d-none");
        verificationMethodsStep.classList.remove("d-none");
        verifyButton.classList.remove("d-none"); // Show the verify button
        
        // Show the Go Back button when in step 2
        if (goBackButton) {
          goBackButton.classList.remove("d-none");
        }
        
        // Update domain placeholders in the instructions with the entered domain
        document.querySelectorAll(".domain-name-placeholder, #domainNamePlaceholder").forEach(placeholder => {
          placeholder.textContent = domain;
        });
      }, 1200);
    });
    
    // Clear invalid state when input changes
    domainInput.addEventListener("input", function() {
      this.classList.remove("is-invalid");
    });
  }
  
  // Handle go back button to return to step 1 or close modal depending on current step
  if (goBackButton) {
    goBackButton.addEventListener("click", function(event) {
      // If we're in step 2, go back to step 1 and prevent modal from closing
      if (!verificationMethodsStep.classList.contains('d-none')) {
        // Prevent the default dismiss behavior
        event.preventDefault();
        
        // Go back to step 1
        domainInputStep.classList.remove("d-none");
        verificationMethodsStep.classList.add("d-none");
        verifyButton.classList.add("d-none"); // Hide the verify button
        continueButton.classList.remove("d-none"); // Show continue button
        
        // Hide the Go Back button when back in step 1
        goBackButton.classList.add("d-none");
        
        // Restore the data-bs-dismiss attribute for step 1
        goBackButton.setAttribute("data-bs-dismiss", "modal");
      }      
    });
  }

  // Handle the verify button functionality
  if (verifyButton && domainInput) {
    verifyButton.addEventListener("click", function() {
      const domain = domainInput.value.trim();

      if (!domain) {
        // We shouldn't reach here, but just in case
        domainInputStep.classList.remove("d-none");
        verificationMethodsStep.classList.add("d-none");
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
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("verificationModal")
        );
        if (modal) {
          modal.hide();
        }

        // Show success message
        showReturnNotification(
          "success",
          `Domain ${domain} verified successfully! You can now monitor email addresses on this domain.`
        );

        // Update domain UI
        const noDomainView = document.getElementById("noDomainView");
        const domainsTableView = document.getElementById("domainsTableView");

        if (noDomainView && domainsTableView) {
          noDomainView.classList.add("d-none");
          domainsTableView.classList.remove("d-none");
        }
      }, 3000);
    });
  }
}

function setupDomainRemoval() {
  const removeButtons = document.querySelectorAll(".remove-domain");
  const confirmRemovalButton = document.getElementById("confirmDomainRemoval");
  let domainToRemove = null;

  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      domainToRemove = this.getAttribute("data-domain");
    });
  });

  if (confirmRemovalButton) {
    confirmRemovalButton.addEventListener("click", function () {
      if (domainToRemove) {
        // Remove from UI (in a real app, would remove from database)
        const domainRow = document
          .querySelector(`button[data-domain="${domainToRemove}"]`)
          .closest("tr");
        if (domainRow) {
          domainRow.remove();
        }

        // Check if any domains are left
        const remainingDomains = document.querySelectorAll(
          "#domainsTableBody tr"
        ).length;
        if (remainingDomains === 0) {
          // No domains left, update localStorage and UI
          localStorage.setItem("hibp_has_domains", "false");

          const noDomainView = document.getElementById("noDomainView");
          const domainsTableView = document.getElementById("domainsTableView");

          if (noDomainView && domainsTableView) {
            noDomainView.classList.remove("d-none");
            domainsTableView.classList.add("d-none");
          }
        }

        // Force cleanup modal and backdrop immediately
        forceCleanupModalBackdrop();

        // Show success message
        showReturnNotification(
          "success",
          `Domain ${domainToRemove} has been removed from your account.`
        );

        // Reset domainToRemove
        domainToRemove = null;
      }
    });
  }
}

function setupModalCleanup() {
  const verificationModal = document.getElementById("verificationModal");
  
  if (verificationModal) {
    verificationModal.addEventListener("hidden.bs.modal", function() {
      // Reset modal to step 1 when closed
      const domainInputStep = document.getElementById("domainInputStep");
      const domainLoadingStep = document.getElementById("domainLoadingStep");
      const verificationMethodsStep = document.getElementById("verificationMethodsStep");
      const verifyButton = document.getElementById("verifyButton");
      const continueButton = document.getElementById("continueToDomainVerification");
      const domainInput = document.getElementById("domainInput");
      const tabContent = document.getElementById("verificationTabContent");
      const verificationSpinner = document.getElementById("verificationSpinner");
      const goBackButton = document.getElementById("goBackButton");
      
      if (domainInputStep && verificationMethodsStep) {
        // Reset to step 1
        domainInputStep.classList.remove("d-none");
        domainLoadingStep.classList.add("d-none");
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
      const dnsTab = document.getElementById("dns-tab");
      if (dnsTab) {
        // Create a new Bootstrap Tab instance and show it
        const bootstrapTab = new bootstrap.Tab(dnsTab);
        bootstrapTab.show();
      }
    });
  }
  
  // Add global modal cleanup handler for domain removal
  document.addEventListener("hidden.bs.modal", function (event) {
    if (event.target.id === "domainRemovalPrompt") {
      // Force cleanup of any lingering modal backdrops
      document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
        backdrop.classList.remove("show");
        backdrop.classList.remove("fade");
        backdrop.remove();
      });

      // Restore body styling
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  });
}
