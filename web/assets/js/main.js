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
});

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
  if (
    event.target.classList.contains("toggle-details") ||
    event.target.parentElement.classList.contains("toggle-details")
  ) {
    const button = event.target.classList.contains("toggle-details")
      ? event.target
      : event.target.parentElement;

    const breachId = button.getAttribute("data-breach-id");
    const detailsElement = document.getElementById(`details-${breachId}`);

    // Toggle the details section
    if (detailsElement.classList.contains("show")) {
      detailsElement.classList.remove("show");
      button.textContent = "More details";
    } else {
      detailsElement.classList.add("show");
      button.textContent = "Less details";
    }
  }

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

// Mock data for domains
function initDomainSearchPage() {
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
      noDomainView.style.display = "block";
      domainsTableView.style.display = "none";
    } else {
      noDomainView.style.display = "none";
      domainsTableView.style.display = "block";
    }
  }

  // Initialize the view
  toggleDomainViews();
}
