import { showReturnNotification } from "./dashboard_utils";

// Setup subscription management
export function setupSubscriptionManagement() {
  // Elements
  const activeSubscriptionView = document.getHtmlElementById<HTMLElement>("activeSubscriptionView");
  const noSubscriptionView = document.getHtmlElementById<HTMLElement>("noSubscriptionView");
  const pricingPlansSection = document.getHtmlElementById<HTMLElement>("pricingPlansSection");
  const showPricingPlansBtn = document.getHtmlElementById<HTMLButtonElement>("showPricingPlansBtn");
  const generateQuoteBtn = document.getHtmlElementById<HTMLButtonElement>("generateQuoteBtn");
  const subscriptionPricingToggle = document.getHtmlElementById<HTMLInputElement>("subscriptionPricingToggle");
  const priceValues = document.querySelectorAll(".price-value") as NodeListOf<HTMLElement>;
  const pricePeriods = document.queryHtmlElements<HTMLElement>(".pricing-period");
  const selectPlanButtons = document.queryHtmlElements<HTMLButtonElement>(".select-plan-btn");

  // Check if the user has a subscription (mock data - would be from API in real app)
  const hasSubscription = localStorage.getItem("hibp_has_subscription") === "true";

  // Show the appropriate view based on subscription status
  if (activeSubscriptionView && noSubscriptionView) {
    if (hasSubscription) {
      activeSubscriptionView.classList.remove("d-none");
      noSubscriptionView.classList.add("d-none");
    } else {
      activeSubscriptionView.classList.add("d-none");
      noSubscriptionView.classList.remove("d-none");
    }
  }

  // DEMO ONLY: Add a hidden button to toggle subscription status for testing
  const subscriptionTab = document.getHtmlElementById<HTMLElement>("subscription");
  if (subscriptionTab) {
    const demoToggleBtn = document.createElement("button");
    demoToggleBtn.className = "btn btn-sm btn-outline-secondary position-absolute bottom-0 end-0 m-2";
    demoToggleBtn.style.opacity = "0.5";
    demoToggleBtn.innerHTML = "Toggle Demo State";
    demoToggleBtn.addEventListener("click", () => {
      const currentState = localStorage.getItem("hibp_has_subscription") === "true";
      localStorage.setItem("hibp_has_subscription", (!currentState).toString());

      if (currentState) {
        // Switch to no subscription view
        if (activeSubscriptionView) {
          activeSubscriptionView.classList.add("d-none");
        }
        if (noSubscriptionView) {
          noSubscriptionView.classList.remove("d-none");
        }
        showReturnNotification("info", "Demo: Showing no subscription state");
      } else {
        // Switch to active subscription view
        if (activeSubscriptionView) {
          activeSubscriptionView.classList.remove("d-none");
        }
        if (noSubscriptionView) {
          noSubscriptionView.classList.add("d-none");
        }
        if (pricingPlansSection) {
          pricingPlansSection.classList.add("d-none");
        }
        if (showPricingPlansBtn) {
          showPricingPlansBtn.classList.remove("d-none");
        }
        showReturnNotification("info", "Demo: Showing active subscription state");
      }
    });
    subscriptionTab.appendChild(demoToggleBtn);
  }

  // Price data for subscription plans (monthly and yearly)
  const priceData = [
    { monthly: "$3.95", yearly: "$39.50" },
    { monthly: "$19", yearly: "$190" },
    { monthly: "$32", yearly: "$320" },
    { monthly: "$137", yearly: "$1,370" },
    { monthly: "$274", yearly: "$2,740" },
    { monthly: "Custom", yearly: "Custom" },
    { monthly: "$995", yearly: "$9,950" },
    { monthly: "$1,850", yearly: "$18,500" },
    { monthly: "$2,750", yearly: "$27,500" },
  ];

  // Handle pricing toggle
  if (subscriptionPricingToggle) {
    subscriptionPricingToggle.addEventListener("change", function () {
      const isYearly = this.checked;
      updatePrices(isYearly);
    });
  }

  // Function to update prices based on billing period
  function updatePrices(isYearly: boolean) {
    priceValues.forEach((priceElement, index) => {
      if (index < priceData.length) {
        priceElement.textContent = isYearly ? priceData[index].yearly : priceData[index].monthly;
      }
    });

    for (const periodElement of pricePeriods) {
      periodElement.textContent = isYearly ? "per year" : "per month";
    }
  }

  // Show pricing plans when button is clicked
  if (showPricingPlansBtn && pricingPlansSection) {
    showPricingPlansBtn.addEventListener("click", () => {
      pricingPlansSection.classList.remove("d-none");
      showPricingPlansBtn.classList.add("d-none");
    });
  }

  // Handle plan selection
  for (const button of selectPlanButtons) {
    button.addEventListener("click", function () {
      const planName = this.getAttribute("data-plan");

      // Here would be code to initiate the subscription process
      // For demo, we'll just show a notification
      showReturnNotification("success", `You have selected the ${planName} plan. Redirecting to checkout...`);

      // Hide the pricing section after selection
      setTimeout(() => {
        if (pricingPlansSection) {
          pricingPlansSection.classList.add("d-none");
        }
        if (showPricingPlansBtn) {
          showPricingPlansBtn.classList.remove("d-none");
        }
      }, 3000);
    });
  }

  // Generate quote button functionality
  if (generateQuoteBtn) {
    generateQuoteBtn.addEventListener("click", () => {
      // In a real app, this would open a modal or redirect to a quote page
      showReturnNotification("info", "Generating quote for your subscription. You will receive it via email shortly.");
    });
  }

  // Manage billing button functionality
  const manageBillingBtn = document.getHtmlElementById<HTMLButtonElement>("manageBillingBtn");
  if (manageBillingBtn) {
    manageBillingBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReturnNotification("info", "Redirecting to the billing management portal...");
    });
  }

  // Change email button functionality
  const changeEmailBtn = document.getHtmlElementById<HTMLButtonElement>("changeEmailBtn");
  if (changeEmailBtn) {
    changeEmailBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReturnNotification("info", "Opening email change form...");
    });
  }
}
