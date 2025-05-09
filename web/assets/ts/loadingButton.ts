/**
 * Simplified Loading Button for Bootstrap 5
 * A lightweight solution for adding loading states to buttons
 */

interface LoadingButtonOptions {
  loadingClass?: string;
  resetAfter?: number;
  disableButton?: boolean;
}

export interface LoadingButtonElement extends HTMLElement {
  loadingButton?: LoadingButton;
  form?: HTMLFormElement;
  type?: string;
  disabled?: boolean;
  dataset: DOMStringMap & {
    bsResetAfter?: string;
    bsDisableButton?: string;
    bsLoadingClass?: string;
  };
}

export class LoadingButton {
  public element: LoadingButtonElement;
  public options: Required<LoadingButtonOptions>;
  public isLoading: boolean;
  public timeout: ReturnType<typeof setTimeout> | null;

  constructor(element: LoadingButtonElement, options: LoadingButtonOptions = {}) {
    this.element = element;
    this.options = {
      loadingClass: "is-loading",
      resetAfter: 0,
      disableButton: true,
      ...options,
    };
    this.isLoading = false;
    this.timeout = null;

    // Store instance on element for future reference
    element.loadingButton = this;

    // Add click handler directly to the button if it's not a form submit
    if (!(element.form && element.type === "submit")) {
      element.addEventListener("click", (e: Event) => {
        if (!this.isLoading && !element.disabled) {
          e.preventDefault();
          this.start();
        }
      });
    }
  }

  start(): this {
    if (this.isLoading) return this;

    this.isLoading = true;
    this.element.classList.add(this.options.loadingClass);

    if (this.options.disableButton) {
      this.element.setAttribute("disabled", "disabled");
    }

    // Auto reset if specified
    if (this.options.resetAfter > 0) {
      this.timeout = setTimeout(() => {
        this.stop();
      }, this.options.resetAfter);
    }

    // Dispatch event for hooks
    this.element.dispatchEvent(
      new CustomEvent("loading.bs.button", {
        bubbles: true,
        detail: { isLoading: true },
      }),
    );

    return this;
  }

  stop(): this {
    if (!this.isLoading) return this;

    this.isLoading = false;
    this.element.classList.remove(this.options.loadingClass);

    if (this.options.disableButton) {
      this.element.removeAttribute("disabled");
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    // Dispatch event for hooks
    this.element.dispatchEvent(
      new CustomEvent("loaded.bs.button", {
        bubbles: true,
        detail: { isLoading: false },
      }),
    );

    return this;
  }

  toggle(): this {
    return this.isLoading ? this.stop() : this.start();
  }

  static getInstance(element: LoadingButtonElement): LoadingButton | undefined {
    return element.loadingButton;
  }

  static getOrCreateInstance(element: LoadingButtonElement, options: LoadingButtonOptions = {}): LoadingButton {
    if (!element.loadingButton) {
      return new LoadingButton(element, options);
    }
    return element.loadingButton;
  }
}

// Parse data attributes to options
function parseDataAttributes(element: LoadingButtonElement): LoadingButtonOptions {
  const options: LoadingButtonOptions = {};

  if (element.dataset.bsResetAfter) {
    options.resetAfter = Number.parseInt(element.dataset.bsResetAfter, 10);
  }

  if (element.dataset.bsDisableButton === "false") {
    options.disableButton = false;
  }

  if (element.dataset.bsLoadingClass) {
    options.loadingClass = element.dataset.bsLoadingClass;
  }

  return options;
}

// Initialize all loading buttons on page
function initializeLoadingButtons() {
  const buttons = document.queryHtmlElements<HTMLButtonElement>('[data-bs-toggle="loading-button"]');
  for (const button of buttons) {
    const btn = button as LoadingButtonElement;
    if (!btn.loadingButton) {
      new LoadingButton(btn, parseDataAttributes(btn));
    }
    btn.innerHTML = btn.innerHTML += `<div class="loading-indicator">
                                        <svg viewBox="0 0 400 271" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="14">
                                          <path class="logo-piece logo-piece-1" d="M387.941 162.208L400 99.9971H321.582L309.523 162.208H387.941Z" fill="#FFFFFF" />
                                          <path class="logo-piece logo-piece-2" d="M284.766 162.208L296.826 99.9971H218.408L206.349 162.208H284.766Z" fill="#FFFFFF" />
                                          <path class="logo-piece logo-piece-3" d="M160.475 270.998L176.746 187.029H98.3277L82.0571 270.998H160.475Z" fill="#FFFFFF" />
                                          <path class="logo-piece logo-piece-4" d="M78.4179 162.208L109.874 0.0765381H31.4565L0 162.208H78.4179Z" fill="#FFFFFF" />
                                          <path class="logo-piece logo-piece-5" d="M181.592 162.208L197.863 78.2393H119.445L103.174 162.208H181.592Z" fill="#FFFFFF" />
                                        </svg>
                                      </div>`;
  }
}

// Handle form submissions with loading buttons
function setupFormHandlers() {
  document.addEventListener("submit", (e: Event) => {
    const form = e.target as HTMLFormElement;
    const submitButton = form.querySelector('[data-bs-toggle="loading-button"][type="submit"]') as LoadingButtonElement | null;
    if (submitButton && !submitButton.disabled) {
      const instance = submitButton.loadingButton || new LoadingButton(submitButton, parseDataAttributes(submitButton));
      instance.start();
    }
  });
}

export function initializeLoadingButtonsOnPageLoad() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initializeLoadingButtons();
      setupFormHandlers();
    });
  } else {
    initializeLoadingButtons();
    setupFormHandlers();
  }
}
