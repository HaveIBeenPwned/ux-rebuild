import { Tooltip } from "bootstrap";

export function initializePricingPage() {
  const pricingToggle = document.getHtmlElementById<HTMLInputElement>("pricingToggle");
  if (pricingToggle) {
    const priceValues = document.querySelectorAll<HTMLElement>(".price-value");
    const pricePeriods = document.queryHtmlElements<HTMLElement>(".pricing-period");

    // Price data for all packages (monthly and yearly)
    const priceData: { monthly: string; yearly: string }[] = [
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

    function updatePrices(isYearly: boolean) {
      priceValues.forEach((priceElement: HTMLElement, index: number) => {
        if (index < priceData.length) {
          priceElement.textContent = isYearly ? priceData[index].yearly : priceData[index].monthly;
        }
      });

      for (const periodElement of pricePeriods) {
        periodElement.textContent = isYearly ? "per year" : "per month";
      }
    }

    pricingToggle.addEventListener("change", function (this: HTMLInputElement) {
      const isYearly = this.checked;
      updatePrices(isYearly);
    });

    // Initialize tooltips
    const tooltipTriggerList = Array.prototype.slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')) as HTMLElement[];
    tooltipTriggerList.map((tooltipTriggerEl: HTMLElement) => new Tooltip(tooltipTriggerEl));
  }
}
