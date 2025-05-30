// Customer filtering and management functionality for the reseller dashboard

export function setupCustomerFiltering(): void {
  const searchInput = document.getElementById("customerSearch") as HTMLInputElement;
  const statusFilter = document.getElementById("customerStatusFilter") as HTMLSelectElement;
  const customersTable = document.querySelector("#customers tbody") as HTMLTableSectionElement;

  if (!searchInput || !statusFilter || !customersTable) {
    return; // Elements not found, probably not on the customers tab
  }

  // Get all customer rows
  const getAllCustomerRows = (): HTMLTableRowElement[] => {
    return Array.from(customersTable.querySelectorAll("tr"));
  };

  // Filter customers based on search and status
  const filterCustomers = (): void => {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const rows = getAllCustomerRows();

    rows.forEach((row) => {
      const customerName = row.cells[0]?.textContent?.toLowerCase() || "";
      const customerEmail = row.cells[1]?.textContent?.toLowerCase() || "";
      const status = row.cells[4]?.textContent?.toLowerCase() || "";

      const matchesSearch = customerName.includes(searchTerm) || customerEmail.includes(searchTerm);
      const matchesStatus = statusValue === "all" || status.includes(statusValue.toLowerCase());

      if (matchesSearch && matchesStatus) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });

    updateResultsDisplay();
  };

  // Update results display
  const updateResultsDisplay = (): void => {
    const visibleRows = getAllCustomerRows().filter((row) => row.style.display !== "none");
    console.log(`Showing ${visibleRows.length} customers`);
  };

  // Event listeners
  searchInput.addEventListener("input", filterCustomers);
  statusFilter.addEventListener("change", filterCustomers);

  // Setup customer management functionality
  setupCustomerManagement();
  
  // Setup tab navigation to hide views when switching tabs
  setupTabNavigation();
  
  // Setup Create a Quote functionality
  setupCreateQuote();
  
  // Setup Create an Invoice functionality
  setupCreateInvoice();
}

// Setup customer management functionality
function setupCustomerManagement(): void {
  const customersTable = document.querySelector("#customers tbody");
  if (!customersTable) return;

  // Add click handlers to customer management buttons
  customersTable.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest("button");
    
    if (button && button.title === "Manage Customer") {
      const row = button.closest("tr") as HTMLTableRowElement;
      if (row) {
        const customerData = extractCustomerData(row);
        showCustomerManagement(customerData);
      }
    }
  });

  // Setup back button
  setupBackButton();
}

// Extract customer data from table row
function extractCustomerData(row: HTMLTableRowElement) {
  const cells = row.cells;
  return {
    name: cells[0]?.textContent?.trim() || "",
    email: cells[1]?.textContent?.trim() || "",
    tier: cells[2]?.textContent?.trim() || "",
    period: cells[3]?.textContent?.trim() || "",
    status: cells[4]?.textContent?.trim() || "",
    created: cells[5]?.textContent?.trim() || "",
  };
}

// Show customer management view
function showCustomerManagement(customerData: any): void {
  // Hide customers table and show customer management
  const customersTab = document.getElementById("customers");
  const customerManagement = document.getElementById("customer-management");
  
  if (customersTab && customerManagement) {
    customersTab.style.display = "none";
    customerManagement.style.display = "block";
    
    // Populate customer data
    populateCustomerManagement(customerData);
    
    // Setup quote actions based on subscription status
    setupQuoteActions(customerData);
  }
}

// Populate customer management with data
function populateCustomerManagement(customerData: any): void {
  // Update customer information
  const emailElement = document.getElementById("mgmt-customer-email");
  const tierElement = document.getElementById("mgmt-subscription-tier");
  const statusElement = document.getElementById("mgmt-subscription-status");
  
  if (emailElement) emailElement.textContent = customerData.email;
  if (tierElement) tierElement.textContent = customerData.tier;
  if (statusElement) statusElement.textContent = customerData.status;
  
  // Set period and renewal date (mock data for now)
  const periodElement = document.getElementById("mgmt-subscription-period");
  const renewalElement = document.getElementById("mgmt-next-renewal");
  
  if (periodElement) periodElement.textContent = "1 Jan 2025 - 1 Jan 2026";
  if (renewalElement) renewalElement.textContent = "1 Jan 2026";
}

// Setup quote actions based on subscription status and expiry
function setupQuoteActions(customerData: any): void {
  const generateQuoteAction = document.getElementById("generate-quote-action") as HTMLButtonElement;
  const generateRenewalQuoteAction = document.getElementById("generate-renewal-quote-action") as HTMLButtonElement;
  const renewalQuoteStatus = document.getElementById("renewal-quote-status");
  
  if (!generateQuoteAction || !generateRenewalQuoteAction) return;
  
  // Hide both actions initially
  generateQuoteAction.classList.add("d-none");
  generateRenewalQuoteAction.classList.add("d-none");
  
  const status = customerData.status.toLowerCase();
  
  if (status.includes("expired")) {
    // Show "Generate Quote" for expired subscriptions
    generateQuoteAction.classList.remove("d-none");
    
    // Add click handler to navigate to Create a Quote tab
    generateQuoteAction.addEventListener("click", () => {
      navigateToCreateQuote(customerData, false);
    });
  } else {
    // Show "Generate Renewal Quote" for active subscriptions
    generateRenewalQuoteAction.classList.remove("d-none");
    
    // Calculate days until expiry (mock calculation)
    const daysUntilExpiry = 30; // This would be calculated from actual expiry date
    
    if (daysUntilExpiry > 45) {
      // Disable renewal quote generation
      generateRenewalQuoteAction.disabled = true;
      generateRenewalQuoteAction.classList.add("opacity-50");
      if (renewalQuoteStatus) {
        renewalQuoteStatus.innerHTML = `<i class="bi bi-x-circle-fill me-1"></i>Renewal quotes can only be generated 45 days before expiry`;
        renewalQuoteStatus.classList.add("text-muted");
        renewalQuoteStatus.classList.remove("text-success");
      }
    } else {
      // Enable renewal quote generation
      generateRenewalQuoteAction.disabled = false;
      generateRenewalQuoteAction.classList.remove("opacity-50");
      
      // Add click handler to navigate to Create a Quote tab
      generateRenewalQuoteAction.addEventListener("click", () => {
        navigateToCreateQuote(customerData, true);
      });
      
      if (renewalQuoteStatus) {
        renewalQuoteStatus.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>Renewal quote available (${daysUntilExpiry} days until expiry)`;
        renewalQuoteStatus.classList.remove("text-muted");
        renewalQuoteStatus.classList.add("text-success");
      }
    }
  }
}

// Navigate to Create a Quote tab with customer data
function navigateToCreateQuote(customerData: any, isRenewal: boolean): void {
  // Hide customer management view
  hideCustomerManagement();
  
  // Navigate to Create a Quote tab
  const createQuoteTab = document.querySelector('a[href="#create-quote"]') as HTMLAnchorElement;
  if (createQuoteTab) {
    createQuoteTab.click();
  }
  
  // Pre-populate form with customer data
  setTimeout(() => {
    populateQuoteForm(customerData, isRenewal);
  }, 100);
}

// Populate quote form with customer data
function populateQuoteForm(customerData: any, isRenewal: boolean): void {
  // Extract company name from customer name (assuming format like "Acme Corporation")
  const companyName = customerData.name;
  
  // Populate form fields
  const customerNameField = document.getElementById("quoteCustomerName") as HTMLInputElement;
  const companyNameField = document.getElementById("quoteCompanyName") as HTMLInputElement;
  const customerEmailField = document.getElementById("quoteCustomerEmail") as HTMLInputElement;
  const planField = document.getElementById("quotePlan") as HTMLSelectElement;
  const billingCycleField = document.getElementById("quoteBillingCycle") as HTMLSelectElement;
  
  if (customerNameField) customerNameField.value = "Contact Person"; // This would come from customer data
  if (companyNameField) companyNameField.value = companyName;
  if (customerEmailField) customerEmailField.value = customerData.email;
  
  // Set plan based on current tier
  if (planField) {
    const tierMap: { [key: string]: string } = {
      "Pwned 1": "pwned1",
      "Pwned 2": "pwned2", 
      "Pwned 3": "pwned3",
      "Pwned 4": "pwned4",
      "Pwned 5": "pwned5"
    };
    const planValue = tierMap[customerData.tier];
    if (planValue) {
      planField.value = planValue;
    }
  }
  
  // Set billing cycle based on current period
  if (billingCycleField) {
    const isYearly = customerData.period.toLowerCase().includes("annual");
    billingCycleField.value = isYearly ? "yearly" : "monthly";
  }
  
  // Set default valid until date (30 days from now)
  const validUntilField = document.getElementById("quoteValidUntil") as HTMLInputElement;
  if (validUntilField) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    validUntilField.value = futureDate.toISOString().split('T')[0];
  }
  
  // Add note about renewal if applicable
  const notesField = document.getElementById("quoteNotes") as HTMLTextAreaElement;
  if (notesField && isRenewal) {
    notesField.value = `Renewal quote for existing ${customerData.tier} subscription.`;
  }
  
  // Store customer data for success message
  (window as any).currentCustomerData = customerData;
}

// Setup back button functionality
function setupBackButton(): void {
  const backButton = document.getElementById("back-to-customers");
  
  if (backButton) {
    backButton.addEventListener("click", () => {
      hideCustomerManagement();
    });
  }
}

// Setup tab navigation to hide customer management view when switching tabs
function setupTabNavigation(): void {
  // Get all tab navigation links
  const tabLinks = document.querySelectorAll('[data-bs-toggle="pill"]');
  
  tabLinks.forEach((link) => {
    link.addEventListener('shown.bs.tab', (event) => {
      const target = (event.target as HTMLAnchorElement).getAttribute('href');
      
      // If navigating away from customers tab, hide customer management view
      if (target && target !== '#customers') {
        hideCustomerManagement();
      }
    });
  });
}

// Hide customer management view and show customers table
function hideCustomerManagement(): void {
  const customersTab = document.getElementById("customers");
  const customerManagement = document.getElementById("customer-management");
  
  if (customersTab && customerManagement) {
    // Reset the customers tab to its normal Bootstrap tab behavior
    customersTab.style.display = "";
    customerManagement.style.display = "none";
  }
}

// Setup Create a Quote functionality
function setupCreateQuote(): void {
  const createQuoteForm = document.getElementById("createQuoteForm");
  const quoteSuccessMessage = document.getElementById("quote-success-message");
  const quoteFormSection = document.getElementById("quote-form-section");
  const backToCustomerLink = document.getElementById("back-to-customer-link");
  
  if (!createQuoteForm) return;
  
  // Handle form submission
  createQuoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    // Simulate quote generation
    setTimeout(() => {
      // Get customer data if available
      const customerData = (window as any).currentCustomerData;
      
      // Navigate to customers tab
      const customersTab = document.querySelector('a[href="#customers"]') as HTMLAnchorElement;
      if (customersTab) {
        customersTab.click();
      }
      
      // Show success message in customers section
      const customerQuoteSuccessMessage = document.getElementById("customer-quote-success-message");
      if (customerQuoteSuccessMessage) {
        customerQuoteSuccessMessage.classList.remove("d-none");
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          customerQuoteSuccessMessage.classList.add("d-none");
        }, 5000);
      }
      
      // Clear stored customer data
      (window as any).currentCustomerData = null;
    }, 1000);
  });
  
  // Reset form when Create a Quote tab is shown
  const createQuoteTabLink = document.querySelector('a[href="#create-quote"]');
  if (createQuoteTabLink) {
    createQuoteTabLink.addEventListener('shown.bs.tab', () => {
      // Reset form display
      if (quoteFormSection) quoteFormSection.style.display = "block";
      if (quoteSuccessMessage) quoteSuccessMessage.classList.add("d-none");
      
      // Clear form if not coming from customer management
      if (!(window as any).currentCustomerData) {
        (createQuoteForm as HTMLFormElement).reset();
      }
    });
  }
}

// Setup Create an Invoice functionality
function setupCreateInvoice(): void {
  const invoiceQuoteSelect = document.getElementById("invoiceQuote") as HTMLSelectElement;
  const selectedQuoteDetails = document.getElementById("selected-quote-details");
  const invoiceCustomerSelect = document.getElementById("invoiceCustomer") as HTMLSelectElement;
  
  if (!invoiceQuoteSelect) return;
  
  // Handle quote selection
  invoiceQuoteSelect.addEventListener("change", function() {
    const selectedOption = this.options[this.selectedIndex];
    
    if (this.value === "") {
      // No quote selected - hide details card
      if (selectedQuoteDetails) {
        selectedQuoteDetails.classList.add("d-none");
      }
      // Clear any auto-populated fields
      clearInvoiceFields();
    } else {
      // Quote selected - show details and populate fields
      const customerValue = selectedOption.dataset.customer;
      const amount = selectedOption.dataset.amount;
      const tier = selectedOption.dataset.tier;
      const period = selectedOption.dataset.period;
      const quoteText = selectedOption.textContent || "";
      
      // Extract quote ID from the text
      const quoteId = quoteText.split(" - ")[0];
      const customerName = quoteText.split(" - ")[1];
      
      // Show and populate quote details card
      if (selectedQuoteDetails) {
        selectedQuoteDetails.classList.remove("d-none");
        
        const quoteDetailId = document.getElementById("quote-detail-id");
        const quoteDetailCustomer = document.getElementById("quote-detail-customer");
        const quoteDetailSubscription = document.getElementById("quote-detail-subscription");
        const quoteDetailAmount = document.getElementById("quote-detail-amount");
        
        if (quoteDetailId) quoteDetailId.textContent = quoteId;
        if (quoteDetailCustomer) quoteDetailCustomer.textContent = customerName;
        if (quoteDetailSubscription) quoteDetailSubscription.textContent = `${tier} - ${period}`;
        if (quoteDetailAmount) quoteDetailAmount.textContent = `$${amount}`;
      }
      
      // Auto-populate customer selection
      if (invoiceCustomerSelect && customerValue) {
        invoiceCustomerSelect.value = customerValue;
      }
      
      // Auto-populate line items
      if (tier && period && amount) {
        populateInvoiceLineItems(tier, period, amount);
        
        // Update invoice summary
        updateInvoiceSummary(amount);
      }
    }
  });
}

// Clear invoice fields when no quote is selected
function clearInvoiceFields(): void {
  // Clear line items to default
  const lineItemsBody = document.getElementById("invoiceLineItems");
  if (lineItemsBody) {
    lineItemsBody.innerHTML = `
      <tr>
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
          <button type="button" class="btn btn-sm btn-outline-danger">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }
  
  // Reset invoice summary
  updateInvoiceSummary("0.00");
}

// Populate invoice line items based on selected quote
function populateInvoiceLineItems(tier: string, period: string, amount: string): void {
  const lineItemsBody = document.getElementById("invoiceLineItems");
  if (lineItemsBody) {
    const description = `${tier} Subscription - ${period}`;
    lineItemsBody.innerHTML = `
      <tr>
        <td>
          <input
            type="text"
            class="form-control form-control-sm form-control-minimal"
            placeholder="Item description"
            value="${description}" />
        </td>
        <td>
          <input type="number" class="form-control form-control-sm form-control-minimal" value="1" min="1" />
        </td>
        <td>
          <input type="number" class="form-control form-control-sm form-control-minimal" value="${amount}" step="0.01" />
        </td>
        <td>
          <input type="number" class="form-control form-control-sm form-control-minimal" value="${amount}" readonly />
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-danger">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }
}

// Update invoice summary totals
function updateInvoiceSummary(amount: string): void {
  const subtotalElement = document.querySelector('.card-body .d-flex:nth-child(1) span:nth-child(2)');
  const totalElement = document.querySelector('.card-body .d-flex.fw-bold span:nth-child(2)');
  
  if (subtotalElement) subtotalElement.textContent = `$${amount}`;
  if (totalElement) totalElement.textContent = `$${amount}`;
} 