/**
 * Loading Button Plugin for Bootstrap 5
 * Enables smooth transitions between normal and loading states for buttons
 */

(function () {
  "use strict";

  // The plugin constructor
  const LoadingButton = function (element, options) {
    this._element = element;
    this._options = {
      ...LoadingButton.Default,
      ...options,
    };
    this._isLoading = false;
  };

  // Default options
  LoadingButton.Default = {
    loadingClass: "is-loading",
    resetAfter: 0, // 0 means no auto-reset, time in milliseconds
    disableButton: true,
  };

  // Plugin methods
  LoadingButton.prototype = {
    toggle: function () {
      if (this._isLoading) {
        this.stop();
      } else {
        this.start();
      }
      return this;
    },

    start: function () {
      if (this._isLoading) return;

      this._isLoading = true;
      this._element.classList.add(this._options.loadingClass);

      if (this._options.disableButton) {
        this._element.setAttribute("disabled", "disabled");
      }

      // Auto reset after specified time if option is set
      if (this._options.resetAfter > 0) {
        this._timeout = setTimeout(() => {
          this.stop();
        }, this._options.resetAfter);
      }

      // Trigger custom event
      this._element.dispatchEvent(
        new CustomEvent("loading.bs.button", {
          bubbles: true,
          detail: { isLoading: true },
        })
      );

      return this;
    },

    stop: function () {
      if (!this._isLoading) return;

      this._isLoading = false;
      this._element.classList.remove(this._options.loadingClass);

      if (this._options.disableButton) {
        this._element.removeAttribute("disabled");
      }

      // Clear timeout if it exists
      if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
      }

      // Trigger custom event
      this._element.dispatchEvent(
        new CustomEvent("loaded.bs.button", {
          bubbles: true,
          detail: { isLoading: false },
        })
      );

      return this;
    },

    dispose: function () {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }

      this.stop();

      this._element = null;
      this._options = null;
      this._isLoading = null;
      this._timeout = null;
    },
  };

  // Static methods
  LoadingButton.getInstance = function (element) {
    return element.loadingButton;
  };

  // Data API implementation
  function initializeDataAPI() {
    const loadingButtons = document.querySelectorAll(
      '[data-bs-toggle="loading-button"]'
    );

    loadingButtons.forEach((button) => {
      if (!button.loadingButton) {
        // Parse options from data attributes
        const options = {};

        if (button.dataset.bsResetAfter) {
          options.resetAfter = parseInt(button.dataset.bsResetAfter, 10);
        }

        if (button.dataset.bsDisableButton === "false") {
          options.disableButton = false;
        }

        if (button.dataset.bsLoadingClass) {
          options.loadingClass = button.dataset.bsLoadingClass;
        }

        button.loadingButton = new LoadingButton(button, options);
      }
    });
  }

  // Handle clicks on buttons with the data-bs-toggle="loading-button" attribute
  document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-bs-toggle="loading-button"]');
    if (button && !button.disabled) {
      const action = button.dataset.bsAction || "toggle";

      if (!button.loadingButton) {
        // Initialize on first click if not already initialized
        const options = {};

        if (button.dataset.bsResetAfter) {
          options.resetAfter = parseInt(button.dataset.bsResetAfter, 10);
        }

        if (button.dataset.bsDisableButton === "false") {
          options.disableButton = false;
        }

        if (button.dataset.bsLoadingClass) {
          options.loadingClass = button.dataset.bsLoadingClass;
        }

        button.loadingButton = new LoadingButton(button, options);
      }

      if (typeof button.loadingButton[action] === "function") {
        button.loadingButton[action]();
      }
    }
  });

  // Initialize when DOM is fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDataAPI);
  } else {
    initializeDataAPI();
  }

  // Export to global
  window.LoadingButton = LoadingButton;
})();
