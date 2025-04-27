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

  // Setup file upload functionality
  setupFileUpload();
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
  const searchSort = document.getElementById('domainSearchSort');
  const domainSearchExcelBtn = document.getElementById('domainSearchExcelBtn');
  const domainSearchJsonBtn = document.getElementById('domainSearchJsonBtn');
  
  // Initialize tooltips for export buttons
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  
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
  
  // Excel button functionality
  if (domainSearchExcelBtn) {
    domainSearchExcelBtn.addEventListener('click', function() {
      // Get current domain
      const domain = searchDomainTitle ? searchDomainTitle.textContent : '';
      
      // Show the file upload modal with Excel format selected
      showFileUploadModal('excel', domain);
    });
  }
  
  // JSON button functionality
  if (domainSearchJsonBtn) {
    domainSearchJsonBtn.addEventListener('click', function() {
      // Get current domain
      const domain = searchDomainTitle ? searchDomainTitle.textContent : '';
      
      // Show the file upload modal with JSON format selected
      showFileUploadModal('json', domain);
    });
  }
  
  // Filter functionality
  if (searchFilter) {
    searchFilter.addEventListener('input', function() {
      filterDomainSearchResults(this.value);
    });
  }
  
  // Sort functionality
  if (searchSort) {
    searchSort.addEventListener('change', function() {
      sortDomainSearchResults(this.value);
    });
  }
  
  // Function to show domain search results with animation
  function showDomainSearchResults(domain) {
    // Update the domain title
    if (searchDomainTitle) {
      searchDomainTitle.textContent = domain;
    }
    
    // Clear previous results
    if (domainSearchResults) {
      domainSearchResults.innerHTML = '';
    }
    
    // Load mock data for demo
    loadMockDomainSearchResults(domain);
    
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
  let currentPage = 1;
  let itemsPerPage = 10;
  let currentFilter = '';
  let currentSortBy = 'recent';
  
  // Function to load mock search results
  function loadMockDomainSearchResults(domain) {
    // Generate more mock email addresses for the domain (3 pages worth)
    allEmailData = [
      // Page 1
      { email: `admin@${domain}`, breaches: 3, pwnedSites: 'LinkedIn, Adobe, Dropbox' },
      { email: `info@${domain}`, breaches: 2, pwnedSites: 'Yahoo, Canva' },
      { email: `sales@${domain}`, breaches: 5, pwnedSites: 'LinkedIn, Adobe, Dropbox, MyFitnessPal, Zynga' },
      { email: `support@${domain}`, breaches: 1, pwnedSites: 'LinkedIn' },
      { email: `marketing@${domain}`, breaches: 4, pwnedSites: 'Adobe, Dropbox, Canva, Tumblr' },
      { email: `contact@${domain}`, breaches: 2, pwnedSites: 'Yahoo, Marriott' },
      { email: `help@${domain}`, breaches: 3, pwnedSites: 'LinkedIn, Snapchat, Quora' },
      { email: `service@${domain}`, breaches: 6, pwnedSites: 'LinkedIn, Adobe, Dropbox, Snapchat, eBay, Zynga' },
      { email: `webmaster@${domain}`, breaches: 4, pwnedSites: 'Adobe, Dropbox, Canva, eBay' },
      { email: `jobs@${domain}`, breaches: 1, pwnedSites: 'Evernote' },
      // Page 2
      { email: `ceo@${domain}`, breaches: 7, pwnedSites: 'LinkedIn, Adobe, Dropbox, Yahoo, Canva, Marriott, Quora' },
      { email: `cto@${domain}`, breaches: 4, pwnedSites: 'LinkedIn, Snapchat, eBay, Tumblr' },
      { email: `cfo@${domain}`, breaches: 3, pwnedSites: 'Adobe, Canva, MyFitnessPal' },
      { email: `hr@${domain}`, breaches: 5, pwnedSites: 'LinkedIn, Adobe, Snapchat, Canva, Quora' },
      { email: `legal@${domain}`, breaches: 2, pwnedSites: 'Dropbox, Evernote' },
      { email: `security@${domain}`, breaches: 8, pwnedSites: 'LinkedIn, Adobe, Dropbox, Yahoo, Canva, Marriott, Quora, Snapchat' },
      { email: `billing@${domain}`, breaches: 3, pwnedSites: 'Adobe, Dropbox, eBay' },
      { email: `feedback@${domain}`, breaches: 2, pwnedSites: 'LinkedIn, Evernote' },
      { email: `press@${domain}`, breaches: 4, pwnedSites: 'Adobe, Tumblr, Yahoo, Zynga' },
      { email: `partners@${domain}`, breaches: 3, pwnedSites: 'LinkedIn, Canva, MyFitnessPal' },
      // Page 3
      { email: `accounts@${domain}`, breaches: 5, pwnedSites: 'LinkedIn, Adobe, Dropbox, Marriott, Zynga' },
      { email: `newsletter@${domain}`, breaches: 2, pwnedSites: 'Yahoo, Tumblr' },
      { email: `developers@${domain}`, breaches: 6, pwnedSites: 'LinkedIn, Adobe, Dropbox, GitHub, Canva, MyFitnessPal' },
      { email: `media@${domain}`, breaches: 3, pwnedSites: 'Snapchat, Adobe, Canva' },
      { email: `editor@${domain}`, breaches: 4, pwnedSites: 'Adobe, Dropbox, LinkedIn, Quora' },
      { email: `subscriptions@${domain}`, breaches: 2, pwnedSites: 'Adobe, Canva' },
      { email: `abuse@${domain}`, breaches: 1, pwnedSites: 'Dropbox' },
      { email: `no-reply@${domain}`, breaches: 3, pwnedSites: 'LinkedIn, Tumblr, Zynga' },
      { email: `payments@${domain}`, breaches: 5, pwnedSites: 'Adobe, LinkedIn, Dropbox, Marriott, eBay' },
      { email: `privacy@${domain}`, breaches: 4, pwnedSites: 'Adobe, LinkedIn, Yahoo, Evernote' }
    ];
    
    // Initialize with all data
    filteredEmailData = [...allEmailData];
    
    // Apply initial sort
    applySorting(currentSortBy);
    
    // Display the first page
    displayPage(1);
  }
  
  // Function to display a specific page
  function displayPage(page) {
    // Update current page
    currentPage = page;
    
    // Clear previous results
    if (domainSearchResults) {
      domainSearchResults.innerHTML = '';
    }
    
    // Calculate start and end indices
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredEmailData.length);
    
    // Display the data for this page
    for (let i = startIndex; i < endIndex; i++) {
      const item = filteredEmailData[i];
      const row = document.createElement('tr');
      row.className = 'domain-search-result-item';
      row.innerHTML = `
        <td>${item.email}</td>
        <td>${item.breaches}</td>
        <td>${item.pwnedSites}</td>
      `;
      domainSearchResults.appendChild(row);
    }
    
    // Update pagination
    updatePagination(page);
  }
  
  // Function to update pagination controls
  function updatePagination(currentPage) {
    const pagination = document.getElementById('domainSearchPagination');
    if (pagination) {
      const totalPages = Math.ceil(filteredEmailData.length / itemsPerPage);
      
      let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <a class="page-link" href="#" data-page="${currentPage - 1}" tabindex="-1" ${currentPage === 1 ? 'aria-disabled="true"' : ''}>Previous</a>
        </li>
      `;
      
      for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
          <li class="page-item ${currentPage === i ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>
        `;
      }
      
      paginationHTML += `
        <li class="page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}">
          <a class="page-link" href="#" data-page="${currentPage + 1}" ${currentPage === totalPages || totalPages === 0 ? 'aria-disabled="true"' : ''}>Next</a>
        </li>
      `;
      
      pagination.innerHTML = paginationHTML;
      
      // Add event listeners to pagination controls
      const pageLinks = pagination.querySelectorAll('.page-link');
      pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          if (this.parentElement.classList.contains('disabled')) {
            return;
          }
          
          const page = parseInt(this.getAttribute('data-page'), 10);
          displayPage(page);
        });
      });
    }
  }
  
  // Function to filter search results across all pages
  function filterDomainSearchResults(query) {
    currentFilter = query.toLowerCase();
    
    // Filter the full dataset
    if (currentFilter === '') {
      filteredEmailData = [...allEmailData]; // Reset to all data if filter is empty
    } else {
      filteredEmailData = allEmailData.filter(item => {
        const emailMatch = item.email.toLowerCase().includes(currentFilter);
        const sitesMatch = item.pwnedSites.toLowerCase().includes(currentFilter);
        return emailMatch || sitesMatch;
      });
    }
    
    // Re-apply current sort
    applySorting(currentSortBy);
    
    // Show first page of results
    displayPage(1);
  }
  
  // Function to sort search results across all pages
  function sortDomainSearchResults(sortBy) {
    currentSortBy = sortBy;
    applySorting(sortBy);
    displayPage(currentPage);
  }
  
  // Helper function to apply sorting
  function applySorting(sortBy) {
    if (sortBy === 'alphabetical') {
      filteredEmailData.sort((a, b) => a.email.localeCompare(b.email));
    } else if (sortBy === 'breaches') {
      filteredEmailData.sort((a, b) => b.breaches - a.breaches);
    } else { // recent - now sorting by breach count
      filteredEmailData.sort((a, b) => b.breaches - a.breaches);
    }
  }
}

function setupVerificationMethodSelection() {
  const methodOptions = document.querySelectorAll(
    ".verification-method-option"
  );
  const instructionPanels = {
    dns: document.getElementById("dnsInstructions"),
    file: document.getElementById("fileInstructions"),
    meta: document.getElementById("metaInstructions"),
    email: document.getElementById("emailInstructions"),
  };

  methodOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove active class from all options
      methodOptions.forEach((opt) => opt.classList.remove("active"));

      // Add active class to the clicked option
      this.classList.add("active");

      // Hide all instruction panels
      for (const key in instructionPanels) {
        if (instructionPanels[key]) {
          instructionPanels[key].classList.add("d-none");
        }
      }

      // Show the selected instruction panel
      const method = this.getAttribute("data-method");
      if (instructionPanels[method]) {
        instructionPanels[method].classList.remove("d-none");
      }
    });
  });
}

function setupDomainVerification() {
  const verifyButton = document.getElementById("verifyButton");
  const domainInput = document.getElementById("domainInput");
  const verificationSpinner = document.getElementById("verificationSpinner");
  const verificationInstructions = document.querySelectorAll(
    "#verificationInstructions > div:not(#verificationSpinner)"
  );

  if (verifyButton && domainInput) {
    verifyButton.addEventListener("click", function () {
      const domain = domainInput.value.trim();

      if (!domain) {
        domainInput.classList.add("is-invalid");
        return;
      }

      // Hide instructions and show spinner
      if (verificationSpinner && verificationInstructions.length > 0) {
        verificationInstructions.forEach((panel) => {
          panel.classList.add("d-none");
        });
        verificationSpinner.classList.remove("d-none");
      }

      // Simulate verification process (3 seconds)
      setTimeout(() => {
        // Hide the spinner
        if (verificationSpinner) {
          verificationSpinner.classList.add("d-none");
        }

        // Show the first instruction panel again (DNS by default)
        if (verificationInstructions.length > 0) {
          verificationInstructions[0].classList.remove("d-none");
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

    // Clear invalid state when input changes
    domainInput.addEventListener("input", function () {
      this.classList.remove("is-invalid");
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
  // Add global modal cleanup handler
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

/**
 * Setup file upload functionality for domain data
 */
function setupFileUpload() {
  // Event listener for file input change
  const fileInput = document.getElementById('fileUploadInput');
  if (fileInput) {
    fileInput.addEventListener('change', function() {
      // Enable the upload button if a file is selected
      const uploadButton = document.getElementById('uploadFileButton');
      if (uploadButton) {
        uploadButton.disabled = !this.files.length;
        
        // Update the file name display if we have one
        const fileNameDisplay = document.getElementById('selectedFileName');
        if (fileNameDisplay && this.files.length) {
          fileNameDisplay.textContent = this.files[0].name;
          fileNameDisplay.parentElement.classList.remove('d-none');
        } else if (fileNameDisplay) {
          fileNameDisplay.parentElement.classList.add('d-none');
        }
      }
    });
  }
  
  // Event listener for upload button click
  const uploadButton = document.getElementById('uploadFileButton');
  if (uploadButton) {
    uploadButton.addEventListener('click', function() {
      // Get the file input
      const fileInput = document.getElementById('fileUploadInput');
      if (!fileInput || !fileInput.files.length) {
        return;
      }
      
      // In a real app, you would process the file here
      // For this demo, we'll just show a success message
      
      // Get the file format and domain from the modal
      const format = document.getElementById('fileUploadModal').getAttribute('data-format');
      const domain = document.getElementById('fileUploadModal').getAttribute('data-domain');
      
      // Close the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('fileUploadModal'));
      if (modal) {
        modal.hide();
      }
      
      // Reset the file input
      fileInput.value = '';
      
      // Show success message
      showReturnNotification(
        'success',
        `File "${fileInput.files[0].name}" uploaded successfully for domain ${domain} in ${format.toUpperCase()} format.`
      );
    });
  }
}

/**
 * Show the file upload modal
 * @param {string} format - The file format ('excel' or 'json')
 * @param {string} domain - The domain name
 */
function showFileUploadModal(format, domain) {
  // Get the modal
  const modal = document.getElementById('fileUploadModal');
  if (!modal) {
    return;
  }
  
  // Set the modal title based on format
  const modalTitle = modal.querySelector('.modal-title');
  if (modalTitle) {
    modalTitle.textContent = `Upload ${format.toUpperCase()} File for ${domain}`;
  }
  
  // Store the format and domain on the modal element for later use
  modal.setAttribute('data-format', format);
  modal.setAttribute('data-domain', domain);
  
  // Clear any previously selected file
  const fileInput = document.getElementById('fileUploadInput');
  if (fileInput) {
    fileInput.value = '';
  }
  
  // Hide the file name display
  const fileNameDisplay = document.getElementById('selectedFileName');
  if (fileNameDisplay) {
    fileNameDisplay.parentElement.classList.add('d-none');
  }
  
  // Disable the upload button
  const uploadButton = document.getElementById('uploadFileButton');
  if (uploadButton) {
    uploadButton.disabled = true;
  }
  
  // Show the modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}
