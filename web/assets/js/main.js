/**
 * Custom JavaScript for Have I Been Pwned
 * Contains functionality for domain search page and other interactive elements
 */

// Domain Search Page Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize domain search page if elements exist
  if (
    document.getElementById("domainsTableView") ||
    document.getElementById("noDomainView")
  ) {
    initDomainSearchPage();
  }

  // Initialize breach timeline functionality if elements exist
  if (
    document.getElementById("emailInput") &&
    document.getElementById("checkButton")
  ) {
    initBreachTimeline();
  }

  // Initialize navbar menu background toggle
  initNavbarMenuToggle();
});

/**
 * Initialize the navbar menu background toggle functionality
 */
function initNavbarMenuToggle() {
  const navbar = document.querySelector(".navbar");
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.getElementById("navbarNav");

  if (navbar && navbarToggler && navbarCollapse) {
    // Toggle the menu-open class when the menu visibility changes
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === "class") {
          if (navbarCollapse.classList.contains("show")) {
            navbar.classList.add("menu-open");
          } else {
            navbar.classList.remove("menu-open");
          }
        }
      });
    });

    // Observe the navbar-collapse element for class changes
    observer.observe(navbarCollapse, { attributes: true });
  }
}

// Sample breach data for the timeline (used for the paste details modal)
const breachData = [
  {
    id: 1,
    service: "LinkedIn",
    date: "2012-06-05",
    description: "Email addresses, passwords (SHA1 hashes without salt)",
    impactedAccounts: "164 million",
    severity: "high",
    details:
      "In 2012, LinkedIn suffered a data breach that exposed the stored credentials of 164 million users. The passwords were stored as SHA1 hashes without salt, making them easily crackable. The data remained out of sight until being offered for sale on a dark market site 4 years later.",
    recommendations: [
      "Change your LinkedIn password immediately",
      "Enable two-factor authentication",
      "Don't reuse this password on other sites",
    ],
    dataTypes: ["Email addresses", "Passwords", "User names"],
    discoveredDate: "2016-05-18",
    breachUrl:
      "https://www.linkedin.com/help/linkedin/answer/a1310/linkedin-account-security-matters",
    type: "breach",
  },
  {
    id: 2,
    service: "Adobe",
    date: "2013-10-04",
    description: "Email addresses, encrypted passwords, customer names",
    impactedAccounts: "153 million",
    severity: "high",
    details:
      "In October 2013, Adobe suffered a security breach that exposed user account information. The compromised data included email addresses, encrypted passwords, customer names, and payment information.",
    recommendations: [
      "Change your Adobe password",
      "Monitor your financial statements",
      "Be cautious of phishing attempts",
    ],
    dataTypes: [
      "Email addresses",
      "Encrypted passwords",
      "Customer names",
      "Payment information",
    ],
    discoveredDate: "2013-10-04",
    breachUrl:
      "https://helpx.adobe.com/security/products/secure-engineering.html",
    type: "breach",
  },
  {
    id: 3,
    service: "Dropbox",
    date: "2016-08-31",
    description: "Email addresses, passwords",
    impactedAccounts: "68 million",
    severity: "medium",
    details:
      "In 2016, Dropbox confirmed a data breach from 2012 had exposed details of over 68 million accounts, including email addresses and passwords that were salted and hashed.",
    recommendations: [
      "Change your Dropbox password",
      "Enable two-factor authentication",
      "Check if files were accessed",
    ],
    dataTypes: ["Email addresses", "Hashed passwords"],
    discoveredDate: "2016-08-31",
    breachUrl: "https://www.dropbox.com/security",
    type: "paste",
  },
  {
    id: 4,
    service: "Canva",
    date: "2019-05-24",
    description: "Email addresses, names, usernames, cities, passwords",
    impactedAccounts: "137 million",
    severity: "medium",
    details:
      "In May 2019, the graphic design tool Canva suffered a data breach that impacted 137 million users. The exposed data included email addresses, names, usernames, cities, and passwords stored as bcrypt hashes.",
    recommendations: [
      "Change your Canva password",
      "Be cautious of targeted phishing attempts",
      "Check for suspicious activity",
    ],
    dataTypes: [
      "Email addresses",
      "Names",
      "Usernames",
      "Geographic locations",
      "Hashed passwords",
    ],
    discoveredDate: "2019-05-24",
    breachUrl: "https://www.canva.com/security/",
    type: "breach",
  },
  {
    id: 5,
    service: "Marriott",
    date: "2020-03-31",
    description:
      "Names, addresses, phone numbers, email addresses, loyalty account info",
    impactedAccounts: "5.2 million",
    severity: "low",
    details:
      "In March 2020, Marriott announced a data breach affecting 5.2 million guests. The breach exposed names, addresses, phone numbers, birth dates, email addresses, and loyalty account information.",
    recommendations: [
      "Monitor your Marriott Bonvoy account",
      "Be alert for identity theft",
      "Consider freezing your credit",
    ],
    dataTypes: [
      "Names",
      "Addresses",
      "Phone numbers",
      "Email addresses",
      "Loyalty account information",
    ],
    discoveredDate: "2020-03-31",
    breachUrl: "https://marriott.com/loyalty/data-security-incident.mi",
    type: "paste",
  },
];

/**
 * Initialize the breach timeline functionality
 */
function initBreachTimeline() {
  const emailInput = document.getElementById("emailInput");
  const checkButton = document.getElementById("checkButton");
  const breachTimelineSection = document.getElementById("breachTimeline");

  // Add click event listener to the check button
  checkButton.addEventListener("click", function () {
    const email = emailInput.value.trim();

    if (email === "") {
      // Show validation error if email is empty
      emailInput.classList.add("is-invalid");
      return;
    }

    // Clear any previous validation errors
    emailInput.classList.remove("is-invalid");

    // Show the breach timeline section
    breachTimelineSection.classList.remove("d-none");

    // Scroll to the breach timeline section
    breachTimelineSection.scrollIntoView({ behavior: "smooth" });
  });

  // Add input event listener to clear error when user types
  emailInput.addEventListener("input", function () {
    if (this.value.trim() !== "") {
      this.classList.remove("is-invalid");
    }
  });
}

/**
 * Get the Bootstrap color class based on severity
 * @param {string} severity - The severity level (low, medium, high)
 * @returns {string} - The Bootstrap color class
 */
function getSeverityClass(severity) {
  switch (severity.toLowerCase()) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    case "low":
      return "secondary";
    default:
      return "secondary";
  }
}

// Add event delegation for the "More details" buttons
document.addEventListener("click", function (event) {
  // Handle paste details modal
  if (
    event.target.hasAttribute("data-paste-id") ||
    event.target.parentElement.hasAttribute("data-paste-id")
  ) {
    const button = event.target.hasAttribute("data-paste-id")
      ? event.target
      : event.target.parentElement;

    const pasteId = button.getAttribute("data-paste-id");
    const paste = breachData.find((item) => item.id.toString() === pasteId);

    if (paste) {
      const modalBody = document.getElementById("pasteDetailsModalBody");
      const modalTitle = document.getElementById("pasteDetailsModalLabel");

      // Update modal title
      modalTitle.textContent = `${paste.service} Paste Details`;

      // Create the details content
      let dataTypesHtml = "";
      paste.dataTypes.forEach((dataType) => {
        dataTypesHtml += `<li><i class="bi bi-dot"></i>${dataType}</li>`;
      });

      let recommendationsHtml = "";
      paste.recommendations.forEach((recommendation) => {
        recommendationsHtml += `<li><i class="bi bi-check-circle"></i>${recommendation}</li>`;
      });

      // Update modal body
      modalBody.innerHTML = `
        <div class="row">
          <div class="col-12">
            <div class="d-flex align-items-center mb-3">
              <div class="bg-dark rounded p-2 me-3">
                <i class="bi bi-clipboard-data fs-3"></i>
              </div>
              <div>
                <h5 class="mb-0">${paste.service}</h5>
                <p class="text-muted mb-0">Paste found on ${new Date(
                  paste.date
                ).toLocaleDateString()}</p>
              </div>
              <span class="ms-auto badge bg-${getSeverityClass(
                paste.severity
              )}">${paste.severity}</span>
            </div>
            
            <h6 class="mt-4 mb-2">Full Description</h6>
            <p>${paste.details}</p>
            
            <div class="row mt-4">
              <div class="col-md-6">
                <h6 class="mb-2">Compromised Data Types</h6>
                <ul class="timeline-details-list">
                  ${dataTypesHtml}
                </ul>
              </div>
              <div class="col-md-6">
                <h6 class="mb-2">Recommended Actions</h6>
                <ul class="timeline-details-list">
                  ${recommendationsHtml}
                </ul>
              </div>
            </div>
            
            <div class="mt-4">
              <h6 class="mb-2">Important Information</h6>
              <ul class="timeline-details-list">
                <li><i class="bi bi-people"></i><strong>Impacted accounts:</strong> ${
                  paste.impactedAccounts
                }</li>
                <li><i class="bi bi-calendar-event"></i><strong>Date found:</strong> ${new Date(
                  paste.date
                ).toLocaleDateString()}</li>
                <li><i class="bi bi-calendar-check"></i><strong>Date discovered:</strong> ${new Date(
                  paste.discoveredDate
                ).toLocaleDateString()}</li>
              </ul>
            </div>
            
            <div class="mt-4">
              <a href="${
                paste.breachUrl
              }" target="_blank" class="btn btn-primary">
                Official Information <i class="bi bi-box-arrow-up-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }
  }
});

function initDomainSearchPage() {
  // Mock data for domains
  const mockDomains = [
    { name: "example.com", addresses: "10", stealerLogs: "100" },
    {
      name: "mydomain.org",
      addresses: "10",
      stealerLogs: "100",
    },
  ];

  // Toggle between no domains and domains table views
  function toggleDomainViews() {
    const noDomainView = document.getElementById("noDomainView");
    const domainsTableView = document.getElementById("domainsTableView");

    if (mockDomains.length === 0) {
      noDomainView.classList.remove("d-none");
      noDomainView.classList.add("d-block");
      domainsTableView.classList.add("d-none");
      domainsTableView.classList.remove("d-block");
    } else {
      noDomainView.classList.add("d-none");
      noDomainView.classList.remove("d-block");
      domainsTableView.classList.remove("d-none");
      domainsTableView.classList.add("d-block");
    }
  }

  // Initialize the view
  toggleDomainViews();

  // Handle domain input from the no domain view
  const noDomainInput = document.getElementById("noDomainInput");
  const beginVerificationBtn = document.getElementById("beginVerificationBtn");
  const domainInput = document.getElementById("domainInput");

  // When the verification modal is shown, prefill the domain input if provided
  const verificationModal = document.getElementById("verificationModal");
  if (verificationModal) {
    verificationModal.addEventListener("show.bs.modal", function () {
      if (noDomainInput && noDomainInput.value.trim() !== "") {
        domainInput.value = noDomainInput.value.trim();
      }
    });
  }

  // Variables for domain removal
  let domainToRemove = null;
  const domainRemovalPrompt = document.getElementById("domainRemovalPrompt");
  const confirmDomainRemovalBtn = document.getElementById(
    "confirmDomainRemoval"
  );

  // Handle domain removal
  const removeButtons = document.querySelectorAll(".remove-domain");
  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      domainToRemove = this.getAttribute("data-domain");
      // Show the custom prompt instead of using confirm()
      const domainRemovalModal = new bootstrap.Modal(domainRemovalPrompt);
      domainRemovalModal.show();
    });
  });

  // Handle confirmation of domain removal
  if (confirmDomainRemovalBtn) {
    confirmDomainRemovalBtn.addEventListener("click", function () {
      if (domainToRemove) {
        // Find the domain in the mock data
        const index = mockDomains.findIndex((d) => d.name === domainToRemove);
        if (index !== -1) {
          // Remove the domain from the mock data
          mockDomains.splice(index, 1);
          // Remove the row from the table
          document
            .querySelector(`[data-domain="${domainToRemove}"]`)
            .closest("tr")
            .remove();
          // Toggle views if no domains left
          toggleDomainViews();
          // Reset the domainToRemove
          domainToRemove = null;
        }
      }
    });
  }

  // Handle verification method selection
  const verificationMethods = document.querySelectorAll(
    ".verification-method-option"
  );
  const dnsInstructions = document.getElementById("dnsInstructions");
  const fileInstructions = document.getElementById("fileInstructions");
  const metaInstructions = document.getElementById("metaInstructions");
  const emailInstructions = document.getElementById("emailInstructions");
  const verificationSpinner = document.getElementById("verificationSpinner");
  const verifyButton = document.getElementById("verifyButton");

  verificationMethods.forEach((method) => {
    method.addEventListener("click", function () {
      // Remove active class from all methods
      verificationMethods.forEach((m) => {
        m.classList.remove("active");
      });

      // Add active class to clicked method
      this.classList.add("active");

      // Hide all instruction divs
      if (dnsInstructions) {
        dnsInstructions.classList.add("d-none");
        dnsInstructions.classList.remove("d-block");
      }
      if (fileInstructions) {
        fileInstructions.classList.add("d-none");
        fileInstructions.classList.remove("d-block");
      }
      if (metaInstructions) {
        metaInstructions.classList.add("d-none");
        metaInstructions.classList.remove("d-block");
      }
      if (emailInstructions) {
        emailInstructions.classList.add("d-none");
        emailInstructions.classList.remove("d-block");
      }
      if (verificationSpinner) {
        verificationSpinner.classList.add("d-none");
        verificationSpinner.classList.remove("d-block");
      }

      // Show the appropriate instruction div
      const methodType = this.getAttribute("data-method");
      if (methodType === "dns" && dnsInstructions) {
        dnsInstructions.classList.remove("d-none");
        dnsInstructions.classList.add("d-block");
      } else if (methodType === "file" && fileInstructions) {
        fileInstructions.classList.remove("d-none");
        fileInstructions.classList.add("d-block");
      } else if (methodType === "meta" && metaInstructions) {
        metaInstructions.classList.remove("d-none");
        metaInstructions.classList.add("d-block");
      } else if (methodType === "email" && emailInstructions) {
        emailInstructions.classList.remove("d-none");
        emailInstructions.classList.add("d-block");
      }
    });
  });

  // Handle verify button click
  if (verifyButton) {
    verifyButton.addEventListener("click", function () {
      const domain = domainInput.value.trim();
      const domainInputError = document.getElementById("domainInputError");

      if (!domain) {
        // Show validation error
        domainInput.classList.add("is-invalid");
        domainInputError.classList.add("show");
        return;
      }

      // Clear any previous validation errors
      domainInput.classList.remove("is-invalid");
      domainInputError.classList.remove("show");

      // Hide all instruction divs
      if (dnsInstructions) {
        dnsInstructions.classList.add("d-none");
        dnsInstructions.classList.remove("d-block");
      }
      if (fileInstructions) {
        fileInstructions.classList.add("d-none");
        fileInstructions.classList.remove("d-block");
      }
      if (metaInstructions) {
        metaInstructions.classList.add("d-none");
        metaInstructions.classList.remove("d-block");
      }
      if (emailInstructions) {
        emailInstructions.classList.add("d-none");
        emailInstructions.classList.remove("d-block");
      }
      if (verificationSpinner) {
        verificationSpinner.classList.add("d-none");
        verificationSpinner.classList.remove("d-block");
      }

      // Show spinner
      if (verificationSpinner) {
        verificationSpinner.classList.remove("d-none");
        verificationSpinner.classList.add("d-flex");
      }

      // Simulate verification process (6 seconds)
      setTimeout(function () {
        // Add the new domain to the mock data
        mockDomains.push({
          name: domain,
          addresses: "10",
          stealerLogs: "100",
        });

        // Add the new domain to the table
        const tableBody = document.getElementById("domainsTableBody");
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${domain}</td>
          <td class="text-end">10</td>
          <td class="text-end">100</td>
          <td class="table-actions">            
            <button class="btn btn-xs btn-outline-danger remove-domain" data-domain="${domain}">
              <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-xs btn-outline-primary me-1">
              <i class="bi bi-search"></i>
            </button>
          </td>
        `;
        tableBody.appendChild(newRow);

        // Add event listener to the new remove button
        const newRemoveButton = newRow.querySelector(".remove-domain");
        newRemoveButton.addEventListener("click", function () {
          domainToRemove = this.getAttribute("data-domain");
          // Show the custom prompt instead of using confirm()
          const domainRemovalModal = new bootstrap.Modal(domainRemovalPrompt);
          domainRemovalModal.show();
        });

        // Close the modal
        const verificationModalInstance =
          bootstrap.Modal.getInstance(verificationModal);
        verificationModalInstance.hide();

        // Reset the modal state for next open
        setTimeout(function () {
          domainInput.value = "";
          if (noDomainInput) noDomainInput.value = "";
          if (dnsInstructions) {
            dnsInstructions.classList.remove("d-none");
            dnsInstructions.classList.add("d-block");
          }
          if (verificationSpinner) {
            verificationSpinner.classList.add("d-none");
            verificationSpinner.classList.remove("d-flex");
          }

          // Reset verification method buttons
          verificationMethods.forEach((m) => {
            m.classList.remove("active");
          });

          // Set the first method as active
          if (verificationMethods.length > 0) {
            verificationMethods[0].classList.add("active");
          }
        }, 500);

        // Toggle views
        toggleDomainViews();
      }, 6000);
    });
  }

  // Add input event listener to clear error when user types
  if (domainInput) {
    domainInput.addEventListener("input", function () {
      if (this.value.trim() !== "") {
        this.classList.remove("is-invalid");
        const domainInputError = document.getElementById("domainInputError");
        if (domainInputError) {
          domainInputError.classList.remove("show");
        }
      }
    });
  }
}
