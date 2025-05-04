document.addEventListener('DOMContentLoaded', function() {
    const optoutForm = document.getElementById('optoutForm');
    const optoutBtn = document.getElementById('optoutBtn');
    const step1 = document.getElementById('optout-step-1');
    const step2 = document.getElementById('optout-step-2');
    const verificationMessage = document.getElementById('verification-message');
    const successMessages = document.querySelectorAll('.success-message');
    const optoutMethodBtns = document.querySelectorAll('.optout-method-btn');
    
    // Check URL parameters to determine which view to show
    const urlParams = new URLSearchParams(window.location.search);
    const confirmedEmail = urlParams.get('confirmed_email');
    
    if (confirmedEmail === 'true') {
      // If email is confirmed, show opt-out methods
      step1.classList.add('d-none');
      step2.classList.remove('d-none');
    }
    
    if (optoutForm) {
      optoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Start loading animation
        if (optoutBtn) {
          optoutBtn.setAttribute('disabled', 'disabled');
          optoutBtn.classList.add('is-loading');
          
          // After loading completes, show verification message
          setTimeout(function() {
            // Hide the form and show verification message
            document.querySelector('.card-glow .row').classList.add('d-none');
            verificationMessage.classList.remove('d-none');
            
            // Restore button state
            optoutBtn.removeAttribute('disabled');
            optoutBtn.classList.remove('is-loading');
          }, 2000);
        }
      });
    }
    
    // Add click event listener to all opt-out method buttons
    optoutMethodBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Find the adjacent success message
        const successMessage = this.parentElement.querySelector('.success-message');
        
        // Add loading state
        this.setAttribute('disabled', 'disabled');
        this.classList.add('is-loading');
        
        // After loading completes (2 seconds), show success message
        setTimeout(() => {
          // Show success message next to this button
          successMessage.classList.remove('d-none');
          
          // Apply animation for the success message
          successMessage.style.opacity = '0';
          successMessage.style.transition = 'opacity 0.3s ease-in-out';
          
          setTimeout(() => {
            successMessage.style.opacity = '1';
          }, 10);
          
          // Restore button state and disable permanently
          this.classList.remove('is-loading');
          // Keep button disabled
        }, 2000);
      });
    });
  });