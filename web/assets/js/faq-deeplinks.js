document.addEventListener("DOMContentLoaded", function () {
  // Add click handler for the link icon
  const permalink = document.querySelector(".faq-permalink");
  if (permalink) {
    permalink.addEventListener("click", function(e) {
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
        const bsCollapse = new bootstrap.Collapse(targetCollapse, {
          toggle: false
        });
        bsCollapse.show();
        
        // Scroll to the question
        setTimeout(() => {
          targetCollapse.parentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 300);
      }
    }
  }
  
  // Check hash when page loads
  handleHash();
  
  // Also handle hash changes (if user clicks different links)
  window.addEventListener('hashchange', handleHash);
}); 