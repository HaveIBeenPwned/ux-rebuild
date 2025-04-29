document.addEventListener("DOMContentLoaded", function () {
  const pricingToggle = document.getElementById("pricingToggle");
  const priceValues = document.querySelectorAll(".price-value");
  const pricePeriods = document.querySelectorAll(".pricing-period");

  // Price data for all packages (monthly and yearly)
  const priceData = [
    { monthly: "$3.95", yearly: "$39.50" },
    { monthly: "$19", yearly: "$190" },
    { monthly: "$32", yearly: "$320" },
    { monthly: "$137", yearly: "$1,370" },
    { monthly: "$274", yearly: "$2,740" },
    { monthly: "Custom", yearly: "Custom" },
    // Add High-Performance Tier pricing
    { monthly: "$995", yearly: "$9,950" },
    { monthly: "$1,850", yearly: "$18,500" },
    { monthly: "$2,750", yearly: "$27,500" },
  ];

  function updatePrices(isYearly) {
    priceValues.forEach((priceElement, index) => {
      if (index < priceData.length) {
        priceElement.textContent = isYearly
          ? priceData[index].yearly
          : priceData[index].monthly;
      }
    });

    pricePeriods.forEach((periodElement) => {
      periodElement.textContent = isYearly ? "per year" : "per month";
    });
  }

  if (pricingToggle) {
    pricingToggle.addEventListener("change", function () {
      const isYearly = this.checked;
      updatePrices(isYearly);
    });
  }
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Plan calculator functionality
  const calculatePlanBtn = document.getElementById("calculatePlan");
  const domainSizeInput = document.getElementById("domainSize");
  const apiRateSelect = document.getElementById("apiRequestRate");
  const recommendedPlanDiv = document.getElementById("recommendedPlan");
  const planNameSpan = document.getElementById("planName");
  const planReasonSpan = document.getElementById("planReason");
  const recommendedAlert = document.querySelector("#recommendedPlan .alert");
  
  // Domain size indicators (initially hidden)
  const domainIndicators = {
    domainIndicator1: document.getElementById("domainIndicator1"),
    domainIndicator2: document.getElementById("domainIndicator2"),
    domainIndicator3: document.getElementById("domainIndicator3"),
    domainIndicator4: document.getElementById("domainIndicator4"),
    domainIndicator5: document.getElementById("domainIndicator5")
  };
  
  // Hide all domain indicators initially
  Object.values(domainIndicators).forEach(indicator => {
    if (indicator) {
      indicator.style.display = "none";
    }
  });
  
  // Plan tiers data
  const planTiers = [
    { name: "Pwned 1", maxDomainSize: 25, rpm: 10 },
    { name: "Pwned 2", maxDomainSize: 100, rpm: 50 },
    { name: "Pwned 3", maxDomainSize: 500, rpm: 100 },
    { name: "Pwned 4", maxDomainSize: Infinity, rpm: 500 },
    { name: "Pwned 5", maxDomainSize: Infinity, rpm: 1000 },
    { name: "Pwned Ultra 1", maxDomainSize: Infinity, rpm: 4000 },
    { name: "Pwned Ultra 2", maxDomainSize: Infinity, rpm: 8000 },
    { name: "Pwned Ultra 3", maxDomainSize: Infinity, rpm: 12000 }
  ];
  
  if (calculatePlanBtn) {
    calculatePlanBtn.addEventListener("click", function() {
      const domainSize = parseInt(domainSizeInput.value) || 0;
      const apiRate = parseInt(apiRateSelect.value) || 10;
      
      // Find suitable plans based on domain size
      let suitablePlans = planTiers.filter(plan => plan.maxDomainSize >= domainSize);
      
      // Find the plan that meets or exceeds API requirement 
      let recommendedPlan = suitablePlans.find(plan => plan.rpm >= apiRate);
      
      // If no suitable plan was found, recommend enterprise
      if (!recommendedPlan) {
        recommendedPlan = { name: "Enterprise", maxDomainSize: Infinity, rpm: "Custom" };
      }
      
      // Show the recommendation
      planNameSpan.textContent = recommendedPlan.name;
      
      // Generate reason text based on domain size and API requirements
      const sizeReason = domainSize > 0 
        ? `Your domain size of ${domainSize} email addresses requires at least ${recommendedPlan.name}.` 
        : "Please enter your domain size for a more accurate recommendation.";
        
      const apiReason = apiRate 
        ? `Your API requirement of ${apiRate} requests per minute is supported by this plan.` 
        : "";
      
      planReasonSpan.textContent = `${sizeReason} ${apiReason}`;
      recommendedPlanDiv.classList.remove("d-none");
      
      // Highlight the recommended plan on the page without scrolling
      highlightRecommendedPlan(recommendedPlan.name, false);
    });
  }
  
  // Add click event to the recommendation alert to scroll to the recommended plan
  if (recommendedAlert) {
    recommendedAlert.addEventListener("click", function() {
      const planName = planNameSpan.textContent;
      highlightRecommendedPlan(planName, true);
    });
    
    // Make it look clickable
    recommendedAlert.style.cursor = "pointer";
  }
  
  function highlightRecommendedPlan(planName, shouldScroll) {
    // Remove recommended class from all cards
    const allCards = document.querySelectorAll('.card.card-glow');
    allCards.forEach(card => {
      card.classList.remove('recommended-plan');
    });
    
    // Find the card that matches the recommended plan and add class
    const recommendedCard = Array.from(document.querySelectorAll('.card-header')).find(
      header => header.querySelector('h3, h4').textContent.trim() === planName
    );
    
    if (recommendedCard) {
      recommendedCard.closest('.card').classList.add('recommended-plan');
      
      // Only scroll if explicitly requested
      if (shouldScroll) {
        recommendedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
});

