document.addEventListener('DOMContentLoaded', function() {
  // Form submission handling
  const notificationForm = document.getElementById('notificationForm');
  const notificationInitial = document.getElementById('notificationInitial');
  const notificationSent = document.getElementById('notificationSent');
  const resendVerificationBtn = document.getElementById('resendVerificationBtn');
  const notificationEmailInput = document.getElementById('notificationEmail');
  const notifySubmitBtn = document.getElementById('notifySubmitBtn');
  
  let submittedEmail = '';

  // Check if there's an email in session storage (from search)
  if (notificationEmailInput) {
    const searchedEmail = sessionStorage.getItem('searchedEmail');
    if (searchedEmail) {
      notificationEmailInput.value = searchedEmail;
    }
  }

  if (notificationForm) {
    notificationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get email from form
      submittedEmail = notificationEmailInput.value;
      
      if (submittedEmail) {
        // The button will automatically show loading state due to data-bs-toggle="loading-button"
        
        // Simulate API call with a delay
        setTimeout(() => {
          // Show the email sent confirmation screen
          notificationInitial.classList.add('d-none');
          notificationSent.classList.remove('d-none');
          
          // In a real application, you would send an API request here
          console.log('Notification requested for:', submittedEmail);
        }, 1500); // 1.5 second delay
      }
    });
  }

  // Resend verification button handler
  if (resendVerificationBtn) {
    resendVerificationBtn.addEventListener('click', function() {
      // Get the button loading instance
      const loadingButton = LoadingButton.getInstance(resendVerificationBtn) || 
                            new LoadingButton(resendVerificationBtn);
      
      // Start loading animation
      loadingButton.start();
      
      // Simulate API call with a delay
      setTimeout(() => {
        // Stop loading animation
        loadingButton.stop();
        
        // Show success message (replace button text temporarily)
        const btnText = resendVerificationBtn.querySelector('.btn-text');
        const originalText = btnText.innerHTML;
        btnText.innerHTML = '<i class="bi bi-check-circle me-2"></i>Email Sent';
        
        // Reset button text after 3 seconds
        setTimeout(() => {
          btnText.innerHTML = originalText;
        }, 3000);
        
        // In a real application, you would resend the verification email here
        console.log('Verification email resent to:', submittedEmail);
      }, 1500); // 1.5 second delay
    });
  }
}); 