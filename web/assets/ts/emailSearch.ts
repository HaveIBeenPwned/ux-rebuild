import { LoadingButton, type LoadingButtonElement } from "./loadingButton";
import type { UnifiedSearchResults } from "./Models/unified_search";
import { delay } from "./utils";

/**
 * Initialize the breach timeline functionality
 */
export function initEmailSearch() {
  // Email search functionality
  const pwnedSearchForm = document.getHtmlElementById<HTMLFormElement>("pwnedSearch");
  const emailInput = document.getHtmlElementById<HTMLInputElement>("emailInput");
  const checkButton = document.getHtmlElementById<LoadingButtonElement>("checkButton");
  const breachTimeline = document.getHtmlElementById<HTMLElement>("breachTimeline");
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

        const loadingButton = LoadingButton.getOrCreateInstance(checkButton);
        loadingButton.start();
        const searchResults = await performSearch(email);

        renderBreaches(searchResults);

        renderPastes(searchResults);

        loadingButton.stop();

        // Clear any previous validation errors
        emailInput.classList.remove("is-invalid");

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
}

function renderBreaches(searchResults: UnifiedSearchResults) {
  const breachCountElement = document.getHtmlElementById<HTMLDivElement>("breachCount");
  const timelineItems = document.getHtmlElementById<HTMLDivElement>("timelineItems");

  if (breachCountElement && timelineItems) {
    breachCountElement.innerHTML = searchResults.Breaches.length.toLocaleString();

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
                        <td>${pasteItem.EmailCount}</td>
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
  const mockResults: UnifiedSearchResults = {
    Breaches: [
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
    Pastes: [
      {
        Date: "2023-10-01T00:00:00Z",
        EmailCount: 1000,
        Id: "123456",
        Source: "Pastebin",
        Title: "Sample Paste 1",
      },
    ],
  };
  return mockResults;
}
