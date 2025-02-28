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
});

/**
 * Initialize all functionality for the domain search page
 */
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
      noDomainView.style.display = "block";
      domainsTableView.style.display = "none";
    } else {
      noDomainView.style.display = "none";
      domainsTableView.style.display = "block";
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
      if (dnsInstructions) dnsInstructions.style.display = "none";
      if (fileInstructions) fileInstructions.style.display = "none";
      if (metaInstructions) metaInstructions.style.display = "none";
      if (verificationSpinner) verificationSpinner.style.display = "none";

      // Show the appropriate instruction div
      const methodType = this.getAttribute("data-method");
      if (methodType === "dns" && dnsInstructions) {
        dnsInstructions.style.display = "block";
      } else if (methodType === "file" && fileInstructions) {
        fileInstructions.style.display = "block";
      } else if (methodType === "meta" && metaInstructions) {
        metaInstructions.style.display = "block";
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
      if (dnsInstructions) dnsInstructions.style.display = "none";
      if (fileInstructions) fileInstructions.style.display = "none";
      if (metaInstructions) metaInstructions.style.display = "none";

      // Show spinner
      if (verificationSpinner) verificationSpinner.style.display = "flex";

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
          <td>10</td>
          <td>100</td>
          <td class="table-actions">
            <button class="btn btn-xs btn-outline-primary me-1">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-xs btn-outline-danger remove-domain" data-domain="${domain}">
              <i class="bi bi-trash"></i>
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
          if (dnsInstructions) dnsInstructions.style.display = "block";
          if (verificationSpinner) verificationSpinner.style.display = "none";

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
