import { delay } from "../utils";
import { showReturnNotification } from "./dashboard_utils";

export function setupNotificationToggle() {
  const notificationsSwitch = document.getHtmlElementById<HTMLInputElement>("notificationsSwitch");
  const notificationStatus = document.getHtmlElementById<HTMLElement>("notificationStatus");
  const notificationBadge = document.querySelector<HTMLElement>('a[href="#notifications"] .badge');

  if (notificationsSwitch && notificationStatus && notificationBadge) {
    // When the switch is toggled
    notificationsSwitch.addEventListener("change", async function () {
      try {
        await setNotificationStatus(this.checked);
        if (this.checked) {
          showReturnNotification("success", "Notifications enabled successfully.");
          notificationStatus.textContent = "On";
          notificationStatus.classList.remove("text-danger");
          notificationStatus.classList.add("text-success");
          notificationBadge.textContent = "On";
          notificationBadge.classList.remove("bg-danger");
          notificationBadge.classList.add("bg-success");
        } else {
          showReturnNotification("success", "Notifications disabled successfully.");
          notificationStatus.textContent = "Off";
          notificationStatus.classList.remove("text-success");
          notificationStatus.classList.add("text-danger");
          notificationBadge.textContent = "Off";
          notificationBadge.classList.remove("bg-success");
          notificationBadge.classList.add("bg-danger");
        }
      } catch (error) {
        showReturnNotification("danger", "Failed to update notification status.");
      }
    });
  }
}

async function setNotificationStatus(enabled: boolean) {
  await delay(1000); // Simulate a network request
  // 20% chance to fail
  if (Math.random() < 0.2) {
    throw new Error("Network error");
  }
}
