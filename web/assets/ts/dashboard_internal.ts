import { Tab } from "bootstrap";
import { initializePopovers } from "./utils";
import { setupDomainManagement } from "./Dashboard/domain_search";
import { showReturnNotification } from "./Dashboard/dashboard_utils";
import { setupStealerLogsNavigation } from "./Dashboard/stealer_logs";
import { setupNotificationToggle } from "./Dashboard/notification_toggle";
import { setupSubscriptionManagement } from "./Dashboard/subscription_management";
import { setupApiKeyGeneration } from "./Dashboard/api_keys";
import { setupCustomerFiltering } from "./Dashboard/customer_filtering";

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

  // Setup customer filtering functionality
  setupCustomerFiltering();

  // Setup customer management functionality
  setupCustomerManagement();

  // Setup invoice line item management
  setupInvoiceLineItems();

  // Setup quote details viewing
  setupQuoteDetailsViewing();

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

function setupCustomerManagement() {
  // Customer selection dropdown functionality for Create Quote form
  const customerSelect = document.getElementById("quoteCustomerSelect") as HTMLSelectElement;
  const customerNameInput = document.getElementById("quoteCustomerName") as HTMLInputElement;
  const companyNameInput = document.getElementById("quoteCompanyName") as HTMLInputElement;
  const customerEmailInput = document.getElementById("quoteCustomerEmail") as HTMLInputElement;
  const customerPhoneInput = document.getElementById("quoteCustomerPhone") as HTMLInputElement;

  if (customerSelect) {
    customerSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      const basicFields = document.getElementById("quoteBasicCustomerFields");
      const newCustomerFields = document.getElementById("quoteNewCustomerFields");
      const submitBtn = document.getElementById("quoteSubmitBtn") as HTMLButtonElement;

      if (selectedOption.value === "new") {
        // Show new customer fields, hide basic fields
        basicFields?.classList.add("d-none");
        newCustomerFields?.classList.remove("d-none");

        // Update submit button text
        if (submitBtn) {
        submitBtn.innerHTML = '<i class="bi bi-file-earmark-text me-2"></i>Create Customer & Generate Quote';
        }
      } else {
        // Show basic fields, hide new customer fields
        basicFields?.classList.remove("d-none");
        newCustomerFields?.classList.add("d-none");        
        

        if (selectedOption.value === "new") {
          // Clear fields for new customer or no selection
          customerNameInput.value = "";
          companyNameInput.value = "";
          customerEmailInput.value = "";
          customerPhoneInput.value = "";

          // Enable fields for manual entry
          customerNameInput.disabled = false;
          companyNameInput.disabled = false;
          customerEmailInput.disabled = false;
          customerPhoneInput.disabled = false;
        } else {
          // Populate fields with selected customer data
          customerNameInput.value = selectedOption.dataset.name || "";
          companyNameInput.value = selectedOption.dataset.company || "";
          customerEmailInput.value = selectedOption.dataset.email || "";
          customerPhoneInput.value = selectedOption.dataset.phone || "";

          // Disable fields to prevent editing (optional - you can remove this if you want fields to remain editable)
          customerNameInput.disabled = true;
          companyNameInput.disabled = true;
          customerEmailInput.disabled = true;
          customerPhoneInput.disabled = true;
        }
      }
    });
  }

  // Customer selection dropdown functionality for Create Invoice form
  const invoiceCustomerSelect = document.getElementById("invoiceCustomer") as HTMLSelectElement;

  if (invoiceCustomerSelect) {
    invoiceCustomerSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      const newCustomerFields = document.getElementById("invoiceNewCustomerFields") as HTMLDivElement;
      const submitBtn = document.getElementById("invoiceSubmitBtn") as HTMLButtonElement;

      if (selectedOption.value === "new") {
        // Show new customer fields
        newCustomerFields.classList.remove("d-none");

        // Update submit button text
        submitBtn.innerHTML = '<i class="bi bi-receipt me-2"></i>Create Customer & Generate Invoice';
      } else {
        // Hide new customer fields
        newCustomerFields.classList.add("d-none");

        // Reset submit button text
        submitBtn.innerHTML = '<i class="bi bi-receipt me-2"></i>Generate Invoice';
      }
    });
  }

  // Customer Management Navigation
  const addNewCustomerBtn = document.getElementById("add-new-customer-btn");
  const backToCustomersFromCreate = document.getElementById("back-to-customers-from-create");
  const customersTab = document.getElementById("customers");
  const createCustomerView = document.getElementById("create-customer");
  const createCustomerBtn = document.getElementById("create-customer-btn") as HTMLButtonElement;

  // Customer creation success message
  const customerQuoteSuccessMessage = document.getElementById("customer-quote-success-message");

  // Add New Customer button functionality
  if (addNewCustomerBtn) {
    addNewCustomerBtn.addEventListener("click", function () {
      // Hide customers tab and show create customer view
      if (customersTab) {
        customersTab.style.display = "none";
      }
      if (createCustomerView) {
        createCustomerView.style.display = "block";
      }
    });
  }

  // Back to customers from create view
  if (backToCustomersFromCreate) {
    backToCustomersFromCreate.addEventListener("click", function () {
      // Hide create customer view and show customers tab
      if (createCustomerView) {
        createCustomerView.style.display = "none";
      }
      if (customersTab) {
        customersTab.style.display = "block";
      }
    });
  }

  // Create Customer button functionality
  if (createCustomerBtn) {
    createCustomerBtn.addEventListener("click", function () {
      // Get form data (you can add validation here)
      const resellerCompanyName = (document.getElementById("reseller-company-name") as HTMLInputElement).value;
      const enduserCompanyName = (document.getElementById("enduser-company-name") as HTMLInputElement).value;
      const enduserEmail = (document.getElementById("enduser-email-subscription") as HTMLInputElement).value;
      const selectedTier = document.querySelector('input[name="subscriptionTier"]:checked');

      // Basic validation
      if (!resellerCompanyName || !enduserCompanyName || !enduserEmail || !selectedTier) {
        alert("Please fill in all required fields and select a subscription tier.");
        return;
      }

      // Show loading state
      if (createCustomerBtn) {
        createCustomerBtn.disabled = true;
        createCustomerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating...';
      }

      // Simulate customer creation (2 second delay)
      setTimeout(function () {
        // Reset button
        createCustomerBtn.disabled = false;
        createCustomerBtn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Create customer';

        // Show success and redirect to customers view
        if (createCustomerView) {
          createCustomerView.style.display = "none";
        }
        if (customersTab) {
          customersTab.style.display = "block";
        }

        // Show success message
        if (customerQuoteSuccessMessage) {
          const messageTitle = customerQuoteSuccessMessage.querySelector("div div div");
          const messageSubtext = customerQuoteSuccessMessage.querySelector("div div div.mt-1");
          if (messageTitle) messageTitle.innerHTML = "<strong>Customer created successfully!</strong>";
          if (messageSubtext) messageSubtext.textContent = "The customer has been added to your account.";
          customerQuoteSuccessMessage.classList.remove("d-none");

          // Hide success message after 5 seconds and reset text
          setTimeout(function () {
            customerQuoteSuccessMessage.classList.add("d-none");
            if (messageTitle) messageTitle.innerHTML = "<strong>Quote generated successfully!</strong>";
            if (messageSubtext) messageSubtext.textContent = "The quote has been created and is ready for review.";
          }, 5000);
        }

        // Clear the form
        clearCreateCustomerForm();
      }, 2000);
    });
  }

  // Function to clear the create customer form
  function clearCreateCustomerForm() {
    const formFields = [
      "reseller-company-name",
      "reseller-address-1",
      "reseller-address-2",
      "reseller-city",
      "reseller-post-code",
      "reseller-country",
      "reseller-tax-id",
      "enduser-company-name",
      "enduser-address-1",
      "enduser-address-2",
      "enduser-city",
      "enduser-post-code",
      "enduser-country",
      "enduser-email-subscription",
    ];

    formFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId) as HTMLInputElement;
      if (field) field.value = "";
    });

    // Clear radio buttons
    const radioButtons = document.querySelectorAll('input[name="subscriptionTier"]') as NodeListOf<HTMLInputElement>;
    radioButtons.forEach((radio) => (radio.checked = false));
  }
  

  if (invoiceCustomerSelect) {
    invoiceCustomerSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      const newCustomerFields = document.getElementById("invoiceNewCustomerFields");
      const submitBtn = document.getElementById("invoiceSubmitBtn");

      if (selectedOption.value === "new") {
        // Show new customer fields
        newCustomerFields?.classList.remove("d-none");

        // Update submit button text
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="bi bi-receipt me-2"></i>Create Customer & Generate Invoice';
        }
      } else {
        // Hide new customer fields
        newCustomerFields?.classList.add("d-none");

        // Reset submit button text
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="bi bi-receipt me-2"></i>Generate Invoice';
        }
      }
    });
  }

  // Handle Generate Quote and Generate Renewal Quote buttons from customer management
  const generateQuoteBtn = document.getElementById("generate-quote-action");
  const generateRenewalQuoteBtn = document.getElementById("generate-renewal-quote-action");

  function navigateToQuoteWithCustomer() {
    // Get customer data from the management view
    const customerEmail = (document.getElementById("mgmt-customer-email") as HTMLInputElement)?.textContent?.trim();

    // Find matching customer in the quote form dropdown
    const quoteCustomerSelect = document.getElementById("quoteCustomerSelect") as HTMLSelectElement;
    let matchingOption = null;

    // Look for matching customer by email
    for (let option of Array.from(quoteCustomerSelect?.options || [])) {
      if (option.dataset.email === customerEmail || option.textContent?.includes(customerEmail || '')) {
        matchingOption = option;
        break;
      }
    }

    // Navigate to Create a Quote tab
    const createQuoteTab = document.querySelector('a[href="#create-quote"]');
    if (createQuoteTab) {
      // Hide current customer management view
      const customerManagementView = document.getElementById("customer-management");
      const customersTab = document.getElementById("customers");
      if (customerManagementView) customerManagementView.style.display = "none";
      if (customersTab) customersTab.style.display = "block";

      // Activate the Create a Quote tab
      (createQuoteTab as HTMLElement).click();

      // Wait a moment for tab to load, then select customer
      setTimeout(function () {
        if (matchingOption) {
          quoteCustomerSelect.value = matchingOption.value;

          // Trigger the change event to populate form fields
          const changeEvent = new Event("change", { bubbles: true });
          quoteCustomerSelect.dispatchEvent(changeEvent);
        }
      }, 100);
    }
  }

  if (generateQuoteBtn) {
    generateQuoteBtn.addEventListener("click", navigateToQuoteWithCustomer);
  }

  if (generateRenewalQuoteBtn) {
    generateRenewalQuoteBtn.addEventListener("click", navigateToQuoteWithCustomer);
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

function setupInvoiceLineItems() {
  const addLineItemBtn = document.getElementById("addLineItem");
  const invoiceLineItems = document.getElementById("invoiceLineItems");

  if (addLineItemBtn && invoiceLineItems) {
    addLineItemBtn.addEventListener("click", function() {
      // Create a new table row
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>
          <input
            type="text"
            class="form-control form-control-sm form-control-minimal"
            placeholder="Item description"
            value="" />
        </td>
        <td>
          <input type="number" class="form-control form-control-sm form-control-minimal" value="1" min="1" />
        </td>
        <td>
          <input type="number" class="form-control form-control-sm form-control-minimal" value="0.00" step="0.01" />
        </td>
        <td>
          <input type="number" class="form-control form-control-sm form-control-minimal" value="0.00" readonly />
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-danger remove-line-item">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;

      // Add the new row to the table
      invoiceLineItems.appendChild(newRow);

      // Add event listeners for the new row
      setupLineItemCalculations(newRow);
      setupLineItemRemoval(newRow);
    });

    // Setup calculations for existing rows
    const existingRows = invoiceLineItems.querySelectorAll("tr");
    existingRows.forEach(row => {
      setupLineItemCalculations(row);
      setupLineItemRemoval(row);
    });
  }
}

function setupLineItemCalculations(row: Element) {
  const quantityInput = row.querySelector('input[type="number"]:nth-of-type(1)') as HTMLInputElement;
  const unitPriceInput = row.querySelector('input[type="number"]:nth-of-type(2)') as HTMLInputElement;
  const totalInput = row.querySelector('input[type="number"]:nth-of-type(3)') as HTMLInputElement;

  function calculateTotal() {
    const quantity = parseFloat(quantityInput.value) || 0;
    const unitPrice = parseFloat(unitPriceInput.value) || 0;
    const total = quantity * unitPrice;
    totalInput.value = total.toFixed(2);
  }

  if (quantityInput && unitPriceInput && totalInput) {
    quantityInput.addEventListener("input", calculateTotal);
    unitPriceInput.addEventListener("input", calculateTotal);
  }
}

function setupLineItemRemoval(row: Element) {
  const removeBtn = row.querySelector(".remove-line-item") as HTMLButtonElement;
  if (removeBtn) {
    removeBtn.addEventListener("click", function() {
      row.remove();
    });
  }
}

function setupQuoteDetailsViewing() {
  // Add click handlers to quote links in the customer management history table
  document.addEventListener("click", function(event) {
    const target = event.target as HTMLElement;
    
    // Check if the clicked element is a quote link
    if (target.tagName === "A" && target.classList.contains("text-primary") && target.textContent?.startsWith("QT-")) {
      event.preventDefault();
      
      const quoteId = target.textContent?.trim();
      if (quoteId) {
        showQuoteDetails(quoteId);
      }
    }
  });

  // Setup download quote button
  const downloadQuoteBtn = document.getElementById("downloadQuoteBtn");
  if (downloadQuoteBtn) {
    downloadQuoteBtn.addEventListener("click", function() {
      // In a real application, this would trigger a download
      // For demo purposes, we'll just show an alert
      alert("Quote PDF download would be triggered here.");
    });
  }
}

function showQuoteDetails(quoteId: string) {
  // This would normally fetch data from an API
  // For demo purposes, we'll use mock data based on the quote ID
  const mockQuoteData = getMockQuoteData(quoteId);
  
  if (!mockQuoteData) {
    console.error("Quote not found:", quoteId);
    return;
  }

  // Populate the modal with quote data
  const modalElements = {
    quoteId: document.getElementById("modal-quote-id"),
    quoteDate: document.getElementById("modal-quote-date"),
    quoteStatus: document.getElementById("modal-quote-status"),
    quoteValidUntil: document.getElementById("modal-quote-valid-until"),
    customerCompany: document.getElementById("modal-customer-company"),
    customerEmail: document.getElementById("modal-customer-email"),
    customerContact: document.getElementById("modal-customer-contact"),
    customerPhone: document.getElementById("modal-customer-phone"),
    subscriptionTier: document.getElementById("modal-subscription-tier"),
    subscriptionPeriod: document.getElementById("modal-subscription-period"),
    subscriptionAmount: document.getElementById("modal-subscription-amount"),
    quoteNotes: document.getElementById("modal-quote-notes"),
    notesSection: document.getElementById("modal-notes-section")
  };

  // Set quote information
  if (modalElements.quoteId) modalElements.quoteId.textContent = mockQuoteData.quoteId;
  if (modalElements.quoteDate) modalElements.quoteDate.textContent = mockQuoteData.dateGenerated;
  if (modalElements.quoteStatus) {
    modalElements.quoteStatus.innerHTML = `<span class="badge bg-${mockQuoteData.status === 'Accepted' ? 'success' : 'warning'} rounded-pill">${mockQuoteData.status}</span>`;
  }
  if (modalElements.quoteValidUntil) modalElements.quoteValidUntil.textContent = mockQuoteData.validUntil;

  // Set customer information
  if (modalElements.customerCompany) modalElements.customerCompany.textContent = mockQuoteData.customer.company;
  if (modalElements.customerEmail) modalElements.customerEmail.textContent = mockQuoteData.customer.email;
  if (modalElements.customerContact) modalElements.customerContact.textContent = mockQuoteData.customer.contact;
  if (modalElements.customerPhone) modalElements.customerPhone.textContent = mockQuoteData.customer.phone;

  // Set subscription details
  if (modalElements.subscriptionTier) modalElements.subscriptionTier.textContent = mockQuoteData.subscription.tier;
  if (modalElements.subscriptionPeriod) modalElements.subscriptionPeriod.textContent = mockQuoteData.subscription.period;
  if (modalElements.subscriptionAmount) modalElements.subscriptionAmount.textContent = mockQuoteData.subscription.amount;

  // Set notes (if any)
  if (mockQuoteData.notes && modalElements.quoteNotes && modalElements.notesSection) {
    modalElements.quoteNotes.textContent = mockQuoteData.notes;
    modalElements.notesSection.style.display = "block";
  } else if (modalElements.notesSection) {
    modalElements.notesSection.style.display = "none";
  }

  // Show the modal
  const modal = document.getElementById("quoteDetailsModal");
  if (modal) {
    const bootstrapModal = new (window as any).bootstrap.Modal(modal);
    bootstrapModal.show();
  }
}

function getMockQuoteData(quoteId: string) {
  // Mock data based on the quote ID from the HTML
  const mockData: { [key: string]: any } = {
    "QT-565464-4543546": {
      quoteId: "QT-565464-4543546",
      dateGenerated: "Dec 15, 2024",
      status: "Accepted",
      validUntil: "Jan 15, 2025",
      customer: {
        company: "Acme Corporation",
        email: "admin@acme.com",
        contact: "John Smith",
        phone: "+1 (555) 123-4567"
      },
      subscription: {
        tier: "Pwned 4",
        period: "Annual",
        amount: "$1,644.00"
      },
      notes: "Quote includes 16% annual discount. Payment terms: Net 30 days."
    }
  };

  return mockData[quoteId] || null;
}
