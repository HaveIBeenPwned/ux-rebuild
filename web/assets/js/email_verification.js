document.addEventListener("DOMContentLoaded", function () {
  // Function to get URL parameters
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  // Get token from URL
  const token = getUrlParameter("token");
  const domain = getUrlParameter("domain");

  // Update domain name in the success message using the ID
  if (domain) {
    const domainElement = document.getElementById("domainName");
    if (domainElement) {
      domainElement.textContent = domain;
    }
  }

  // Handle different states based on token
  if (!token) {
    // No token provided
    document.getElementById("verificationSuccess").style.display = "none";
    document.getElementById("invalidToken").style.display = "block";
  }
});
