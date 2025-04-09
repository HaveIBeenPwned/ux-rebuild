# Loading Button Plugin for Bootstrap 5

A lightweight plugin that adds loading state functionality to Bootstrap 5 buttons without requiring jQuery. This plugin allows for smooth transitions between normal and loading states, ideal for form submissions, AJAX requests, or any action that requires processing time.

## Installation

1. Include the loading-button.js file in your project after the Bootstrap JavaScript bundle:

```html
<!-- Bootstrap Bundle JS -->
<script src="path/to/bootstrap.bundle.min.js"></script>

<!-- Loading Button Plugin -->
<script src="path/to/loading-button.js"></script>
```

2. Ensure your buttons have the necessary HTML structure for loading indicators:

```html
<button class="btn btn-primary" data-bs-toggle="loading-button">
  <span class="btn-text">Submit</span>
  <div class="loading-indicator loading-indicator-sm loading-indicator-light">
    <!-- SVG loading indicator here -->
  </div>
</button>
```

3. Make sure you have the required CSS for loading indicators.

## Usage

### Via Data Attributes

The simplest way to use the plugin is with data attributes:

```html
<!-- Basic usage -->
<button data-bs-toggle="loading-button" class="btn btn-primary">
  <span class="btn-text">Submit</span>
  <div class="loading-indicator loading-indicator-sm">...</div>
</button>
```

### Via JavaScript

You can also use the plugin programmatically:

```javascript
// Initialize a button
const button = document.getElementById("myButton");
const loadingButton = new LoadingButton(button, {
  disableButton: true, // Disable the button while loading
  loadingClass: "is-loading", // Custom loading class
});

// Control the loading state
loadingButton.start(); // Start loading
loadingButton.stop(); // Stop loading
loadingButton.toggle(); // Toggle loading state
```

### Available Options

| Option          | Type    | Default      | Description                                  |
| --------------- | ------- | ------------ | -------------------------------------------- |
| `loadingClass`  | String  | 'is-loading' | CSS class added during loading state         |
| `resetAfter`    | Number  | 0            | Time in ms to auto-reset (0 = no auto-reset) |
| `disableButton` | Boolean | true         | Whether to disable the button while loading  |

### Events

The plugin triggers events you can listen for:

```javascript
const button = document.getElementById("myButton");

// Listen for loading start
button.addEventListener("loading.bs.button", (event) => {
  console.log("Button started loading");
});

// Listen for loading end
button.addEventListener("loaded.bs.button", (event) => {
  console.log("Button finished loading");
});
```

## Example Usage Scenarios

### Form Submission

```javascript
document.getElementById("myForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Get the submit button
  const submitBtn = this.querySelector('[type="submit"]');

  // Start loading
  if (submitBtn.loadingButton) {
    submitBtn.loadingButton.start();
  } else {
    new LoadingButton(submitBtn).start();
  }

  // Process form (e.g., AJAX submission)
  fetch(this.action, {
    method: this.method,
    body: new FormData(this),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle success
      console.log("Success:", data);
    })
    .catch((error) => {
      // Handle error
      console.error("Error:", error);
    })
    .finally(() => {
      // Stop loading regardless of outcome
      if (submitBtn.loadingButton) {
        submitBtn.loadingButton.stop();
      }
    });
});
```

### AJAX Request

```javascript
document.getElementById("loadDataBtn").addEventListener("click", function () {
  // Get button instance or create new one
  const loadingBtn = LoadingButton.getInstance(this) || new LoadingButton(this);

  // Start loading
  loadingBtn.start();

  // Fetch data
  fetch("/api/data")
    .then((response) => response.json())
    .then((data) => {
      // Process data
      displayData(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    })
    .finally(() => {
      // Stop loading
      loadingBtn.stop();
    });
});
```

## Compatibility

This plugin is designed for Bootstrap 5 and doesn't require jQuery. It uses modern JavaScript features and should work in all modern browsers.
