import { Tooltip } from "bootstrap";
import { delay } from "../utils";

// API Key generation functionality
export function setupApiKeyGeneration() {
  const generateButton = document.getHtmlElementById<HTMLButtonElement>("generateApiKeyBtn");
  const apiKeyGenerateSection = document.getHtmlElementById<HTMLElement>("apiKeyGenerateSection");
  const apiKeyDisplaySection = document.getHtmlElementById<HTMLElement>("apiKeyDisplaySection");
  const apiKeyDisplay = document.getHtmlElementById<HTMLInputElement>("apiKeyDisplay");
  const copyApiKeyBtn = document.getHtmlElementById<HTMLButtonElement>("copyApiKeyBtn");

  if (!generateButton || !apiKeyGenerateSection || !apiKeyDisplaySection || !apiKeyDisplay) {
    return; // Required elements not found
  }

  // Initialize tooltips for copy button
  if (copyApiKeyBtn) {
    new Tooltip(copyApiKeyBtn);
  }

  // Generate API key button click handler
  generateButton.addEventListener("click", async () => {
    // Show loading state
    const originalContent = generateButton.innerHTML;
    generateButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Generating...';
    generateButton.disabled = true;

    // Simulate API call to generate a key (2 seconds)
    const apiKey = await generateMockApiKey();

    // Update the UI
    apiKeyDisplay.value = apiKey;

    // Show the key display section and hide the generate button
    apiKeyGenerateSection.classList.add("d-none");
    apiKeyDisplaySection.classList.remove("d-none");

    // Reset the generate button state
    generateButton.innerHTML = originalContent;
    generateButton.disabled = false;
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
  async function generateMockApiKey() {
    await delay(2000);
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
