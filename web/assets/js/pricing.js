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
});

