import { Tab } from "bootstrap";

// Function to setup navigation from breaches table to stealer logs tab
export function setupStealerLogsNavigation() {
  // Find all stealer logs links in the breaches table (both badge and button)
  const stealerLogsLinks = document.queryHtmlElements<HTMLAnchorElement>('.breach-table-container a[href="#stealer-logs"]');

  for (const link of stealerLogsLinks) {
    link.addEventListener("click", (event) => {
      // Prevent the default hash change behavior
      event.preventDefault();

      // Get the sidebar link and programmatically click it to activate the tab
      const sidebarLink = document.querySelector('.sidebar-section a[href="#stealer-logs"]') as HTMLElement | null;

      if (sidebarLink) {
        // Create a Bootstrap Tab instance and show it
        const bsTab = new Tab(sidebarLink);
        bsTab.show();
      } else {
        console.error("Sidebar stealer logs link not found");

        // Fallback method if sidebar link isn't found
        const stealerLogsTab = document.querySelector("#stealer-logs") as HTMLElement | null;
        const tabPanes = document.queryHtmlElements<HTMLElement>(".tab-pane");

        if (stealerLogsTab) {
          // Hide all tabs
          for (const pane of tabPanes) {
            pane.classList.remove("show", "active");
          }

          // Show stealer logs tab
          stealerLogsTab.classList.add("show", "active");

          // Update URL hash
          window.history.replaceState(null, "", "#stealer-logs");
        }
      }
    });
  }
}
