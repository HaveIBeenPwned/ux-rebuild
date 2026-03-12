import { LoadingButton, type LoadingButtonElement } from "./loadingButton";

// Plan definitions for the recommendation engine
interface PlanDef {
  id: string;
  name: string;
  tier: "core" | "pro" | "highRpm";
  maxDomains: number;
  maxDomainSize: number; // 0 = unlimited
  stealerLogs: boolean;
}

const CORE_PLANS: PlanDef[] = [
  { id: "core1", name: "Core 1", tier: "core", maxDomains: 1, maxDomainSize: 25, stealerLogs: false },
  { id: "core2", name: "Core 2", tier: "core", maxDomains: 3, maxDomainSize: 100, stealerLogs: false },
  { id: "core3", name: "Core 3", tier: "core", maxDomains: 5, maxDomainSize: 500, stealerLogs: false },
  { id: "core4", name: "Core 4", tier: "core", maxDomains: 10, maxDomainSize: 0, stealerLogs: false },
  { id: "core5", name: "Core 5", tier: "core", maxDomains: 20, maxDomainSize: 0, stealerLogs: false },
];

const HIGH_RPM_PLANS: PlanDef[] = [
  { id: "highRpm4000", name: "High RPM 4000", tier: "highRpm", maxDomains: 0, maxDomainSize: 0, stealerLogs: false },
  { id: "highRpm8000", name: "High RPM 8000", tier: "highRpm", maxDomains: 0, maxDomainSize: 0, stealerLogs: false },
  { id: "highRpm12000", name: "High RPM 12000", tier: "highRpm", maxDomains: 0, maxDomainSize: 0, stealerLogs: false },
];

const PRO_PLANS: PlanDef[] = [
  { id: "pro1", name: "Pro 1", tier: "pro", maxDomains: 50, maxDomainSize: 0, stealerLogs: true },
  { id: "pro2", name: "Pro 2", tier: "pro", maxDomains: 100, maxDomainSize: 0, stealerLogs: true },
  { id: "pro3", name: "Pro 3", tier: "pro", maxDomains: 200, maxDomainSize: 0, stealerLogs: true },
  { id: "pro4", name: "Pro 4", tier: "pro", maxDomains: 400, maxDomainSize: 0, stealerLogs: true },
  { id: "pro5", name: "Pro 5", tier: "pro", maxDomains: 800, maxDomainSize: 0, stealerLogs: true },
];

// Feature definitions for the feature detail modal
const FEATURE_DEFINITIONS: Record<string, { label: string; description: string }> = {
  "email-search-browser": {
    label: "Browser Email Search",
    description:
      "Search for any email address directly in the HIBP website to see if it has appeared in a known data breach. Available on all plans including free.",
  },
  "email-notifications": {
    label: "Email Notifications",
    description:
      "Receive email alerts when your monitored addresses appear in new breaches. Notifications are sent to the address being monitored.",
  },
  "pwned-passwords": {
    label: "Pwned Passwords",
    description:
      "Check individual passwords against a database of over 800 million real-world passwords previously exposed in data breaches. Available free via the website or API.",
  },
  "domain-monitoring": {
    label: "Domain Monitoring",
    description:
      "Monitor all email addresses associated with your domain for breach exposure. Receive alerts when any address on your domain appears in a new breach.",
  },
  "domain-size-free": {
    label: "Domain Monitoring (Free)",
    description:
      "Free domain monitoring covers up to 10 breached email addresses per domain. Upgrade to a Core plan for higher limits and additional features.",
  },
  "api-access": {
    label: "API Access",
    description:
      "Programmatically query the HIBP API to check email addresses and domains for breach exposure. Rate limits vary by plan.",
  },
  "plain-text-search": {
    label: "Plain Text Email Search",
    description:
      "Search for email addresses via the API using full, unmasked email addresses. Simpler to implement than k-anonymity but the queried address is visible to the API.",
  },
  "k-anonymity": {
    label: "K-Anonymity Search",
    description:
      "Search for email addresses using a partial hash so the full address is never sent to the API. This privacy-preserving technique is exclusive to Pro and Enterprise plans.",
  },
  "stealer-logs": {
    label: "Stealer Logs",
    description:
      "Access credentials harvested by infostealer malware. Stealer log data includes the website where credentials were entered, the email address, and the compromised password — giving rich context beyond standard breach data. This is a Pro-exclusive feature.",
  },
  "customer-domains": {
    label: "Customer Domain Monitoring",
    description:
      "Monitor domains belonging to your customers or clients, not just your own organisation. Requires a Pro or Enterprise plan.",
  },
  "bulk-domain-add": {
    label: "Bulk Domain Add",
    description:
      "Add multiple domains at once using a CSV upload or API call. Speeds up onboarding for MSPs managing many clients.",
  },
  "auto-subdomain": {
    label: "Auto Subdomain Verification",
    description:
      "Automatically detect and monitor subdomains of your verified domains. Ensures complete coverage without manually adding each subdomain.",
  },
  "real-time-callbacks": {
    label: "Real-Time Breach Callbacks",
    description:
      "Receive an immediate HTTP callback to your endpoint when a new breach affecting your monitored domains is added to HIBP. Enables automated response workflows. Exclusive to Enterprise.",
  },
  "white-label": {
    label: "White-Label",
    description:
      "Deliver breach intelligence under your own brand with no HIBP attribution. Ideal for MSSPs and security vendors building breach monitoring into their products. Exclusive to Enterprise.",
  },
  "invoice-billing": {
    label: "Invoice & EFT Billing",
    description:
      "Pay via invoice and electronic funds transfer instead of a credit card. Required for procurement-gated enterprises. Available on Enterprise plans.",
  },
};

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
  featureMode: "email" | "domain" | "both";
  domainApiMode: "api" | "manual" | null;
}

function recommendPlan(input: RecommendInput): { plan: PlanDef; reason: string } {
  const { useCase, domainCount, breachCount, needsAnonymity, needsStealerLogs, apiRpmTier, featureMode } = input;

  // High RPM path: email-only (or email+domain) with high RPM need
  if (apiRpmTier === "high" && featureMode === "email") {
    const plan = HIGH_RPM_PLANS[0];
    return {
      plan,
      reason: "High RPM plans offer 4,000–12,000 RPM with k-anonymity for privacy-preserving email lookups. No domain monitoring is included.",
    };
  }

  // Pro-forcing conditions
  if (needsAnonymity || useCase === "customers" || needsStealerLogs || domainCount > 20) {
    const plan = PRO_PLANS.find((p) => domainCount <= p.maxDomains) || PRO_PLANS[PRO_PLANS.length - 1];
    const domainLabel = `${plan.maxDomains} domains`;
    let reason: string;
    if (needsStealerLogs) {
      reason = `Stealer log access is a Pro-exclusive feature. ${plan.name} supports ${domainLabel} with stealer logs and full domain monitoring.`;
    } else if (needsAnonymity) {
      reason = `K-anonymity is a Pro-exclusive feature. ${plan.name} supports ${domainLabel} with anonymous searches and customer domain monitoring.`;
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
  reason += ".";
  return { plan, reason };
}

export function initializePricingPage() {
  initPricingToggle();
  initWizard();
  initFeatureModals();
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

// Feature detail modals (Zendesk-style)
function initFeatureModals() {
  document.addEventListener("click", (e: Event) => {
    const target = (e.target as HTMLElement).closest("[data-feature]") as HTMLElement | null;
    if (!target) return;

    const slug = target.getAttribute("data-feature");
    if (!slug) return;

    const def = FEATURE_DEFINITIONS[slug];
    if (!def) return;

    e.preventDefault();
    e.stopPropagation();

    const labelEl = document.getElementById("featureDetailModalLabel");
    const bodyEl = document.getElementById("featureDetailModalBody");
    if (labelEl) labelEl.textContent = def.label;
    if (bodyEl) bodyEl.textContent = def.description;

    const modalEl = document.getElementById("featureDetailModal");
    if (modalEl) {
      // biome-ignore lint/suspicious/noExplicitAny: Bootstrap is loaded via CDN
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  });
}

// Wizard logic
function initWizard() {
  const wizard = document.getHtmlElementById<HTMLElement>("planFinderWizard");
  if (!wizard) return;

  const step0 = document.getElementById("wizardStep0") as HTMLElement;
  const step2 = document.getElementById("wizardStep2") as HTMLElement;
  const step2a = document.getElementById("wizardStep2a") as HTMLElement;
  const step2b = document.getElementById("wizardStep2b") as HTMLElement;
  const stepDomains = document.getElementById("wizardStepDomains") as HTMLElement;
  const step4 = document.getElementById("wizardStep4") as HTMLElement;
  const step5 = document.getElementById("wizardStep5") as HTMLElement;
  const result = document.getElementById("wizardResult") as HTMLElement;
  if (!step0 || !step2 || !step2a || !step2b || !stepDomains || !step4 || !step5 || !result) return;
  const steps: HTMLElement[] = [step0, step2, step2a, step2b, stepDomains, step4, step5, result];

  const stepIndicators = wizard.queryHtmlElements<HTMLElement>(".wizard-step");

  let featureMode: "email" | "domain" | "both" = "both";
  let domainApiMode: "api" | "manual" | null = null;
  let useCase: "own" | "customers" = "own";
  let domainCount = 1;
  let breachCount: number | undefined;
  let needsApi = false;
  let needsAnonymity = false;
  let apiRpmTier: "low" | "medium" | "high" | null = null;
  let needsStealerLogs = false;

  function getRecommendInput(): RecommendInput {
    return { useCase, domainCount, breachCount, needsApi, needsAnonymity, apiRpmTier, needsStealerLogs, featureMode, domainApiMode };
  }

  // Map panels to step indicator indices
  function stepIndicatorIndex(panel: HTMLElement): number {
    switch (panel) {
      case step0: return 0;
      case step2: return 1;
      case step2a: return 1;
      case step2b: return 1;
      case stepDomains: return 2;
      case step4: return 3;
      case step5: return 4;
      case result: return 5;
      default: return 0;
    }
  }

  const restartRow = document.getElementById("wizardRestartRow");

  function showPanel(panel: HTMLElement) {
    for (const s of steps) {
      s.classList.toggle("d-none", s !== panel);
    }
    const idx = stepIndicatorIndex(panel);
    for (let i = 0; i < stepIndicators.length; i++) {
      stepIndicators[i].classList.toggle("active", i <= idx);
      stepIndicators[i].classList.toggle("completed", i < idx);
    }
    if (restartRow) {
      restartRow.classList.toggle("d-none", panel === step0);
    }
  }

  // Step 0: Feature mode selection
  const featureModeCards = step0.queryHtmlElements<HTMLButtonElement>(".wizard-option-card");
  for (const card of featureModeCards) {
    card.addEventListener("click", () => {
      featureMode = card.getAttribute("data-feature-mode") as "email" | "domain" | "both";
      for (const c of featureModeCards) c.classList.remove("selected");
      card.classList.add("selected");

      if (featureMode === "domain") {
        needsApi = false;
        setTimeout(() => showPanel(stepDomains), 200);
      } else {
        setTimeout(() => showPanel(step2), 200);
      }
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
        if (featureMode === "email") {
          setTimeout(() => showPanel(step5), 200);
        } else {
          setTimeout(() => showPanel(stepDomains), 200);
        }
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

  // Step 2b: RPM tier
  const rpmBtns = step2b.queryHtmlElements<HTMLButtonElement>(".wizard-rpm-btn");
  for (const btn of rpmBtns) {
    btn.addEventListener("click", () => {
      apiRpmTier = btn.getAttribute("data-rpm") as "low" | "medium" | "high";
      for (const b of rpmBtns) b.classList.remove("active");
      btn.classList.add("active");
      if (featureMode === "email") {
        setTimeout(() => showPanel(step5), 200);
      } else {
        setTimeout(() => showPanel(stepDomains), 200);
      }
    });
  }

  // Combined domain step: use case, domain add mode, domain count
  const useCaseCards = stepDomains.queryHtmlElements<HTMLButtonElement>(".wizard-option-card[data-usecase]");
  for (const card of useCaseCards) {
    card.addEventListener("click", () => {
      useCase = card.getAttribute("data-usecase") as "own" | "customers";
      for (const c of useCaseCards) c.classList.remove("selected");
      card.classList.add("selected");
    });
  }

  const domainApiCards = stepDomains.queryHtmlElements<HTMLButtonElement>(".wizard-option-card[data-domain-api]");
  for (const card of domainApiCards) {
    card.addEventListener("click", () => {
      domainApiMode = card.getAttribute("data-domain-api") as "api" | "manual";
      for (const c of domainApiCards) c.classList.remove("selected");
      card.classList.add("selected");
    });
  }

  function proceedFromDomains(count: number) {
    domainCount = count;
    // Core "own" path gets domain lookup step; Pro/customers skip to stealer logs
    if (useCase === "own" && !needsAnonymity && domainCount <= 20) {
      showPanel(step4);
    } else {
      showPanel(step5);
    }
  }

  const domainBtns = stepDomains.queryHtmlElements<HTMLButtonElement>(".wizard-domain-btn");
  for (const btn of domainBtns) {
    btn.addEventListener("click", () => {
      const count = Number.parseInt(btn.getAttribute("data-count") || "1", 10);
      for (const b of domainBtns) b.classList.remove("active");
      btn.classList.add("active");
      setTimeout(() => proceedFromDomains(count), 200);
    });
  }

  // Step 4: Domain lookup (Core path)
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

  // Step 5: Stealer logs — initialize Bootstrap popovers
  const stealerCards = step5.queryHtmlElements<HTMLButtonElement>(".wizard-option-card");
  for (const card of stealerCards) {
    // biome-ignore lint/suspicious/noExplicitAny: Bootstrap is loaded via CDN
    new (window as any).bootstrap.Popover(card);
  }
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

  // View plan button — scroll to the highlighted SKU card so it's centred in view
  function handleViewPlan() {
    const highlighted = document.querySelector<HTMLElement>(".sku-card-recommended");
    if (highlighted) {
      highlighted.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      const el = document.getElementById("skuOverview");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const viewPlanBtnAlt = document.getHtmlElementById<HTMLButtonElement>("wizardViewPlanAlt");
  if (viewPlanBtnAlt) {
    viewPlanBtnAlt.addEventListener("click", () => handleViewPlan());
  }

  const restartBtn = document.getElementById("wizardRestart");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      featureMode = "both";
      domainApiMode = null;
      useCase = "own";
      domainCount = 1;
      breachCount = undefined;
      needsApi = false;
      needsAnonymity = false;
      apiRpmTier = null;
      needsStealerLogs = false;
      for (const el of wizard.queryHtmlElements<HTMLElement>(".wizard-option-card.selected")) {
        el.classList.remove("selected");
      }
      for (const el of wizard.queryHtmlElements<HTMLElement>(".wizard-rpm-btn.active")) {
        el.classList.remove("active");
      }
      for (const el of wizard.queryHtmlElements<HTMLElement>(".wizard-domain-btn.active")) {
        el.classList.remove("active");
      }
      clearHighlights();
      showPanel(step0);
    });
  }
}

// Highlight the recommended plan row and SKU card
function highlightRecommendedPlan(plan: PlanDef) {
  clearHighlights();

  const row = document.querySelector(`.plan-row[data-plan="${plan.id}"]`) as HTMLElement | null;
  if (row) {
    row.classList.add("plan-row-recommended");
  }

  const skuId = plan.tier === "pro" ? "skuPro" : plan.tier === "highRpm" ? "skuHighRpm" : "skuCore";
  const skuCard = document.getElementById(skuId);
  if (skuCard) {
    skuCard.classList.add("sku-card-recommended");
    let badge = skuCard.querySelector(".sku-recommended-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "badge bg-success sku-badge sku-recommended-badge";
      badge.textContent = "Recommended";
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
