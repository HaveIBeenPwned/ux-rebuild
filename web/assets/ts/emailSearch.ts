import { LoadingButton, type LoadingButtonElement } from "./loadingButton";
import type { UnifiedSearchResults } from "./Models/unified_search";
import { delay } from "./utils";

// Declare the confetti function from the global scope
interface ConfettiOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  origin?: {
    x?: number;
    y?: number;
  };
}

type ConfettiFunction = (options?: ConfettiOptions) => void;

declare const confetti: ConfettiFunction;

/**
 * Initialize the breach timeline functionality
 */
export function initEmailSearch() {
  // Email search functionality
  const pwnedSearchForm = document.getHtmlElementById<HTMLFormElement>("pwnedSearch");
  const emailInput = document.getHtmlElementById<HTMLInputElement>("emailInput");
  const checkButton = document.getHtmlElementById<LoadingButtonElement>("checkButton");
  const breachTimeline = document.getHtmlElementById<HTMLElement>("breachTimeline");

  // Result state elements
  const goodResultElement = document.getHtmlElementById<HTMLElement>("email-result-good");
  const badResultElement = document.getHtmlElementById<HTMLElement>("email-result-bad");
  const regularBreachSummary = document.getHtmlElementById<HTMLElement>("regular-breach-summary");

  // Set up result elements if they exist
  if (goodResultElement && badResultElement) {
    // Make sure the original breach summary is hidden
    if (regularBreachSummary) {
      regularBreachSummary.classList.add("d-none");
    }
  }

  if (pwnedSearchForm && emailInput && checkButton && breachTimeline) {
    // @ts-ignore
    window.turnstileCompleted = turnstileCompleted;
    emailInput.addEventListener("input", function () {
      if (this.value.trim() !== "") {
        this.classList.remove("is-invalid");
      }
    });

    checkButton.addEventListener("click", async (e) => {
      try {
        e.preventDefault(); // Prevent default form submission
        const email = emailInput.value.trim();

        if (!isValidEmail(email)) {
          // Show validation error if email is empty
          emailInput.classList.add("is-invalid");
          return;
        }

        // Hide any previously shown results with animation
        await hideResultsWithAnimation();

        const loadingButton = LoadingButton.getOrCreateInstance(checkButton);
        loadingButton.start();
        const searchResults = await performSearch(email);

        renderBreaches(searchResults);

        renderPastes(searchResults);

        loadingButton.stop();

        // Clear any previous validation errors
        emailInput.classList.remove("is-invalid");

        // Show success or warning result based on breach count
        if (searchResults.Breaches.length === 0) {
          showGoodResult();
          // Trigger confetti animation with a slight delay for better visual effect
          setTimeout(() => {
            triggerConfetti();
          }, 300);
        } else {
          showBadResult();
        }

        // Show the breach timeline section
        breachTimeline.classList.remove("d-none");

        // Scroll to the breach timeline section
        breachTimeline.scrollIntoView({ behavior: "smooth" });
      } finally {
        turnstile.reset();
      }
    });
  }

  // NotifyMe button functionality
  const notifyMeBtn = document.getHtmlElementById<HTMLButtonElement>("notifyMeBtn");

  if (notifyMeBtn && emailInput) {
    notifyMeBtn.addEventListener("click", () => {
      // Get the email from the search input
      const email = emailInput.value.trim();

      if (email) {
        // Store the email in session storage for use on the notifications page
        sessionStorage.setItem("searchedEmail", email);
      }
    });
  }

  // Function to hide result elements with animation
  async function hideResultsWithAnimation() {
    if (!goodResultElement || !badResultElement) return Promise.resolve();

    // If neither result is visible, no need for animation
    if (goodResultElement.classList.contains("d-none") && badResultElement.classList.contains("d-none")) {
      return Promise.resolve();
    }

    const visibleContainer = goodResultElement.classList.contains("d-none")
      ? badResultElement.querySelector(".search-result")
      : goodResultElement.querySelector(".search-result");

    if (visibleContainer) {
      // Add fade-out class to start animation
      visibleContainer.classList.add("fade-out");

      // Wait for animation to complete
      await delay(400);
    }

    // Hide elements after fade-out completes
    goodResultElement.classList.add("d-none");
    badResultElement.classList.add("d-none");
  }

  // Function to show good result with animation
  function showGoodResult() {
    if (!goodResultElement) return;

    // First ensure the element is in DOM but not visible
    goodResultElement.classList.remove("d-none");

    // Get the container
    const resultContainer = goodResultElement.querySelector(".search-result");
    if (resultContainer) {
      // Ensure fade-out class is applied first (to set opacity to 0)
      resultContainer.classList.add("fade-out");

      // Force a reflow to ensure the browser registers the opacity change
      void (resultContainer as HTMLElement).offsetWidth;

      // Then remove it to trigger the transition
      setTimeout(() => {
        resultContainer.classList.remove("fade-out");
      }, 50);
    }
  }

  // Function to show bad result with animation
  function showBadResult() {
    if (!badResultElement) return;

    // First ensure the element is in DOM but not visible
    badResultElement.classList.remove("d-none");

    // Get the container
    const resultContainer = badResultElement.querySelector(".search-result");
    if (resultContainer) {
      // Ensure fade-out class is applied first
      resultContainer.classList.add("fade-out");

      // Force a reflow to ensure the browser registers the opacity change
      void (resultContainer as HTMLElement).offsetWidth;

      // Then remove it to trigger the transition
      setTimeout(() => {
        resultContainer.classList.remove("fade-out");
      }, 50);
    }
  }

  // Function to trigger confetti animation
  function triggerConfetti() {
    if (typeof confetti !== "undefined") {
      // First, create an initial burst of confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Then trigger a cannon from both sides
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });

        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    }
  }
}

function renderBreaches(searchResults: UnifiedSearchResults) {
  const breachCountElement = document.getHtmlElementById<HTMLDivElement>("breachCount");
  const timelineItems = document.getHtmlElementById<HTMLDivElement>("timelineItems");

  if (breachCountElement && timelineItems) {
    // Update the breach count in the bad result element
    breachCountElement.innerHTML = searchResults.Breaches.length.toLocaleString();

    // Only render the timeline items if there are breaches
    if (searchResults.Breaches.length > 0) {
      let timelineItemsContent = "";
      for (const breach of searchResults.Breaches) {
        const breachDate = new Date(Date.parse(breach.BreachDate));
        let dataClassContent = "";

        for (const dataClass of breach.DataClasses) {
          dataClassContent += `<li class="d-flex align-items-start mb-2">
                               <i class="bi bi-dot me-2 text-primary"></i>${dataClass}
                             </li>`;
        }

        timelineItemsContent += `<div class="timeline-item pt-5">
                                      <div class="timeline-date d-flex flex-column justify-content-center align-items-center text-white">
                                          <span class="timeline-date-text">${breachDate.toLocaleDateString("default", { month: "short" })}</span>
                                          <span class="timeline-date-text">${breachDate.toLocaleDateString("default", { year: "numeric" })}</span>
                                      </div>
                                      <div class="timeline-content p-4 rounded-3 z-2">
                                          <div class="timeline-title d-flex align-items-center mb-3">
                                              <div class="timeline-logo me-3 rounded-2 d-flex align-items-center justify-content-center overflow-hidden position-relative">
                                                  <img src="${`https://haveibeenpwned.com${new URL(breach.LogoPath).pathname}`}"
                                                       alt="${breach.Name} Logo"
                                                       class="w-100 h-100 p-1" />
                                              </div>
                                              <h5 class="mb-0 me-auto fw-semibold text-white">${breach.Name}</h5>
                                          </div>
                                          <div class="mt-2">
                                              <p class="mb-2">${breach.Description}</p>

                                              <div class="mb-3">
                                                  <strong>Compromised data:</strong>
                                                  <ul class="timeline-details-list mt-2 list-unstyled mb-0 p-3 rounded-3 bg-dark-subtle-custom">
                                                      ${dataClassContent}
                                                  </ul>
                                              </div>

                                              <div class="d-flex justify-content-between align-items-center">
                                                  <a href="breach/${breach.Name}"
                                                     class="btn btn-outline-primary">
                                                      View Details
                                                  </a>
                                              </div>
                                          </div>
                                      </div>
                                  </div>`;
      }

      timelineItems.innerHTML = timelineItemsContent;
    } else {
      // Clear the timeline if no breaches
      timelineItems.innerHTML = "";
    }
  }
}

function renderPastes(searchResults: UnifiedSearchResults) {
  const pasteSummaryElement = document.getElementById("pasteSummary");
  const pasteListElement = document.getElementById("pasteList");
  const pasteCountElement = document.getElementById("pasteCount");
  const pasteTableElement = document.getElementById("pasteTable");

  // pastes
  if (pasteSummaryElement && pasteListElement && pasteCountElement && pasteTableElement) {
    if (searchResults.Pastes && searchResults.Pastes.length > 0) {
      let pasteList = "";
      for (const pasteItem of searchResults.Pastes) {
        const pasteDate = pasteItem.Date ? new Date(Date.parse(pasteItem.Date)) : null;
        let pasteClass = "bi-file-earmark-text";
        if (pasteItem.Source === "Pastebin") {
          pasteClass = "bi-file-earmark-text";
        }
        pasteList += `<tr>
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="table-row-icon me-3">
                              <i class="bi ${pasteClass}"></i>
                            </div>
                            <div>${pasteItem.Title}</div>
                          </div>
                        </td>
                        <td>${pasteDate?.toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" }) ?? ""}</td>
                        <td class="text-end">${pasteItem.EmailCount}</td>
                      </tr>`;
      }

      pasteSummaryElement.classList.remove("d-none");
      pasteListElement.classList.remove("d-none");
      if (pasteCountElement) {
        pasteCountElement.innerHTML = searchResults.Pastes.length.toLocaleString();
      }

      if (pasteTableElement) {
        pasteTableElement.innerHTML = pasteList;
      }
    } else {
      pasteSummaryElement.classList.add("d-none");
      pasteListElement.classList.add("d-none");
    }
  }
}

function turnstileCompleted(token: string) {
  if (token !== "") {
    const turnstileWidget = document.getHtmlElementById<HTMLDivElement>("turnstileWidget");
    if (!turnstileWidget) return;
    // Set the token attribute on the turnstile widget
    turnstileWidget.setAttribute("data-token", token);
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function performSearch(email: string) {
  // replace with actual API call
  await delay(1000);

  // For testing:
  // - Any email containing "good" will show success state (0 breaches)
  // - Any other email will show breach state (2 breaches)
  const shouldShowGood = email.toLowerCase().includes("good");

  const mockResults: UnifiedSearchResults = {
    Breaches: shouldShowGood
      ? []
      : [
          {
            Name: "Adobe",
            Title: "Adobe",
            Domain: "adobe.com",
            AddedDate: "2013-10-01T00:00:00Z",
            BreachDate: "2013-10-01T00:00:00Z",
            Description: "Adobe data breach affecting 38 million users.",
            DataClasses: ["Email addresses", "Password hints", "Usernames"],
            LogoPath: "https://haveibeenpwned.com/Content/Images/PwnedLogos/Adobe.png",
            IsFabricated: false,
            IsVerified: true,
            IsSensitive: false,
            IsRetired: false,
            IsSpamList: false,
            IsMalware: false,
            IsStealerLog: false,
            IsSubscriptionFree: false,
            ModifiedDate: "2013-10-01T00:00:00Z",
            PwnCount: 152000000,
          },
          {
            Name: "LinkedIn",
            Title: "LinkedIn",
            Domain: "linkedin.com",
            AddedDate: "2012-06-01T00:00:00Z",
            BreachDate: "2012-06-01T00:00:00Z",
            Description: "LinkedIn data breach affecting 117 million users.",
            DataClasses: ["Email addresses", "Password hints", "Usernames"],
            LogoPath: "https://haveibeenpwned.com/Content/Images/PwnedLogos/LinkedIn.png",
            IsFabricated: false,
            IsVerified: true,
            IsSensitive: false,
            IsRetired: false,
            IsSpamList: false,
            IsMalware: false,
            IsStealerLog: false,
            IsSubscriptionFree: false,
            ModifiedDate: "2012-06-01T00:00:00Z",
            PwnCount: 117000000,
          },
        ],
    Pastes: shouldShowGood
      ? []
      : [
          {
            Date: "2023-10-01T00:00:00Z",
            EmailCount: 3,
            Id: "123456",
            Source: "Pastebin",
            Title: "Sample Paste 1",
          },
        ],
  };

  return mockResults;
}
