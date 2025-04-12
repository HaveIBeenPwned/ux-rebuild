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

  // Password Growth Chart initialization
  if (document.getElementById("passwordGrowthChart")) {
    initializePasswordGrowthChart();
  }

  function initializePasswordGrowthChart() {
    const ctx = document.getElementById("passwordGrowthChart").getContext("2d");

    const data = {
      labels: [
        "Aug 2017",
        "Feb 2018",
        "Jul 2018",
        "Jan 2019",
        "Jul 2019",
        "Jun 2020",
        "Nov 2020",
        "Dec 2021",
        "Current",
      ],
      datasets: [
        {
          label: "Passwords (Millions)",
          data: [306, 500, 516, 551, 555, 573, 613, 800, 847],
          backgroundColor: "rgba(91, 192, 222, 0.3)",
          borderColor: "rgba(91, 192, 222, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(91, 192, 222, 1)",
          pointBorderColor: "#fff",
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          fill: true,
        },
      ],
    };

    const config = {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
              callback: function (value) {
                return value + "M";
              },
            },
          },
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.7)",
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            callbacks: {
              label: function (context) {
                return context.raw + " million passwords";
              },
            },
          },
        },
      },
    };

    new Chart(ctx, config);
  }
});
