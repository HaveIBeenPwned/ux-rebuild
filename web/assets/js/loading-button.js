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

    // Store the instance on the element for future access
    element.loadingButton = this;
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

      delete this._element.loadingButton;
      this._element = null;
      this._options = null;
      this._isLoading = null;
      this._timeout = null;
    },

    isLoading: function () {
      return this._isLoading;
    },
  };

  // Static methods
  LoadingButton.getInstance = function (element) {
    return element.loadingButton;
  };

  // Get or create an instance
  LoadingButton.getOrCreateInstance = function (element, options = {}) {
    if (!element.loadingButton) {
      return new LoadingButton(element, options);
    }

    // If we have an existing instance but new options are provided, update them
    if (Object.keys(options).length > 0) {
      element.loadingButton._options = {
        ...element.loadingButton._options,
        ...options,
      };
    }

    return element.loadingButton;
  };

  // Parse options from data attributes
  function parseOptions(element) {
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

  // Data API implementation
  function initializeDataAPI() {
    const loadingButtons = document.querySelectorAll(
      '[data-bs-toggle="loading-button"]'
    );

    loadingButtons.forEach((button) => {
      if (!button.loadingButton) {
        const options = parseOptions(button);
        new LoadingButton(button, options);
      }
    });
  }

  // Clear existing click handler to avoid multiple handlers
  document.removeEventListener("click", handleButtonClick);

  // Handle clicks on buttons with the data-bs-toggle="loading-button" attribute
  function handleButtonClick(event) {
    // Only handle if the form isn't handling the submission
    if (event.target.form && event.target.type === "submit") {
      return;
    }

    const button = event.target.closest('[data-bs-toggle="loading-button"]');
    if (button && !button.disabled) {
      event.preventDefault();
      const action = button.dataset.bsAction || "toggle";

      // Get or create the loading button instance
      const instance = LoadingButton.getOrCreateInstance(
        button,
        parseOptions(button)
      );

      if (typeof instance[action] === "function") {
        instance[action]();
      }
    }
  }

  document.addEventListener("click", handleButtonClick);

  // Initialize when DOM is fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDataAPI);
  } else {
    initializeDataAPI();
  }

  // Export to global
  window.LoadingButton = LoadingButton;
})();
