/**
 * Simplified Loading Button for Bootstrap 5
 * A lightweight solution for adding loading states to buttons
 */

(function () {
  "use strict";

  // Simple LoadingButton class
  class LoadingButton {
    constructor(element, options = {}) {
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
        element.addEventListener("click", (e) => {
          if (!this.isLoading && !element.disabled) {
            e.preventDefault();
            this.start();
          }
        });
      }
    }

    start() {
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
        })
      );

      return this;
    }

    stop() {
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
        })
      );

      return this;
    }

    toggle() {
      return this.isLoading ? this.stop() : this.start();
    }
  }

  // Parse data attributes to options
  function parseDataAttributes(element) {
    const options = {};

    if (element.dataset.bsResetAfter) {
      options.resetAfter = parseInt(element.dataset.bsResetAfter, 10);
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
    document
      .querySelectorAll('[data-bs-toggle="loading-button"]')
      .forEach((button) => {
        if (!button.loadingButton) {
          new LoadingButton(button, parseDataAttributes(button));
        }
      });
  }

  // Handle form submissions with loading buttons
  function setupFormHandlers() {
    document.addEventListener("submit", function (e) {
      const submitButton = e.target.querySelector(
        '[data-bs-toggle="loading-button"][type="submit"]'
      );
      if (submitButton && !submitButton.disabled) {
        const instance =
          submitButton.loadingButton ||
          new LoadingButton(submitButton, parseDataAttributes(submitButton));
        instance.start();
      }
    });
  }

  // Initialize when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initializeLoadingButtons();
      setupFormHandlers();
    });
  } else {
    initializeLoadingButtons();
    setupFormHandlers();
  }

  // Static utility methods for programmatic access
  LoadingButton.getInstance = function (element) {
    return element.loadingButton;
  };

  LoadingButton.getOrCreateInstance = function (element, options = {}) {
    if (!element.loadingButton) {
      return new LoadingButton(element, options);
    }
    return element.loadingButton;
  };

  // Export to global scope
  window.LoadingButton = LoadingButton;
})();
