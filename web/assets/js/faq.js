document.addEventListener("DOMContentLoaded", function () {
  // Get all accordion items
  const accordionItems = document.querySelectorAll(".accordion-item");
  const accordionButtons = document.querySelectorAll(".accordion-button");

  // Get search input (already in the HTML)
  const searchInput = document.getElementById("faqSearch");

  // Function to perform search
  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    // Reset all accordion items
    accordionItems.forEach((item) => {
      // Get the collapse element
      const collapseEl = item.querySelector(".accordion-collapse");
      const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);

      // If it's open, close it
      if (collapseEl.classList.contains("show") && bsCollapse) {
        bsCollapse.hide();
      }

      // Remove any previous highlighting
      const content = item.querySelector(".accordion-body");
      content.innerHTML = content.innerHTML.replace(
        /<mark class="search-highlight">(.*?)<\/mark>/g,
        "$1"
      );
    });

    // Hide the feedback message
    const searchFeedback = document.getElementById("searchFeedback");
    searchFeedback.style.display = "none";

    // If search term is empty, just reset
    if (!searchTerm) return;

    let foundMatch = false;
    let firstMatchItem = null;
    let firstMatchElement = null;

    // Look through each accordion item for matches
    accordionItems.forEach((item) => {
      // Get the text content and normalize it: lowercase, replace newlines with spaces, normalize whitespace
      const heading = item
        .querySelector(".accordion-header")
        .textContent.toLowerCase();

      // For content, need to preserve original HTML for highlighting but get normalized text for searching
      const bodyElement = item.querySelector(".accordion-body");
      const content = bodyElement.textContent
        .toLowerCase()
        .replace(/\s+/g, " ") // Replace all whitespace (including newlines) with a single space
        .trim();

      // Create a normalized version of the search term
      const normalizedSearchTerm = searchTerm.replace(/\s+/g, " ").trim();

      // Check if search term exists in heading or content
      if (
        heading.includes(normalizedSearchTerm) ||
        content.includes(normalizedSearchTerm)
      ) {
        // Track the first matched item if we haven't found one yet
        if (!foundMatch) {
          foundMatch = true;
          firstMatchItem = item;
        }

        // Get the collapse element and expand it
        const collapseEl = item.querySelector(".accordion-collapse");
        const button = item.querySelector(".accordion-button");

        // Force open using Bootstrap API
        const bsCollapse = new bootstrap.Collapse(collapseEl, {
          toggle: false,
        });
        bsCollapse.show();

        // Highlight the search term in the content - need to handle possible newlines in HTML
        const bodyContent = item.querySelector(".accordion-body");

        // Clone the content to work with
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = bodyContent.innerHTML;

        // Process text nodes to highlight matches while preserving HTML structure
        highlightTextNodes(tempDiv, normalizedSearchTerm);

        // Update the content with highlighted version
        bodyContent.innerHTML = tempDiv.innerHTML;

        // Track the first highlight element in this item
        if (!firstMatchElement) {
          const highlightElements = item.querySelectorAll(
            "mark.search-highlight"
          );
          if (highlightElements.length > 0) {
            firstMatchElement = highlightElements[0];
          }
        }
      }
    });

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
      const searchFeedback = document.getElementById("searchFeedback");
      searchFeedback.style.display = "block";
    }
  }

  // Function to escape special characters for regex safety
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Function to highlight text nodes without affecting HTML structure
  function highlightTextNodes(element, searchTerm) {
    // Skip if this is a script, style, or already highlighted element
    if (
      element.tagName === "SCRIPT" ||
      element.tagName === "STYLE" ||
      element.tagName === "MARK"
    ) {
      return;
    }

    // Process child nodes
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i];

      if (node.nodeType === Node.TEXT_NODE) {
        // This is a text node, check for matches
        const text = node.textContent;
        const normalizedText = text.replace(/\s+/g, " ");

        // Create regex with word boundary for better matches
        const escapedSearchTerm = escapeRegExp(searchTerm);
        const regex = new RegExp(escapedSearchTerm, "gi");

        if (regex.test(normalizedText)) {
          // Found a match, replace with highlighted version
          const highlightedText = normalizedText.replace(
            regex,
            (match) => `<mark class="search-highlight">${match}</mark>`
          );

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
        highlightTextNodes(node, searchTerm);
      }
    }
  }

  // Attach event listener
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
      e.preventDefault();
    }
  });

  // Also trigger search when input changes after a short delay (for live search)
  let searchTimeout;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });
});
