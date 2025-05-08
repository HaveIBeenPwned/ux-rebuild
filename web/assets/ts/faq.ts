import { Collapse } from "bootstrap";

export function initializeFAQSearch() {
  // Get all accordion items
  const accordionItems = document.queryHtmlElements<HTMLElement>(".accordion-item");
  const accordionButtons = document.querySelectorAll<HTMLButtonElement>(".accordion-button");

  // Get search input (already in the HTML)
  const searchInput = document.getElementById("faqSearch") as HTMLInputElement;

  // Function to perform search
  function performSearch() {
    const searchTerm: string = searchInput.value.toLowerCase().trim();

    // Reset all accordion items
    for (const item of accordionItems) {
      // Get the collapse element
      const collapseEl = item.querySelector<HTMLElement>(".accordion-collapse");
      if (!collapseEl) return;
      // @ts-ignore: bootstrap is loaded globally
      const bsCollapse = Collapse.getInstance(collapseEl);

      // If it's open, close it
      if (collapseEl.classList.contains("show") && bsCollapse) {
        bsCollapse.hide();
      }

      // Remove any previous highlighting
      const content = item.querySelector<HTMLElement>(".accordion-body");
      if (content) {
        content.innerHTML = content.innerHTML.replace(/<mark class="search-highlight">(.*?)<\/mark>/g, "$1");
      }
    }

    // Hide the feedback message
    const searchFeedback = document.getElementById("searchFeedback") as HTMLElement;
    searchFeedback.style.display = "none";

    // If search term is empty, just reset
    if (!searchTerm) return;

    let foundMatch = false;
    let firstMatchItem: HTMLElement | null = null;
    let firstMatchElement: HTMLElement | null = null;

    // Look through each accordion item for matches
    for (const item of accordionItems) {
      // Get the text content and normalize it: lowercase, replace newlines with spaces, normalize whitespace
      const headingEl = item.querySelector<HTMLElement>(".accordion-header");
      const heading = headingEl ? (headingEl.textContent?.toLowerCase() ?? "") : "";

      // For content, need to preserve original HTML for highlighting but get normalized text for searching
      const bodyElement = item.querySelector<HTMLElement>(".accordion-body");
      const content =
        bodyElement?.textContent
          ?.toLowerCase()
          .replace(/\s+/g, " ") // Replace all whitespace (including newlines) with a single space
          .trim() ?? "";

      // Create a normalized version of the search term
      const normalizedSearchTerm = searchTerm.replace(/\s+/g, " ").trim();

      // Check if search term exists in heading or content
      if (heading.includes(normalizedSearchTerm) || content.includes(normalizedSearchTerm)) {
        // Track the first matched item if we haven't found one yet
        if (!foundMatch) {
          foundMatch = true;
          firstMatchItem = item;
        }

        // Get the collapse element and expand it
        const collapseEl = item.querySelector<HTMLElement>(".accordion-collapse");
        const button = item.querySelector<HTMLButtonElement>(".accordion-button");

        // Force open using Bootstrap API
        if (collapseEl) {
          // @ts-ignore: bootstrap is loaded globally
          const bsCollapse = Collapse.getOrCreateInstance(collapseEl, {
            toggle: false,
          });
          bsCollapse.show();
        }

        // Highlight the search term in the content - need to handle possible newlines in HTML
        const bodyContent = item.querySelector<HTMLElement>(".accordion-body");

        // Clone the content to work with
        if (bodyContent) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = bodyContent.innerHTML;

          // Process text nodes to highlight matches while preserving HTML structure
          highlightTextNodes(tempDiv, normalizedSearchTerm);

          // Update the content with highlighted version
          bodyContent.innerHTML = tempDiv.innerHTML;

          // Track the first highlight element in this item
          if (!firstMatchElement) {
            const highlightElements = item.querySelectorAll<HTMLElement>("mark.search-highlight");
            if (highlightElements.length > 0) {
              firstMatchElement = highlightElements[0];
            }
          }
        }
      }
    }

    // Scroll to the first match
    if (foundMatch && firstMatchItem) {
      setTimeout(() => {
        if (firstMatchElement) {
          firstMatchElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else {
          // Fallback to scrolling to the accordion item
          firstMatchItem.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 350); // Wait for animation to complete
    }

    // Show message if no results found
    if (!foundMatch) {
      const searchFeedback = document.getElementById("searchFeedback") as HTMLElement;
      searchFeedback.style.display = "block";
    }
  }

  // Function to escape special characters for regex safety
  function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Function to highlight text nodes without affecting HTML structure
  function highlightTextNodes(element: Element, searchTerm: string) {
    // Skip if this is a script, style, or already highlighted element
    if (element.tagName === "SCRIPT" || element.tagName === "STYLE" || element.tagName === "MARK") {
      return;
    }

    // Process child nodes
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i];

      if (node.nodeType === Node.TEXT_NODE) {
        // This is a text node, check for matches
        const text = node.textContent ?? "";
        const normalizedText = text.replace(/\s+/g, " ");

        // Create regex with word boundary for better matches
        const escapedSearchTerm = escapeRegExp(searchTerm);
        const regex = new RegExp(escapedSearchTerm, "gi");

        if (regex.test(normalizedText)) {
          // Found a match, replace with highlighted version
          const highlightedText = normalizedText.replace(regex, (match) => `<mark class="search-highlight">${match}</mark>`);

          // Create a new element with the highlighted content
          const span = document.createElement("span");
          span.innerHTML = highlightedText;

          // Replace the text node with our new span
          element.replaceChild(span, node);

          // Skip ahead since we've replaced this node
          i += span.childNodes.length - 1;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // This is an element node, recursively process it
        highlightTextNodes(node as Element, searchTerm);
      }
    }
  }

  // Attach event listener
  searchInput?.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch();
      e.preventDefault();
    }
  });

  // Also trigger search when input changes after a short delay (for live search)
  let searchTimeout: number;
  searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(performSearch, 500);
  });
}

export function initializeFAQDeepLinks() {
  // Add click handler for the link icon
  const permalink = document.querySelector<HTMLAnchorElement>(".faq-permalink");
  if (permalink) {
    // Check hash when page loads
    handleHash();

    // Also handle hash changes (if user clicks different links)
    window.addEventListener("hashchange", handleHash);

    permalink.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent accordion from toggling when clicking the link
    });
  }

  // Handle opening accordion based on URL hash
  function handleHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      // Find the corresponding accordion item
      const targetCollapse = document.getElementById(hash);
      if (targetCollapse) {
        // Expand the accordion
        const bsCollapse = Collapse.getOrCreateInstance(targetCollapse, {
          toggle: false,
        });
        bsCollapse.show();

        // Scroll to the question
        setTimeout(() => {
          targetCollapse?.parentElement?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 300);
      }
    }
  }
}
