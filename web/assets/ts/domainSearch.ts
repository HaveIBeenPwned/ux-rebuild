import { Modal } from "bootstrap";

export function initDomainSearchPage() {
  // Mock data for domains
  interface Domain {
    name: string;
    addresses: string;
    stealerLogs: string;
  }
  const mockDomains: Domain[] = [
    { name: "example.com", addresses: "10", stealerLogs: "100" },
    {
      name: "mydomain.org",
      addresses: "10",
      stealerLogs: "100",
    },
  ];

  // Toggle between no domains and domains table views
  function toggleDomainViews() {
    const noDomainView = document.getElementById("noDomainView") as HTMLElement;
    const domainsTableView = document.getElementById("domainsTableView") as HTMLElement;

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
  const noDomainInput = document.getElementById("noDomainInput") as HTMLInputElement;
  const beginVerificationBtn = document.getElementById("beginVerificationBtn") as HTMLButtonElement;
  const domainInput = document.getElementById("domainInput") as HTMLInputElement;

  // When the verification modal is shown, prefill the domain input if provided
  const verificationModal = document.getElementById("verificationModal");
  if (verificationModal) {
    verificationModal.addEventListener("show.bs.modal", () => {
      if (noDomainInput && noDomainInput.value.trim() !== "") {
        domainInput.value = noDomainInput.value.trim();
      }
    });
  }

  // Variables for domain removal
  let domainToRemove: string | null = null;
  const domainRemovalPrompt = document.getElementById("domainRemovalPrompt");
  const confirmDomainRemovalBtn = document.getHtmlElementById<HTMLButtonElement>("confirmDomainRemoval");

  // Handle domain removal
  const removeButtons = document.queryHtmlElements<HTMLButtonElement>(".remove-domain");
  for (const button of removeButtons) {
    button.addEventListener("click", function (this: HTMLButtonElement) {
      domainToRemove = this.getAttribute("data-domain");
      // Show the custom prompt instead of using confirm()
      if (domainRemovalPrompt) {
        const domainRemovalModal = Modal.getOrCreateInstance(domainRemovalPrompt);
        domainRemovalModal.show();
      }
    });
  }

  // Handle confirmation of domain removal
  if (confirmDomainRemovalBtn) {
    confirmDomainRemovalBtn.addEventListener("click", () => {
      if (domainToRemove) {
        // Find the domain in the mock data
        const index = mockDomains.findIndex((d) => d.name === domainToRemove);
        if (index !== -1) {
          // Remove the domain from the mock data
          mockDomains.splice(index, 1);
          // Remove the row from the table
          const row = document.querySelector(`[data-domain="${domainToRemove}"]`);
          if (row) row.closest("tr")?.remove();
          // Toggle views if no domains left
          toggleDomainViews();
          // Reset the domainToRemove
          domainToRemove = null;
        }
      }
    });
  }

  // Handle verification method selection
  const verificationMethods = document.queryHtmlElements<HTMLElement>(".verification-method-option");
  const dnsInstructions = document.getElementById("dnsInstructions");
  const fileInstructions = document.getElementById("fileInstructions");
  const metaInstructions = document.getElementById("metaInstructions");
  const emailInstructions = document.getElementById("emailInstructions");
  const verificationSpinner = document.getElementById("verificationSpinner");
  const verifyButton = document.getHtmlElementById<HTMLButtonElement>("verifyButton");

  for (const method of verificationMethods) {
    method.addEventListener("click", function (this: HTMLElement) {
      // Remove active class from all methods
      for (const m of verificationMethods) {
        m.classList.remove("active");
      }

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
  }

  // Handle verify button click
  if (verifyButton) {
    verifyButton.addEventListener("click", () => {
      const domain = domainInput.value.trim();
      const domainInputError = document.getElementById("domainInputError") as HTMLElement;

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
      setTimeout(() => {
        // Add the new domain to the mock data
        mockDomains.push({
          name: domain,
          addresses: "10",
          stealerLogs: "100",
        });

        // Add the new domain to the table
        const tableBody = document.getElementById("domainsTableBody") as HTMLElement;
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
        const newRemoveButton = newRow.querySelector(".remove-domain") as HTMLButtonElement;
        newRemoveButton.addEventListener("click", function (this: HTMLButtonElement) {
          domainToRemove = this.getAttribute("data-domain");
          // Show the custom prompt instead of using confirm()
          if (domainRemovalPrompt) {
            const domainRemovalModal = Modal.getOrCreateInstance(domainRemovalPrompt);
            domainRemovalModal.show();
          }
        });

        // Close the modal
        if (verificationModal) {
          const verificationModalInstance = Modal.getOrCreateInstance(verificationModal);
          verificationModalInstance.hide();
        }

        // Reset the modal state for next open
        setTimeout(() => {
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
          for (const m of verificationMethods) {
            m.classList.remove("active");
          }

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
    domainInput.addEventListener("input", function (this: HTMLInputElement) {
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
