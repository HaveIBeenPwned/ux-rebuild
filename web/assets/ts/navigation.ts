/**
 * Initialize the navbar menu background toggle functionality
 */
export function initNavbarMenuToggle() {
  const navbar = document.querySelector<HTMLElement>(".navbar");
  const navbarToggler = document.querySelector<HTMLElement>(".navbar-toggler");
  const navbarCollapse = document.getElementById("navbarNav");

  if (navbar && navbarToggler && navbarCollapse) {
    // Toggle the menu-open class when the menu visibility changes
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          if (navbarCollapse.classList.contains("show")) {
            navbar.classList.add("menu-open");
          } else {
            navbar.classList.remove("menu-open");
          }
        }
      }
    });

    // Observe the navbar-collapse element for class changes
    observer.observe(navbarCollapse, { attributes: true });
  }
}
