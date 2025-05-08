import { delay } from "./utils";

export function initializeEmailVerification() {
  const verificationSuccess = document.getElementById("verificationSuccess");
  const verificationProcessing = document.getElementById("verificationProcessing");

  if (verificationSuccess && verificationProcessing) {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    // Update domain name in the success message using the ID
    if (token) {
      verificationSuccess.classList.add("d-none");
      verificationProcessing.classList.remove("d-none");
      verifyEmail(token).then((domain) => {
        verificationSuccess.classList.remove("d-none");
        verificationProcessing.classList.add("d-none");

        // Update the domain name in the success message
        const domainElement = document.getElementById("domainName");
        if (domainElement) {
          domainElement.textContent = domain;
        }
      });
    } else {
      // Handle different states based on token
      if (!token) {
        // No token provided
        const invalidToken = document.getElementById("invalidToken");
        if (verificationSuccess && invalidToken) {
          verificationSuccess.style.display = "none";
          invalidToken.style.display = "block";
        }
      }
    }
  }
}

async function verifyEmail(token: string) {
  await delay(2000); // Simulate a delay for processing
  return "example.com";
}
