import { Alert } from "bootstrap";
import { delay } from "../utils";

export async function showReturnNotification(type: string, message: string) {
  const notificationPlaceholder = document.getHtmlElementById<HTMLElement>("returnNotificationPlaceholder");
  if (notificationPlaceholder) {
    // Create alert element
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = "alert";

    // Add icon based on type
    let icon = "";
    switch (type) {
      case "success":
        icon = '<i class="bi bi-check-circle-fill me-2"></i>';
        break;
      case "danger":
        icon = '<i class="bi bi-exclamation-circle-fill me-2"></i>';
        break;
      case "warning":
        icon = '<i class="bi bi-exclamation-triangle-fill me-2"></i>';
        break;
      case "info":
        icon = '<i class="bi bi-info-circle-fill me-2"></i>';
        break;
    }

    // Set alert content
    alert.innerHTML = `
        <div class="d-flex">
          ${icon}
          <div>${message}</div>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;

    // Clear previous alerts
    notificationPlaceholder.innerHTML = "";

    // Append the alert
    notificationPlaceholder.appendChild(alert);

    await delay(5000);

    const bsAlert = new Alert(alert);
    bsAlert.close();
  }
}
