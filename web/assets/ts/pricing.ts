import { LoadingButton, type LoadingButtonElement } from "./loadingButton";

// Plan definitions for the recommendation engine
interface PlanDef {
  id: string;
  name: string;
  tier: "core" | "pro";
  maxDomains: number;
  maxDomainSize: number; // 0 = unlimited
}

const CORE_PLANS: PlanDef[] = [
  { id: "core1", name: "Core 1", tier: "core", maxDomains: 1, maxDomainSize: 25 },
  { id: "core2", name: "Core 2", tier: "core", maxDomains: 3, maxDomainSize: 100 },
  { id: "core3", name: "Core 3", tier: "core", maxDomains: 5, maxDomainSize: 500 },
  { id: "core4", name: "Core 4", tier: "core", maxDomains: 10, maxDomainSize: 0 },
  { id: "core5", name: "Core 5", tier: "core", maxDomains: 20, maxDomainSize: 0 },
  { id: "coreUltra4000", name: "Core Ultra 4000", tier: "core", maxDomains: 20, maxDomainSize: 0 },
  { id: "coreUltra8000", name: "Core Ultra 8000", tier: "core", maxDomains: 20, maxDomainSize: 0 },
  { id: "coreUltra12000", name: "Core Ultra 12000", tier: "core", maxDomains: 20, maxDomainSize: 0 },
];

const PRO_PLANS: PlanDef[] = [
  { id: "pro1", name: "Pro 1", tier: "pro", maxDomains: 50, maxDomainSize: 0 },
  { id: "pro2", name: "Pro 2", tier: "pro", maxDomains: 100, maxDomainSize: 0 },
  { id: "pro3", name: "Pro 3", tier: "pro", maxDomains: 200, maxDomainSize: 0 },
  { id: "pro4", name: "Pro 4", tier: "pro", maxDomains: 400, maxDomainSize: 0 },
  { id: "pro5", name: "Pro 5", tier: "pro", maxDomains: 800, maxDomainSize: 0 },
];

// Mock domain lookup -- simulates checking breach count for a domain
function mockDomainLookup(domain: string): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let hash = 0;
      for (let i = 0; i < domain.length; i++) {
        hash = (hash * 31 + domain.charCodeAt(i)) & 0xffff;
      }
      resolve(5 + (hash % 1996));
    }, 1200);
  });
}

// Recommendation engine
interface RecommendInput {
  useCase: "own" | "customers";
  domainCount: number;
  breachCount?: number;
  needsApi: boolean;
  needsAnonymity: boolean;
  apiRpmTier: "low" | "medium" | "high" | null;
  needsStealerLogs: boolean;
}

function recommendPlan(input: RecommendInput): { plan: PlanDef; reason: string } {
  const { useCase, domainCount, breachCount, needsAnonymity, needsStealerLogs } = input;

  // Pro-forcing conditions
  if (needsAnonymity || useCase === "customers" || domainCount > 20) {
    const plan = PRO_PLANS.find((p) => domainCount <= p.maxDomains) || PRO_PLANS[PRO_PLANS.length - 1];
    const domainLabel = `${plan.maxDomains} domains`;
    let reason: string;
    if (needsAnonymity) {
      reason = `K-anonymity is a Pro-exclusive feature. ${plan.name} supports ${domainLabel} with anonymous searches, stealer logs, and customer domain monitoring.`;
    } else if (useCase === "customers") {
      reason = `Supports ${domainLabel} with customer domain monitoring, k-anonymity, and stealer logs on all plans.`;
    } else {
      reason = `You need more than 20 domains, which exceeds Core limits. Pro supports ${domainLabel} with additional features.`;
    }
    return { plan, reason };
  }

  // Core tier
  let plans = CORE_PLANS.filter((p) => domainCount <= p.maxDomains);
  if (plans.length === 0) {
    const plan = PRO_PLANS.find((p) => domainCount <= p.maxDomains) || PRO_PLANS[PRO_PLANS.length - 1];
    const domainLabel = `${plan.maxDomains} domains`;
    return {
      plan,
      reason: `You need more than 20 domains, which exceeds Core limits. Pro supports ${domainLabel} with additional features.`,
    };
  }

  // Stealer logs require Core 5+ on Core
  if (needsStealerLogs) {
    const stealerPlans = plans.filter((p) => p.id === "core5" || p.id.startsWith("coreUltra"));
    if (stealerPlans.length > 0) {
      plans = stealerPlans;
    }
  }

  if (breachCount !== undefined && breachCount > 0) {
    const sizedPlans = plans.filter((p) => p.maxDomainSize === 0 || breachCount <= p.maxDomainSize);
    if (sizedPlans.length > 0) {
      plans = sizedPlans;
    } else {
      plans = plans.filter((p) => p.maxDomainSize === 0);
      if (plans.length === 0) {
        plans = CORE_PLANS.filter((p) => p.maxDomainSize === 0);
      }
    }
  }

  const plan = plans[0];
  let reason = `Supports ${plan.maxDomains} domain${plan.maxDomains > 1 ? "s" : ""}`;
  if (plan.maxDomainSize > 0) {
    reason += ` with up to ${plan.maxDomainSize} breached addresses per domain`;
  } else {
    reason += " with unlimited breached addresses per domain";
  }
  if (needsStealerLogs) {
    reason += " and includes stealer log access";
  }
  reason += ".";
  return { plan, reason };
}

export function initializePricingPage() {
  initPricingToggle();
  initWizard();
}

// Pricing toggle for monthly/yearly
function initPricingToggle() {
  const toggle = document.getHtmlElementById<HTMLInputElement>("pricingToggle");
  if (!toggle) return;

  toggle.addEventListener("change", function (this: HTMLInputElement) {
    const isYearly = this.checked;
    const priceValues = document.queryHtmlElements<HTMLElement>(".price-value");
    const periods = document.queryHtmlElements<HTMLElement>(".pricing-period");

    for (const el of priceValues) {
      const monthly = el.getAttribute("data-monthly");
      const yearly = el.getAttribute("data-yearly");
      if (monthly && yearly) {
        el.textContent = isYearly ? yearly : monthly;
      }
    }

    for (const el of periods) {
      el.textContent = isYearly ? "per year" : "per month";
    }
  });
}

// Wizard logic
function initWizard() {
  const wizard = document.getHtmlElementById<HTMLElement>("planFinderWizard");
  if (!wizard) return;

  const step1 = document.getElementById("wizardStep1") as HTMLElement;
  const step2 = document.getElementById("wizardStep2") as HTMLElement;
  const step2a = document.getElementById("wizardStep2a") as HTMLElement;
  const step2b = document.getElementById("wizardStep2b") as HTMLElement;
  const step3 = document.getElementById("wizardStep3") as HTMLElement;
  const step4 = document.getElementById("wizardStep4") as HTMLElement;
  const step5 = document.getElementById("wizardStep5") as HTMLElement;
  const result = document.getElementById("wizardResult") as HTMLElement;
  if (!step1 || !step2 || !step2a || !step2b || !step3 || !step4 || !step5 || !result) return;
  const steps: HTMLElement[] = [step1, step2, step2a, step2b, step3, step4, step5, result];

  const stepIndicators = wizard.queryHtmlElements<HTMLElement>(".wizard-step");

  let useCase: "own" | "customers" = "own";
  let domainCount = 1;
  let breachCount: number | undefined;
  let needsApi = false;
  let needsAnonymity = false;
  let apiRpmTier: "low" | "medium" | "high" | null = null;
  let needsStealerLogs = false;

  function getRecommendInput(): RecommendInput {
    return { useCase, domainCount, breachCount, needsApi, needsAnonymity, apiRpmTier, needsStealerLogs };
  }

  // Map panels to step indicator indices (step2a/step2b share index 1 with step2)
  function stepIndicatorIndex(panel: HTMLElement): number {
    switch (panel) {
      case step1: return 0;
      case step2: return 1;
      case step2a: return 1;
      case step2b: return 1;
      case step3: return 2;
      case step4: return 3;
      case step5: return 4;
      case result: return 5;
      default: return 0;
    }
  }

  function showPanel(panel: HTMLElement) {
    for (const s of steps) {
      s.classList.toggle("d-none", s !== panel);
    }
    const idx = stepIndicatorIndex(panel);
    for (let i = 0; i < stepIndicators.length; i++) {
      stepIndicators[i].classList.toggle("active", i <= idx);
      stepIndicators[i].classList.toggle("completed", i < idx);
    }
  }

  // Step 1: Use case selection
  const useCaseCards = step1.queryHtmlElements<HTMLButtonElement>(".wizard-option-card");
  for (const card of useCaseCards) {
    card.addEventListener("click", () => {
      useCase = card.getAttribute("data-usecase") as "own" | "customers";
      for (const c of useCaseCards) c.classList.remove("selected");
      card.classList.add("selected");
      setTimeout(() => showPanel(step2), 200);
    });
  }

  // Step 2: API email search
  const apiCards = step2.queryHtmlElements<HTMLButtonElement>(".wizard-option-card[data-api]");

  for (const card of apiCards) {
    card.addEventListener("click", () => {
      const val = card.getAttribute("data-api");
      needsApi = val === "yes";
      for (const c of apiCards) c.classList.remove("selected");
      card.classList.add("selected");

      if (needsApi) {
        setTimeout(() => showPanel(step2a), 200);
      } else {
        needsAnonymity = false;
        apiRpmTier = null;
        setTimeout(() => showPanel(step3), 200);
      }
    });
  }

  // Step 2a: Anonymity (proceeds to step 2b)
  const anonymityCards = step2a.queryHtmlElements<HTMLButtonElement>(".wizard-anonymity-btn");
  for (const card of anonymityCards) {
    card.addEventListener("click", () => {
      needsAnonymity = card.getAttribute("data-anonymity") === "yes";
      for (const c of anonymityCards) c.classList.remove("selected");
      card.classList.add("selected");
      setTimeout(() => showPanel(step2b), 200);
    });
  }

  // Step 2b: RPM tier (proceeds to step 3)
  const rpmBtns = step2b.queryHtmlElements<HTMLButtonElement>(".wizard-rpm-btn");
  for (const btn of rpmBtns) {
    btn.addEventListener("click", () => {
      apiRpmTier = btn.getAttribute("data-rpm") as "low" | "medium" | "high";
      for (const b of rpmBtns) b.classList.remove("active");
      btn.classList.add("active");
      setTimeout(() => showPanel(step3), 200);
    });
  }

  // Step 3: Domain count (range buttons)
  const domainBtns = step3.queryHtmlElements<HTMLButtonElement>(".wizard-domain-btn");

  function proceedFromDomains(count: number) {
    domainCount = count;
    // Core "own" path gets domain lookup step; Pro/customers skip to stealer logs
    if (useCase === "own" && !needsAnonymity && domainCount <= 20) {
      showPanel(step4);
    } else {
      showPanel(step5);
    }
  }

  for (const btn of domainBtns) {
    btn.addEventListener("click", () => {
      const count = Number.parseInt(btn.getAttribute("data-count") || "1", 10);
      for (const b of domainBtns) b.classList.remove("active");
      btn.classList.add("active");
      setTimeout(() => proceedFromDomains(count), 200);
    });
  }

  // Step 4: Domain lookup (Core path) -- result + recommendation shown inline
  const domainLookupInput = document.getHtmlElementById<HTMLInputElement>("wizardDomainLookup");
  const domainCheckBtn = document.getHtmlElementById<LoadingButtonElement>("wizardDomainCheck");
  const domainResultEl = document.getHtmlElementById<HTMLElement>("wizardDomainResult");

  if (domainCheckBtn && domainLookupInput) {
    domainCheckBtn.addEventListener("click", async (e: Event) => {
      e.preventDefault();
      const domain = domainLookupInput.value.trim();
      if (!domain) return;

      const lb = LoadingButton.getOrCreateInstance(domainCheckBtn);
      lb.start();

      try {
        breachCount = await mockDomainLookup(domain);
        if (domainResultEl) {
          domainResultEl.classList.remove("d-none");
          domainResultEl.innerHTML = `
            <div class="alert alert-info mb-0 py-2">
              <i class="bi bi-info-circle me-2"></i>
              <strong>${domain}</strong> has <strong>${breachCount.toLocaleString()}</strong> breached email addresses.
            </div>
          `;
        }
        // Proceed to stealer logs after a brief pause to show the result
        setTimeout(() => showPanel(step5), 800);
      } finally {
        lb.stop();
      }
    });
  }

  // Step 4 skip -- proceed to stealer logs step
  const skipBtn = document.getHtmlElementById<HTMLButtonElement>("wizardSkipLookup");
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      breachCount = undefined;
      showPanel(step5);
    });
  }

  // Step 5: Stealer logs
  const stealerCards = step5.queryHtmlElements<HTMLButtonElement>(".wizard-option-card");
  for (const card of stealerCards) {
    card.addEventListener("click", () => {
      needsStealerLogs = card.getAttribute("data-stealer") === "yes";
      for (const c of stealerCards) c.classList.remove("selected");
      card.classList.add("selected");
      setTimeout(() => showRecommendation(), 200);
    });
  }

  // Show recommendation in separate result panel
  function showRecommendation() {
    const { plan, reason } = recommendPlan(getRecommendInput());

    const planNameEl = document.getHtmlElementById<HTMLElement>("wizardRecommendedPlanAlt");
    const reasonEl = document.getHtmlElementById<HTMLElement>("wizardRecommendedReasonAlt");
    if (planNameEl) planNameEl.textContent = plan.name;
    if (reasonEl) reasonEl.textContent = reason;

    showPanel(result);
    highlightRecommendedPlan(plan);
  }

  // View plan buttons (both inline and alt)
  function handleViewPlan() {
    const el = document.getElementById("skuOverview");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const viewPlanBtnAlt = document.getHtmlElementById<HTMLButtonElement>("wizardViewPlanAlt");
  if (viewPlanBtnAlt) {
    viewPlanBtnAlt.addEventListener("click", () => handleViewPlan());
  }
}

// Highlight the recommended plan row and SKU card
function highlightRecommendedPlan(plan: PlanDef) {
  clearHighlights();

  const row = document.querySelector(`.plan-row[data-plan="${plan.id}"]`) as HTMLElement | null;
  if (row) {
    row.classList.add("plan-row-recommended");
  }

  const skuId = plan.tier === "pro" ? "skuPro" : "skuCore";
  const skuCard = document.getElementById(skuId);
  if (skuCard) {
    skuCard.classList.add("sku-card-recommended");
    let badge = skuCard.querySelector(".sku-recommended-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "badge bg-success sku-badge sku-recommended-badge";
      badge.textContent = "Recommended for you";
      skuCard.appendChild(badge);
    }
    const staticBadge = skuCard.querySelector<HTMLElement>(".sku-badge:not(.sku-recommended-badge)");
    if (staticBadge) staticBadge.classList.add("d-none");
  }
}

function clearHighlights() {
  const rows = document.queryHtmlElements<HTMLElement>(".plan-row-recommended");
  for (const row of rows) row.classList.remove("plan-row-recommended");

  const cards = document.queryHtmlElements<HTMLElement>(".sku-card-recommended");
  for (const card of cards) card.classList.remove("sku-card-recommended");

  const badges = document.queryHtmlElements<HTMLElement>(".sku-recommended-badge");
  for (const badge of badges) badge.remove();

  const hiddenBadges = document.queryHtmlElements<HTMLElement>(".sku-badge.d-none");
  for (const badge of hiddenBadges) badge.classList.remove("d-none");
}
