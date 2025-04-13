document.addEventListener("DOMContentLoaded", function () {
  // Password checking functionality
  const passwordForm = document.getElementById("passwordForm");
  const passwordInput = document.getElementById("passwordInput");
  const checkButton = document.getElementById("checkButton");
  const goodResult = document.getElementById("pwned-result-good");
  const badResult = document.getElementById("pwned-result-bad");
  const occurrenceCount = document.getElementById("occurrence-count");

  // Hide results initially
  goodResult.classList.add("d-none");
  badResult.classList.add("d-none");

  // Function to handle password checking
  function handlePasswordCheck() {
    const password = passwordInput.value.trim();

    if (!password) {
      // Empty password, don't do anything
      return;
    }

    // Hide any previous results
    goodResult.classList.add("d-none");
    badResult.classList.add("d-none");

    // Manually trigger the loading state
    if (!checkButton.loadingButton) {
      // Initialize if not already done
      checkButton.loadingButton = new LoadingButton(checkButton, {
        loadingClass: "is-loading",
        disableButton: true,
        resetAfter: 0,
      });
    }

    // Start loading animation
    checkButton.loadingButton.start();

    // Simulate API call
    checkPasswordSecurity(password);
  }

  // Handle form submissions (Enter key)
  passwordForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handlePasswordCheck();
  });

  // Handle direct button clicks
  checkButton.addEventListener("click", function (e) {
    e.preventDefault();
    handlePasswordCheck();
  });

  function checkPasswordSecurity(password) {
    // For demo purposes, we'll consider common passwords as "pwned"
    const commonPasswords = [
      "password",
      "123456",
      "qwerty",
      "admin",
      "welcome",
      "password123",
    ];

    // Simulate API call delay
    setTimeout(() => {
      // Stop loading animation
      if (checkButton.loadingButton) {
        checkButton.loadingButton.stop();
      }

      if (commonPasswords.includes(password.toLowerCase())) {
        // Password found in breach database
        const fakeCount = Math.floor(Math.random() * 5000000) + 1000000;
        showPwnedResult(fakeCount);
      } else {
        // Password not found
        showSafeResult();
      }
    }, 1500);
  }

  function showPwnedResult(count) {
    goodResult.classList.add("d-none");
    badResult.classList.remove("d-none");

    // Format the count with commas
    occurrenceCount.textContent = count.toLocaleString();

    // Scroll to results
    badResult.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function showSafeResult() {
    badResult.classList.add("d-none");
    goodResult.classList.remove("d-none");

    // Scroll to results
    goodResult.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});
