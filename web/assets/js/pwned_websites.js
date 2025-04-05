document.addEventListener("DOMContentLoaded", function () {
  // Complete breach data for the table
  const breaches = [
    {
      name: "LinkedIn",
      icon: "https://logos.haveibeenpwned.com/LinkedIn.png",
      count: 164611595,
      date: "May 21, 2016",
      dateAdded: new Date("2016-05-21"),
    },
    {
      name: "Adobe",
      icon: "https://logos.haveibeenpwned.com/Adobe.png",
      count: 152445165,
      date: "October 4, 2013",
      dateAdded: new Date("2013-10-04"),
    },
    {
      name: "Zynga",
      icon: "https://logos.haveibeenpwned.com/Zynga.png",
      count: 172869660,
      date: "December 19, 2019",
      dateAdded: new Date("2019-12-19"),
    },
    {
      name: "MyFitnessPal",
      icon: "https://logos.haveibeenpwned.com/MyFitnessPal.png",
      count: 151372585,
      date: "March 29, 2018",
      dateAdded: new Date("2018-03-29"),
    },
    {
      name: "Dropbox",
      icon: "https://logos.haveibeenpwned.com/Dropbox.png",
      count: 68648009,
      date: "August 31, 2016",
      dateAdded: new Date("2016-08-31"),
    },
    {
      name: "Badoo",
      icon: "https://logos.haveibeenpwned.com/Badoo.png",
      count: 127277101,
      date: "June 22, 2020",
      dateAdded: new Date("2020-06-22"),
    },
    {
      name: "Yahoo",
      icon: "https://logos.haveibeenpwned.com/Yahoo.png",
      count: 3000000000,
      date: "October 3, 2017",
      dateAdded: new Date("2017-10-03"),
    },
    {
      name: "VK",
      icon: "https://logos.haveibeenpwned.com/VK.png",
      count: 93338602,
      date: "January 1, 2012",
      dateAdded: new Date("2012-01-01"),
    },
    {
      name: "Canva",
      icon: "https://logos.haveibeenpwned.com/Canva.png",
      count: 137272116,
      date: "May 24, 2019",
      dateAdded: new Date("2019-05-24"),
    },
    {
      name: "Tumblr",
      icon: "https://logos.haveibeenpwned.com/Tumblr.png",
      count: 65469298,
      date: "May 31, 2013",
      dateAdded: new Date("2013-05-31"),
    },
    {
      name: "Dailymotion",
      icon: "https://logos.haveibeenpwned.com/Dailymotion.png",
      count: 85176234,
      date: "October 20, 2016",
      dateAdded: new Date("2016-10-20"),
    },
    {
      name: "Clubhouse",
      icon: "https://logos.haveibeenpwned.com/Clubhouse.png",
      count: 3800000,
      date: "April 11, 2021",
      dateAdded: new Date("2021-04-11"),
    },
    {
      name: "Zoosk",
      icon: "https://logos.haveibeenpwned.com/Zoosk.png",
      count: 23927853,
      date: "August 7, 2020",
      dateAdded: new Date("2020-08-07"),
    },
    {
      name: "Chegg",
      icon: "https://logos.haveibeenpwned.com/Chegg.png",
      count: 40000000,
      date: "September 26, 2018",
      dateAdded: new Date("2018-09-26"),
    },
    {
      name: "Dubsmash",
      icon: "https://logos.haveibeenpwned.com/Dubsmash.png",
      count: 161549210,
      date: "December 11, 2018",
      dateAdded: new Date("2018-12-11"),
    },
    {
      name: "Plex",
      icon: "https://logos.haveibeenpwned.com/Plex.png",
      count: 13137223,
      date: "August 24, 2023",
      dateAdded: new Date("2023-08-24"),
    },
    {
      name: "Gravatar",
      icon: "https://logos.haveibeenpwned.com/Gravatar.png",
      count: 113990759,
      date: "October 3, 2020",
      dateAdded: new Date("2020-10-03"),
    },
    {
      name: "8tracks",
      icon: "https://logos.haveibeenpwned.com/8tracks.png",
      count: 17996556,
      date: "September 4, 2017",
      dateAdded: new Date("2017-09-04"),
    },
    {
      name: "1win",
      icon: "https://logos.haveibeenpwned.com/1win.png",
      count: 96166543,
      date: "February 3, 2025",
      dateAdded: new Date("2025-02-03"),
    },
  ];

  // Initialize sorting state
  let currentSort = {
    column: "date", // Default sort column
    direction: "desc", // Default sort direction
  };

  // Select all sortable column headers
  const sortableHeaders = document.querySelectorAll("th.sortable");

  // Add click event listeners to sortable headers
  sortableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const column = header.getAttribute("data-sort");

      // Toggle sort direction or set to 'asc' if changing columns
      if (currentSort.column === column) {
        currentSort.direction =
          currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        currentSort.column = column;
        currentSort.direction = "asc";
      }

      // Sort the breaches
      sortBreaches();

      // Update the visual indicators
      updateSortIndicators();
    });
  });

  // Function to sort breaches based on current sort settings
  function sortBreaches() {
    breaches.sort((a, b) => {
      let comparison = 0;

      switch (currentSort.column) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "count":
          comparison = a.count - b.count;
          break;
        case "date":
          comparison = a.dateAdded - b.dateAdded;
          break;
        default:
          comparison = 0;
      }

      // Reverse comparison if descending order
      return currentSort.direction === "desc" ? -comparison : comparison;
    });

    // Update the table with the sorted data
    updateTable();
  }

  // Function to update the table with sorted data
  function updateTable() {
    const tableBody = document.querySelector("#breachesTable tbody");

    // Clear existing rows
    tableBody.innerHTML = "";

    // Add sorted rows
    breaches.forEach((breach) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>
          <div class="d-flex align-items-center">
            <div>${breach.name}</div>
          </div>
        </td>
        <td>${breach.count.toLocaleString()}</td>
        <td>${breach.date}</td>
        <td>
          <a href="breach.html" class="btn btn-secondary d-flex align-items-center justify-content-center table-action-btn">
            <i class="bi bi-arrow-right"></i>
          </a>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  // Function to update the visual indicators for sorting
  function updateSortIndicators() {
    // Remove all existing sort indicators
    sortableHeaders.forEach((header) => {
      const icon = header.querySelector("i");
      icon.className = "bi bi-arrow-down-up ms-2 small";
    });

    // Add indicator to current sort column
    const currentHeader = document.querySelector(
      `th[data-sort="${currentSort.column}"]`
    );
    const icon = currentHeader.querySelector("i");

    if (currentSort.direction === "asc") {
      icon.className = "bi bi-sort-up ms-2 small";
    } else {
      icon.className = "bi bi-sort-down ms-2 small";
    }
  }

  // Initial sort and display
  sortBreaches();
  updateSortIndicators();
});
