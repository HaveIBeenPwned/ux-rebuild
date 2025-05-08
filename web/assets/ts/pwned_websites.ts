interface Breach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  LogoPath: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
  IsSubscriptionFree: boolean;
  IsStealerLog: boolean;
}

interface SortState {
  column: "name" | "count" | "date";
  direction: "asc" | "desc";
}

export async function initializeBreachTable() {
  // If the table and the table body is not present, exit early
  const breachesTable = document.querySelector<HTMLTableElement>("#breachesTable");
  const breachesTableBody = document.querySelector<HTMLTableSectionElement>("#breachesTable tbody");
  if (!breachesTable || !breachesTableBody) return;

  // Get all rows in the table body
  const breachesRows = Array.from(breachesTableBody.querySelectorAll<HTMLTableRowElement>("tr"));

  // Uncomment the following line to generate breach rows and override the static content
  // await generateBreachRowContents();

  // Initialize sorting state
  const currentSort: SortState = {
    column: "date", // Default sort column
    direction: "desc", // Default sort direction
  };

  // Select all sortable column headers
  const sortableHeaders = document.queryHtmlElements<HTMLTableCellElement>("th.sortable");

  // Add click event listeners to sortable headers
  for (const header of sortableHeaders) {
    header.addEventListener("click", () => {
      const column = header.getAttribute("data-sort") as SortState["column"] | null;
      if (!column) return;
      // Toggle sort direction or set to 'asc' if changing columns
      if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        currentSort.column = column;
        currentSort.direction = "asc";
      }

      // Sort the breaches
      sortBreaches(currentSort, breachesTableBody, breachesRows);

      // Update the visual indicators
      updateSortIndicators(currentSort, sortableHeaders);
    });
  }

  // Initial sort and display
  sortBreaches(currentSort, breachesTableBody, breachesRows);
  updateSortIndicators(currentSort, sortableHeaders);
}

// Function to update the visual indicators for sorting
function updateSortIndicators(currentSort: SortState, sortableHeaders: HTMLTableCellElement[]) {
  // Remove all existing sort indicators
  for (const header of sortableHeaders) {
    const icon = header.querySelector<HTMLImageElement>("i");
    if (icon) icon.className = "bi bi-arrow-down-up ms-2 small";
  }

  // Add indicator to current sort column
  const currentHeader = document.querySelector<HTMLTableCellElement>(`th[data-sort="${currentSort.column}"]`);
  if (!currentHeader) return;
  const icon = currentHeader.querySelector("i");

  if (!icon) return;
  icon.className = `bi bi-sort-${currentSort.direction === "asc" ? "up" : "down"}`;
}

// Function to sort breaches based on current sort settings
function sortBreaches(currentSort: SortState, breachesTableBody: HTMLTableSectionElement, breachesRows: HTMLTableRowElement[]) {
  // Sort the rows based on the current sort settings
  breachesRows.sort((a, b) => {
    let comparison = 0;

    switch (currentSort.column) {
      case "name": {
        const aTitle = a.querySelector<HTMLTableCellElement>("td[data-name='breach']")?.dataset.value || "";
        const bTitle = b.querySelector<HTMLTableCellElement>("td[data-name='breach']")?.dataset.value || "";
        comparison = aTitle.localeCompare(bTitle);
        break;
      }
      case "count": {
        const aPwnCount = Number.parseInt(a.querySelector<HTMLTableCellElement>("td[data-name='pwncount']")?.dataset.value || "0");
        const bPwnCount = Number.parseInt(b.querySelector<HTMLTableCellElement>("td[data-name='pwncount']")?.dataset.value || "0");
        comparison = aPwnCount - bPwnCount;
        break;
      }
      case "date": {
        const aDate = Number.parseInt(a.querySelector<HTMLTableCellElement>("td[data-name='date']")?.dataset.value || "0");
        const bDate = Number.parseInt(b.querySelector<HTMLTableCellElement>("td[data-name='date']")?.dataset.value || "0");
        comparison = aDate - bDate;
        break;
      }
      default:
        comparison = 0;
    }

    // Reverse comparison if descending order
    return currentSort.direction === "desc" ? -comparison : comparison;
  });

  // Update the table with the sorted data
  updateTable(breachesTableBody, breachesRows);
}

// Function to update the table with sorted data
function updateTable(tableBody: HTMLTableSectionElement, breachesRows: Node[]) {
  // Clear existing rows
  tableBody.innerHTML = "";

  // Add sorted rows
  for (const row of breachesRows) {
    tableBody.appendChild(row);
  }
}

/**
 * Generates the HTML content for a breach row.
 * @param {Breach} breach - The breach data.
 * @returns {string} - The HTML string for the breach row.
 */
async function generateBreachRowContents() {
  const tableBody = document.querySelector<HTMLTableSectionElement>("#breachesTable tbody");
  if (!tableBody) return;
  tableBody.innerHTML = "";
  const breachesResponse = await fetch("https://api.haveibeenpwned.com/breaches");
  const breachesData: Breach[] = await breachesResponse.json();
  const breachCountElement = document.querySelector<HTMLDivElement>("#breachCount");
  if (breachCountElement) {
    breachCountElement.innerText = breachesData.length.toLocaleString();
  }

  const accountsCountElement = document.querySelector<HTMLDivElement>("#accountsCount");
  if (accountsCountElement) {
    const totalAccounts = breachesData.reduce((sum, breach) => sum + breach.PwnCount, 0) / 1000000000.0;
    accountsCountElement.innerText = `${totalAccounts.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B+`;
  }
  let tableContents = "";
  for (const breach of breachesData) {
    tableContents += `
    <tr>
      <td data-name="breach" data-value="${breach.Title}">
        <div class="d-flex align-items-center">
          <div>${breach.Title}</div>
        </div>
      </td>
      <td data-name="pwncount" data-value="${breach.PwnCount}">${breach.PwnCount.toLocaleString()}</td>
      <td data-name="date" data-value="${Date.parse(breach.AddedDate)}">${new Date(breach.AddedDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</td>
      <td>
        <a href="breach.html" class="btn btn-secondary d-flex align-items-center justify-content-center table-action-btn">
          <i class="bi bi-arrow-right"></i>
        </a>
      </td>
    </tr>
`;
  }

  tableBody.innerHTML = tableContents;
}
